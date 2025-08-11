import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNetworkState } from './useAppState';
import { useAnalytics } from './useAnalytics';

// Types for feedback
export interface FeedbackItem {
  id: string;
  type: 'rating' | 'suggestion' | 'bug' | 'content' | 'meditation' | 'other';
  rating?: number; // 1-5 stars
  text?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  synced: boolean;
}

export interface MeditationFeedback extends FeedbackItem {
  type: 'meditation';
  meditationId: string;
  meditationTitle: string;
  duration: number;
  completionRate: number;
}

export interface ContentFeedback extends FeedbackItem {
  type: 'content';
  contentId: string;
  contentTitle: string;
  contentType: string;
}

// Storage keys
const FEEDBACK_STORAGE_KEY = 'zero_circle_feedback';
const APP_RATING_PROMPT_KEY = 'zero_circle_app_rating_prompt';

/**
 * Hook for managing user feedback
 */
export const useFeedback = () => {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastRatingPrompt, setLastRatingPrompt] = useState<Date | null>(null);
  
  const { isConnected } = useNetworkState();
  const { trackCustomEvent } = useAnalytics();
  
  // Load feedback from storage on mount
  useEffect(() => {
    const loadFeedback = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const storedFeedback = await AsyncStorage.getItem(FEEDBACK_STORAGE_KEY);
        
        if (storedFeedback) {
          setFeedback(JSON.parse(storedFeedback));
        }
        
        const storedRatingPrompt = await AsyncStorage.getItem(APP_RATING_PROMPT_KEY);
        
        if (storedRatingPrompt) {
          setLastRatingPrompt(new Date(JSON.parse(storedRatingPrompt)));
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load feedback'));
        console.error('Failed to load feedback:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadFeedback();
  }, []);
  
  // Save feedback to storage whenever it changes
  useEffect(() => {
    if (!isLoading && feedback.length > 0) {
      const saveFeedback = async () => {
        try {
          await AsyncStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(feedback));
        } catch (err) {
          console.error('Failed to save feedback:', err);
        }
      };
      
      saveFeedback();
    }
  }, [feedback, isLoading]);
  
  // Submit feedback
  const submitFeedback = useCallback(async (
    type: FeedbackItem['type'],
    data: {
      rating?: number;
      text?: string;
      metadata?: Record<string, any>;
    }
  ) => {
    try {
      const newFeedback: FeedbackItem = {
        id: `feedback_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        type,
        rating: data.rating,
        text: data.text,
        metadata: data.metadata,
        createdAt: new Date().toISOString(),
        synced: false,
      };
      
      // Track feedback event
      trackCustomEvent('feedback_submitted', {
        feedback_type: type,
        rating: data.rating,
        has_text: !!data.text,
      });
      
      // Add to feedback list
      const updatedFeedback = [...feedback, newFeedback];
      setFeedback(updatedFeedback);
      
      // Try to sync immediately if connected
      if (isConnected) {
        await syncFeedback();
      }
      
      return newFeedback;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to submit feedback'));
      console.error('Failed to submit feedback:', err);
      throw err;
    }
  }, [feedback, isConnected, trackCustomEvent]);
  
  // Submit meditation feedback
  const submitMeditationFeedback = useCallback(async (
    meditationId: string,
    meditationTitle: string,
    duration: number,
    completionRate: number,
    rating: number,
    text?: string,
    metadata?: Record<string, any>
  ) => {
    try {
      const newFeedback: MeditationFeedback = {
        id: `meditation_feedback_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        type: 'meditation',
        meditationId,
        meditationTitle,
        duration,
        completionRate,
        rating,
        text,
        metadata,
        createdAt: new Date().toISOString(),
        synced: false,
      };
      
      // Track feedback event
      trackCustomEvent('meditation_feedback_submitted', {
        meditation_id: meditationId,
        duration,
        completion_rate: completionRate,
        rating,
        has_text: !!text,
      });
      
      // Add to feedback list
      const updatedFeedback = [...feedback, newFeedback];
      setFeedback(updatedFeedback);
      
      // Try to sync immediately if connected
      if (isConnected) {
        await syncFeedback();
      }
      
      return newFeedback;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to submit meditation feedback'));
      console.error('Failed to submit meditation feedback:', err);
      throw err;
    }
  }, [feedback, isConnected, trackCustomEvent]);
  
  // Submit content feedback
  const submitContentFeedback = useCallback(async (
    contentId: string,
    contentTitle: string,
    contentType: string,
    rating: number,
    text?: string,
    metadata?: Record<string, any>
  ) => {
    try {
      const newFeedback: ContentFeedback = {
        id: `content_feedback_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        type: 'content',
        contentId,
        contentTitle,
        contentType,
        rating,
        text,
        metadata,
        createdAt: new Date().toISOString(),
        synced: false,
      };
      
      // Track feedback event
      trackCustomEvent('content_feedback_submitted', {
        content_id: contentId,
        content_type: contentType,
        rating,
        has_text: !!text,
      });
      
      // Add to feedback list
      const updatedFeedback = [...feedback, newFeedback];
      setFeedback(updatedFeedback);
      
      // Try to sync immediately if connected
      if (isConnected) {
        await syncFeedback();
      }
      
      return newFeedback;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to submit content feedback'));
      console.error('Failed to submit content feedback:', err);
      throw err;
    }
  }, [feedback, isConnected, trackCustomEvent]);
  
  // Sync feedback with server
  const syncFeedback = useCallback(async () => {
    if (!isConnected || feedback.length === 0) {
      return { synced: 0, remaining: feedback.length };
    }
    
    try {
      const unsyncedFeedback = feedback.filter(item => !item.synced);
      
      if (unsyncedFeedback.length === 0) {
        return { synced: 0, remaining: 0 };
      }
      
      // TODO: Implement actual API call to send feedback to server
      // For now, just simulate sending feedback
      console.log(`Syncing ${unsyncedFeedback.length} feedback items to server`);
      
      // Mark feedback as synced
      const updatedFeedback = feedback.map(item => {
        if (!item.synced) {
          return { ...item, synced: true };
        }
        return item;
      });
      
      setFeedback(updatedFeedback);
      
      return { synced: unsyncedFeedback.length, remaining: 0 };
    } catch (err) {
      console.error('Failed to sync feedback:', err);
      return { synced: 0, remaining: feedback.filter(item => !item.synced).length, error: err };
    }
  }, [feedback, isConnected]);
  
  // Check if app rating should be prompted
  const shouldPromptAppRating = useCallback(() => {
    // Don't prompt if already prompted in the last 30 days
    if (lastRatingPrompt) {
      const daysSinceLastPrompt = (Date.now() - lastRatingPrompt.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceLastPrompt < 30) {
        return false;
      }
    }
    
    // Check if user has completed at least 5 meditations
    const meditationFeedback = feedback.filter(item => item.type === 'meditation');
    if (meditationFeedback.length < 5) {
      return false;
    }
    
    // Check if user has already rated the app
    const appRatings = feedback.filter(item => item.type === 'rating');
    if (appRatings.length > 0) {
      return false;
    }
    
    return true;
  }, [feedback, lastRatingPrompt]);
  
  // Mark app rating as prompted
  const markAppRatingPrompted = useCallback(async () => {
    try {
      const now = new Date();
      setLastRatingPrompt(now);
      await AsyncStorage.setItem(APP_RATING_PROMPT_KEY, JSON.stringify(now.toISOString()));
      return true;
    } catch (err) {
      console.error('Failed to mark app rating as prompted:', err);
      return false;
    }
  }, []);
  
  // Submit app rating
  const submitAppRating = useCallback(async (rating: number, text?: string) => {
    try {
      const result = await submitFeedback('rating', { rating, text });
      await markAppRatingPrompted();
      return result;
    } catch (err) {
      console.error('Failed to submit app rating:', err);
      throw err;
    }
  }, [submitFeedback, markAppRatingPrompted]);
  
  // Get feedback by type
  const getFeedbackByType = useCallback((type: FeedbackItem['type']) => {
    return feedback.filter(item => item.type === type);
  }, [feedback]);
  
  // Clear all feedback
  const clearAllFeedback = useCallback(async () => {
    try {
      setFeedback([]);
      await AsyncStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify([]));
      return true;
    } catch (err) {
      console.error('Failed to clear all feedback:', err);
      return false;
    }
  }, []);
  
  return {
    feedback,
    isLoading,
    error,
    submitFeedback,
    submitMeditationFeedback,
    submitContentFeedback,
    syncFeedback,
    shouldPromptAppRating,
    markAppRatingPrompted,
    submitAppRating,
    getFeedbackByType,
    clearAllFeedback,
  };
};

/**
 * Hook for managing meditation feedback
 */
export const useMeditationFeedback = () => {
  const {
    isLoading,
    error,
    submitMeditationFeedback,
    getFeedbackByType,
  } = useFeedback();
  
  const meditationFeedback = getFeedbackByType('meditation') as MeditationFeedback[];
  
  return {
    meditationFeedback,
    isLoading,
    error,
    submitMeditationFeedback,
  };
};

/**
 * Hook for managing content feedback
 */
export const useContentFeedback = () => {
  const {
    isLoading,
    error,
    submitContentFeedback,
    getFeedbackByType,
  } = useFeedback();
  
  const contentFeedback = getFeedbackByType('content') as ContentFeedback[];
  
  return {
    contentFeedback,
    isLoading,
    error,
    submitContentFeedback,
  };
};

/**
 * Hook for managing app rating
 */
export const useAppRating = () => {
  const {
    isLoading,
    error,
    shouldPromptAppRating,
    markAppRatingPrompted,
    submitAppRating,
    getFeedbackByType,
  } = useFeedback();
  
  const appRatings = getFeedbackByType('rating');
  
  return {
    appRatings,
    isLoading,
    error,
    shouldPromptAppRating,
    markAppRatingPrompted,
    submitAppRating,
  };
};