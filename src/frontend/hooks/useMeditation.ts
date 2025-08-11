import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import { useNetworkState } from './useAppState';
import { useAnalytics } from './useAnalytics';
import { useOfflineData } from './useOfflineData';
import { useUserProgress } from './useUserProgress';
import { useMeditationJournal } from './useMeditationJournal';
import { useSettings } from './useSettings';
import { useMeditationReminders } from './useNotificationSystem';

// Types for meditation
export interface MeditationTrack {
  id: string;
  title: string;
  description: string;
  audioUrl: string;
  imageUrl?: string;
  duration: number; // In seconds
  category: 'guided' | 'unguided' | 'music' | 'nature' | 'breathing' | 'body_scan' | 'loving_kindness' | 'mindfulness';
  tags: string[];
  author?: string;
  voiceGender?: 'male' | 'female' | 'neutral';
  backgroundMusic?: boolean;
  isFeatured: boolean;
  isPremium: boolean;
  level: 'beginner' | 'intermediate' | 'advanced';
  publishedDate: string; // ISO string
  lastUpdated: string; // ISO string
  playCount: number;
  favoriteCount: number;
  customData?: Record<string, any>;
}

export interface MeditationProgress {
  trackId: string;
  lastPlayedAt: string; // ISO string
  completedCount: number;
  totalPlayTime: number; // In seconds
  isFavorite: boolean;
  customData?: Record<string, any>;
}

export interface MeditationSession {
  id: string;
  trackId: string | null; // null for unguided meditation
  trackTitle?: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  duration: number; // In seconds
  completed: boolean;
  interrupted: boolean;
  moodBefore?: number; // 1-5 scale
  moodAfter?: number; // 1-5 scale
  notes?: string;
  customData?: Record<string, any>;
}

export interface MeditationTimer {
  duration: number; // In seconds
  remainingTime: number; // In seconds
  isRunning: boolean;
  intervalBells: number[]; // Array of times (in seconds) when bells should ring
  startBell: boolean;
  endBell: boolean;
  backgroundSound?: string; // URL or identifier for background sound
  backgroundSoundVolume: number; // 0-1
  bellVolume: number; // 0-1
}

// Storage keys
const MEDITATION_PROGRESS_STORAGE_KEY = 'zero_circle_meditation_progress';
const FAVORITE_TRACKS_STORAGE_KEY = 'zero_circle_favorite_tracks';
const MEDITATION_TIMER_SETTINGS_KEY = 'zero_circle_meditation_timer_settings';

/**
 * Hook for managing meditation tracks
 */
export const useMeditationTracks = () => {
  const [tracks, setTracks] = useState<MeditationTrack[]>([]);
  const [meditationProgress, setMeditationProgress] = useState<MeditationProgress[]>([]);
  const [favoriteTrackIds, setFavoriteTrackIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const { isConnected } = useNetworkState();
  const { trackCustomEvent } = useAnalytics();
  const { isContentAvailableOffline, downloadContent } = useOfflineData();
  const { updateMeditationStats } = useUserProgress();
  
  // Load meditation progress and favorites from storage on mount
  useEffect(() => {
    const loadMeditationProgress = async () => {
      try {
        const storedProgress = await AsyncStorage.getItem(MEDITATION_PROGRESS_STORAGE_KEY);
        
        if (storedProgress) {
          setMeditationProgress(JSON.parse(storedProgress));
        } else {
          // Initialize with empty array if none exist
          setMeditationProgress([]);
          await AsyncStorage.setItem(MEDITATION_PROGRESS_STORAGE_KEY, JSON.stringify([]));
        }
      } catch (err) {
        console.error('Failed to load meditation progress:', err);
      }
    };
    
    const loadFavoriteTracks = async () => {
      try {
        const storedFavorites = await AsyncStorage.getItem(FAVORITE_TRACKS_STORAGE_KEY);
        
        if (storedFavorites) {
          setFavoriteTrackIds(JSON.parse(storedFavorites));
        } else {
          // Initialize with empty array if none exist
          setFavoriteTrackIds([]);
          await AsyncStorage.setItem(FAVORITE_TRACKS_STORAGE_KEY, JSON.stringify([]));
        }
      } catch (err) {
        console.error('Failed to load favorite tracks:', err);
      }
    };
    
    const loadAllData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Load tracks from API
        await fetchTracks();
        
        // Load local data
        await Promise.all([
          loadMeditationProgress(),
          loadFavoriteTracks(),
        ]);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load meditation data'));
        console.error('Failed to load meditation data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAllData();
  }, []);
  
  // Save meditation progress to storage whenever it changes
  useEffect(() => {
    if (!isLoading && meditationProgress.length > 0) {
      const saveMeditationProgress = async () => {
        try {
          await AsyncStorage.setItem(MEDITATION_PROGRESS_STORAGE_KEY, JSON.stringify(meditationProgress));
        } catch (err) {
          console.error('Failed to save meditation progress:', err);
        }
      };
      
      saveMeditationProgress();
    }
  }, [meditationProgress, isLoading]);
  
  // Save favorite tracks to storage whenever they change
  useEffect(() => {
    if (!isLoading) {
      const saveFavoriteTracks = async () => {
        try {
          await AsyncStorage.setItem(FAVORITE_TRACKS_STORAGE_KEY, JSON.stringify(favoriteTrackIds));
        } catch (err) {
          console.error('Failed to save favorite tracks:', err);
        }
      };
      
      saveFavoriteTracks();
    }
  }, [favoriteTrackIds, isLoading]);
  
  // Fetch tracks from API
  const fetchTracks = useCallback(async () => {
    if (!isConnected) {
      return { success: false, error: 'No internet connection' };
    }
    
    try {
      // TODO: Implement actual API call to fetch tracks
      // For now, just simulate fetching with mock data
      console.log('Fetching meditation tracks from API');
      
      // Simulate API response delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock data for testing
      const mockTracks: MeditationTrack[] = [
        {
          id: 'track_1',
          title: 'Beginner Mindfulness Meditation',
          description: 'A gentle introduction to mindfulness meditation practice',
          audioUrl: 'https://example.com/audio/beginner_mindfulness.mp3',
          imageUrl: 'https://example.com/images/beginner_mindfulness.jpg',
          duration: 600, // 10 minutes
          category: 'guided',
          tags: ['beginner', 'mindfulness', 'introduction'],
          author: 'Sarah Johnson',
          voiceGender: 'female',
          backgroundMusic: true,
          isFeatured: true,
          isPremium: false,
          level: 'beginner',
          publishedDate: '2023-01-15T00:00:00Z',
          lastUpdated: '2023-01-15T00:00:00Z',
          playCount: 1250,
          favoriteCount: 320,
        },
        {
          id: 'track_2',
          title: 'Loving-Kindness Meditation',
          description: 'Develop compassion for yourself and others',
          audioUrl: 'https://example.com/audio/loving_kindness.mp3',
          imageUrl: 'https://example.com/images/loving_kindness.jpg',
          duration: 900, // 15 minutes
          category: 'loving_kindness',
          tags: ['compassion', 'metta', 'kindness'],
          author: 'Michael Chen',
          voiceGender: 'male',
          backgroundMusic: true,
          isFeatured: false,
          isPremium: false,
          level: 'beginner',
          publishedDate: '2023-02-10T00:00:00Z',
          lastUpdated: '2023-02-10T00:00:00Z',
          playCount: 980,
          favoriteCount: 245,
        },
        {
          id: 'track_3',
          title: 'Deep Relaxation Body Scan',
          description: 'Release tension and deeply relax your entire body',
          audioUrl: 'https://example.com/audio/body_scan.mp3',
          imageUrl: 'https://example.com/images/body_scan.jpg',
          duration: 1200, // 20 minutes
          category: 'body_scan',
          tags: ['relaxation', 'body scan', 'stress relief'],
          author: 'Emma Wilson',
          voiceGender: 'female',
          backgroundMusic: true,
          isFeatured: true,
          isPremium: true,
          level: 'intermediate',
          publishedDate: '2023-03-05T00:00:00Z',
          lastUpdated: '2023-03-05T00:00:00Z',
          playCount: 750,
          favoriteCount: 210,
        },
        {
          id: 'track_4',
          title: 'Peaceful Forest Sounds',
          description: 'Immerse yourself in the calming sounds of a forest',
          audioUrl: 'https://example.com/audio/forest_sounds.mp3',
          imageUrl: 'https://example.com/images/forest.jpg',
          duration: 1800, // 30 minutes
          category: 'nature',
          tags: ['nature', 'ambient', 'forest'],
          backgroundMusic: false,
          isFeatured: false,
          isPremium: false,
          level: 'beginner',
          publishedDate: '2023-04-20T00:00:00Z',
          lastUpdated: '2023-04-20T00:00:00Z',
          playCount: 620,
          favoriteCount: 180,
        },
        {
          id: 'track_5',
          title: 'Advanced Vipassana Meditation',
          description: 'Deep insight meditation practice for experienced meditators',
          audioUrl: 'https://example.com/audio/vipassana.mp3',
          imageUrl: 'https://example.com/images/vipassana.jpg',
          duration: 1800, // 30 minutes
          category: 'guided',
          tags: ['vipassana', 'insight', 'advanced'],
          author: 'Ajahn Brahm',
          voiceGender: 'male',
          backgroundMusic: false,
          isFeatured: true,
          isPremium: true,
          level: 'advanced',
          publishedDate: '2023-05-12T00:00:00Z',
          lastUpdated: '2023-05-12T00:00:00Z',
          playCount: 890,
          favoriteCount: 260,
        },
      ];
      
      setTracks(mockTracks);
      
      // Track tracks fetch
      trackCustomEvent('meditation_tracks_fetched', {
        count: mockTracks.length,
      });
      
      return { success: true, count: mockTracks.length };
    } catch (err) {
      console.error('Failed to fetch tracks:', err);
      return { success: false, error: err };
    }
  }, [isConnected, trackCustomEvent]);
  
  // Get track by ID
  const getTrackById = useCallback((id: string) => {
    return tracks.find(track => track.id === id) || null;
  }, [tracks]);
  
  // Get tracks by category
  const getTracksByCategory = useCallback((category: string) => {
    return tracks.filter(track => track.category === category);
  }, [tracks]);
  
  // Get tracks by level
  const getTracksByLevel = useCallback((level: string) => {
    return tracks.filter(track => track.level === level);
  }, [tracks]);
  
  // Get tracks by tags
  const getTracksByTags = useCallback((tags: string[]) => {
    return tracks.filter(track => {
      return tags.some(tag => track.tags.includes(tag));
    });
  }, [tracks]);
  
  // Get featured tracks
  const getFeaturedTracks = useCallback(() => {
    return tracks.filter(track => track.isFeatured);
  }, [tracks]);
  
  // Get premium tracks
  const getPremiumTracks = useCallback(() => {
    return tracks.filter(track => track.isPremium);
  }, [tracks]);
  
  // Get track progress
  const getTrackProgress = useCallback((trackId: string) => {
    return meditationProgress.find(progress => progress.trackId === trackId) || null;
  }, [meditationProgress]);
  
  // Update track progress
  const updateTrackProgress = useCallback((trackId: string, duration: number, completed: boolean) => {
    const now = new Date().toISOString();
    const track = getTrackById(trackId);
    
    if (!track) return null;
    
    setMeditationProgress(prevProgress => {
      const existingProgress = prevProgress.find(p => p.trackId === trackId);
      
      if (existingProgress) {
        // Update existing progress
        return prevProgress.map(p => {
          if (p.trackId === trackId) {
            return {
              ...p,
              lastPlayedAt: now,
              completedCount: completed ? p.completedCount + 1 : p.completedCount,
              totalPlayTime: p.totalPlayTime + duration,
            };
          }
          return p;
        });
      } else {
        // Create new progress entry
        return [
          ...prevProgress,
          {
            trackId,
            lastPlayedAt: now,
            completedCount: completed ? 1 : 0,
            totalPlayTime: duration,
            isFavorite: false,
          },
        ];
      }
    });
    
    // Update track play count (in a real app, this would be an API call)
    setTracks(prevTracks => {
      return prevTracks.map(t => {
        if (t.id === trackId) {
          return {
            ...t,
            playCount: t.playCount + 1,
          };
        }
        return t;
      });
    });
    
    // Update user progress stats if meditation was completed
    if (completed) {
      updateMeditationStats(duration / 60, 1); // Convert seconds to minutes
    }
    
    // Track progress update
    trackCustomEvent('meditation_progress_updated', {
      track_id: trackId,
      track_title: track.title,
      duration,
      completed,
    });
    
    return true;
  }, [getTrackById, tracks, updateMeditationStats, trackCustomEvent]);
  
  // Toggle favorite status
  const toggleFavorite = useCallback((trackId: string) => {
    const track = getTrackById(trackId);
    if (!track) return false;
    
    // Check if already favorited
    const isFavorite = favoriteTrackIds.includes(trackId);
    
    if (isFavorite) {
      // Remove from favorites
      setFavoriteTrackIds(prevIds => prevIds.filter(id => id !== trackId));
      
      // Update track favorite count
      setTracks(prevTracks => {
        return prevTracks.map(t => {
          if (t.id === trackId) {
            return {
              ...t,
              favoriteCount: Math.max(0, t.favoriteCount - 1),
            };
          }
          return t;
        });
      });
      
      // Update progress entry if exists
      setMeditationProgress(prevProgress => {
        return prevProgress.map(p => {
          if (p.trackId === trackId) {
            return {
              ...p,
              isFavorite: false,
            };
          }
          return p;
        });
      });
    } else {
      // Add to favorites
      setFavoriteTrackIds(prevIds => [...prevIds, trackId]);
      
      // Update track favorite count
      setTracks(prevTracks => {
        return prevTracks.map(t => {
          if (t.id === trackId) {
            return {
              ...t,
              favoriteCount: t.favoriteCount + 1,
            };
          }
          return t;
        });
      });
      
      // Update progress entry if exists
      setMeditationProgress(prevProgress => {
        const existingProgress = prevProgress.find(p => p.trackId === trackId);
        
        if (existingProgress) {
          return prevProgress.map(p => {
            if (p.trackId === trackId) {
              return {
                ...p,
                isFavorite: true,
              };
            }
            return p;
          });
        } else {
          // Create new progress entry
          return [
            ...prevProgress,
            {
              trackId,
              lastPlayedAt: new Date().toISOString(),
              completedCount: 0,
              totalPlayTime: 0,
              isFavorite: true,
            },
          ];
        }
      });
    }
    
    // Track favorite toggle
    trackCustomEvent('meditation_favorite_toggled', {
      track_id: trackId,
      track_title: track.title,
      is_favorite: !isFavorite,
    });
    
    return true;
  }, [favoriteTrackIds, getTrackById, tracks, trackCustomEvent]);
  
  // Check if track is favorited
  const isFavorite = useCallback((trackId: string) => {
    return favoriteTrackIds.includes(trackId);
  }, [favoriteTrackIds]);
  
  // Get favorite tracks
  const getFavoriteTracks = useCallback(() => {
    return tracks.filter(track => favoriteTrackIds.includes(track.id));
  }, [tracks, favoriteTrackIds]);
  
  // Get recently played tracks
  const getRecentlyPlayedTracks = useCallback(() => {
    // Sort progress by last played date (most recent first)
    const sortedProgress = [...meditationProgress].sort((a, b) => {
      return new Date(b.lastPlayedAt).getTime() - new Date(a.lastPlayedAt).getTime();
    });
    
    // Get track IDs from sorted progress
    const recentTrackIds = sortedProgress.map(progress => progress.trackId);
    
    // Get tracks in order of recency
    return recentTrackIds
      .map(id => getTrackById(id))
      .filter((track): track is MeditationTrack => track !== null);
  }, [meditationProgress, getTrackById]);
  
  // Get most played tracks
  const getMostPlayedTracks = useCallback(() => {
    // Sort progress by completed count (highest first)
    const sortedProgress = [...meditationProgress].sort((a, b) => {
      return b.completedCount - a.completedCount;
    });
    
    // Get track IDs from sorted progress
    const mostPlayedTrackIds = sortedProgress.map(progress => progress.trackId);
    
    // Get tracks in order of play count
    return mostPlayedTrackIds
      .map(id => getTrackById(id))
      .filter((track): track is MeditationTrack => track !== null);
  }, [meditationProgress, getTrackById]);
  
  // Download track for offline use
  const downloadTrackForOffline = useCallback(async (trackId: string) => {
    const track = getTrackById(trackId);
    if (!track) return { success: false, error: 'Track not found' };
    
    try {
      // Download track
      const result = await downloadContent({
        id: track.id,
        type: 'meditation_track',
        title: track.title,
        data: track,
        urls: [
          track.audioUrl,
          track.imageUrl,
        ].filter((url): url is string => !!url),
      });
      
      // Track download
      trackCustomEvent('meditation_track_downloaded', {
        track_id: trackId,
        track_title: track.title,
        success: result.success,
      });
      
      return result;
    } catch (err) {
      console.error('Failed to download track:', err);
      return { success: false, error: err };
    }
  }, [getTrackById, downloadContent, trackCustomEvent]);
  
  // Check if track is available offline
  const isTrackOffline = useCallback((trackId: string) => {
    return isContentAvailableOffline(trackId, 'meditation_track');
  }, [isContentAvailableOffline]);
  
  // Search tracks
  const searchTracks = useCallback((query: string) => {
    const lowerCaseQuery = query.toLowerCase();
    
    return tracks.filter(track => {
      return (
        track.title.toLowerCase().includes(lowerCaseQuery) ||
        track.description.toLowerCase().includes(lowerCaseQuery) ||
        track.tags.some(tag => tag.toLowerCase().includes(lowerCaseQuery)) ||
        (track.author && track.author.toLowerCase().includes(lowerCaseQuery))
      );
    });
  }, [tracks]);
  
  // Get all unique tags from tracks
  const getAllTags = useCallback(() => {
    const tagsSet = new Set<string>();
    
    tracks.forEach(track => {
      track.tags.forEach(tag => tagsSet.add(tag));
    });
    
    return Array.from(tagsSet).sort();
  }, [tracks]);
  
  // Get all unique categories from tracks
  const getAllCategories = useCallback(() => {
    const categoriesSet = new Set<string>();
    
    tracks.forEach(track => {
      categoriesSet.add(track.category);
    });
    
    return Array.from(categoriesSet).sort();
  }, [tracks]);
  
  // Get all unique authors from tracks
  const getAllAuthors = useCallback(() => {
    const authorsSet = new Set<string>();
    
    tracks.forEach(track => {
      if (track.author) {
        authorsSet.add(track.author);
      }
    });
    
    return Array.from(authorsSet).sort();
  }, [tracks]);
  
  // Get recommended tracks based on user's history
  const getRecommendedTracks = useCallback((limit: number = 5) => {
    // Get recently played tracks
    const recentTracks = getRecentlyPlayedTracks().slice(0, 10);
    
    if (recentTracks.length === 0) {
      // If no recent tracks, return featured tracks
      return getFeaturedTracks().slice(0, limit);
    }
    
    // Collect tags and categories from recent tracks
    const recentTags = new Set<string>();
    const recentCategories = new Set<string>();
    
    recentTracks.forEach(track => {
      track.tags.forEach(tag => recentTags.add(tag));
      recentCategories.add(track.category);
    });
    
    // Score each track based on relevance to recent activity
    const scoredTracks = tracks
      .filter(track => {
        // Filter out tracks that user has recently played
        const isRecent = recentTracks.some(rt => rt.id === track.id);
        return !isRecent;
      })
      .map(track => {
        let score = 0;
        
        // Score based on matching tags
        track.tags.forEach(tag => {
          if (recentTags.has(tag)) {
            score += 2;
          }
        });
        
        // Score based on matching category
        if (recentCategories.has(track.category)) {
          score += 3;
        }
        
        // Bonus for featured tracks
        if (track.isFeatured) {
          score += 1;
        }
        
        // Penalty for premium tracks (to balance recommendations)
        if (track.isPremium) {
          score -= 0.5;
        }
        
        return { track, score };
      });
    
    // Sort by score (highest first) and return tracks
    return scoredTracks
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.track);
  }, [tracks, getRecentlyPlayedTracks, getFeaturedTracks]);
  
  // Refresh tracks from API
  const refreshTracks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch tracks
      const result = await fetchTracks();
      
      return {
        success: result.success,
        count: result.success ? result.count : 0,
      };
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to refresh tracks'));
      console.error('Failed to refresh tracks:', err);
      return { success: false, error: err };
    } finally {
      setIsLoading(false);
    }
  }, [fetchTracks]);
  
  return {
    tracks,
    meditationProgress,
    isLoading,
    error,
    getTrackById,
    getTracksByCategory,
    getTracksByLevel,
    getTracksByTags,
    getFeaturedTracks,
    getPremiumTracks,
    getTrackProgress,
    updateTrackProgress,
    toggleFavorite,
    isFavorite,
    getFavoriteTracks,
    getRecentlyPlayedTracks,
    getMostPlayedTracks,
    downloadTrackForOffline,
    isTrackOffline,
    searchTracks,
    getAllTags,
    getAllCategories,
    getAllAuthors,
    getRecommendedTracks,
    refreshTracks,
  };
};

/**
 * Hook for managing meditation player
 */
export const useMeditationPlayer = () => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [volume, setVolume] = useState(1.0);
  const [rate, setRate] = useState(1.0);
  const [error, setError] = useState<Error | null>(null);
  
  const { getTrackById, updateTrackProgress, isTrackOffline } = useMeditationTracks();
  const { trackCustomEvent } = useAnalytics();
  const { createMeditationSession, updateMeditationSession } = useMeditationJournal();
  const { meditationSettings } = useSettings();
  
  // Session ID for tracking the current meditation session
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  
  // Clean up sound on unmount
  useEffect(() => {
    return () => {
      if (sound) {
        console.log('Unloading sound');
        sound.unloadAsync();
      }
    };
  }, [sound]);
  
  // Update position periodically when playing
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying) {
      interval = setInterval(async () => {
        if (sound) {
          try {
            const status = await sound.getStatusAsync();
            if (status.isLoaded) {
              setPosition(status.positionMillis / 1000); // Convert to seconds
            }
          } catch (err) {
            console.error('Failed to get sound status:', err);
          }
        }
      }, 1000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isPlaying, sound]);
  
  // Load track
  const loadTrack = useCallback(async (trackId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Unload previous sound if exists
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }
      
      // Get track
      const track = getTrackById(trackId);
      if (!track) {
        throw new Error(`Track with ID ${trackId} not found`);
      }
      
      // Check if track is available offline
      const isOffline = isTrackOffline(trackId);
      
      // TODO: In a real app, handle offline path vs online URL
      const audioUri = track.audioUrl;
      
      // Load sound
      console.log(`Loading track: ${track.title}`);
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { 
          volume,
          rate,
          shouldPlay: false,
          progressUpdateIntervalMillis: 1000,
        },
        (status) => {
          if (status.isLoaded) {
            setPosition(status.positionMillis / 1000); // Convert to seconds
            
            // Check if playback has ended
            if (status.didJustFinish) {
              handlePlaybackFinished();
            }
          }
        }
      );
      
      setSound(newSound);
      setCurrentTrackId(trackId);
      
      // Get duration
      const status = await newSound.getStatusAsync();
      if (status.isLoaded) {
        setDuration(status.durationMillis ? status.durationMillis / 1000 : track.duration);
      } else {
        setDuration(track.duration);
      }
      
      // Track load event
      trackCustomEvent('meditation_track_loaded', {
        track_id: trackId,
        track_title: track.title,
        track_duration: track.duration,
        is_offline: isOffline,
      });
      
      setIsLoading(false);
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load track');
      setError(error);
      console.error('Failed to load track:', err);
      setIsLoading(false);
      return false;
    }
  }, [sound, getTrackById, isTrackOffline, volume, rate, trackCustomEvent]);
  
  // Play
  const play = useCallback(async () => {
    try {
      if (!sound) {
        throw new Error('No track loaded');
      }
      
      await sound.playAsync();
      setIsPlaying(true);
      
      // Start session if not already started
      if (!sessionId) {
        const track = currentTrackId ? getTrackById(currentTrackId) : null;
        const startTime = new Date();
        
        // Create new session
        const newSessionId = await createMeditationSession({
          trackId: currentTrackId,
          trackTitle: track?.title,
          startTime: startTime.toISOString(),
          duration: 0, // Will be updated when session ends
          completed: false,
          interrupted: false,
        });
        
        setSessionId(newSessionId);
        setSessionStartTime(startTime);
        
        // Track session start
        trackCustomEvent('meditation_session_started', {
          session_id: newSessionId,
          track_id: currentTrackId,
          track_title: track?.title,
        });
      }
      
      // Track play event
      if (currentTrackId) {
        const track = getTrackById(currentTrackId);
        if (track) {
          trackCustomEvent('meditation_track_played', {
            track_id: currentTrackId,
            track_title: track.title,
            position: position,
          });
        }
      }
      
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to play track');
      setError(error);
      console.error('Failed to play track:', err);
      return false;
    }
  }, [sound, currentTrackId, sessionId, getTrackById, createMeditationSession, trackCustomEvent, position]);
  
  // Pause
  const pause = useCallback(async () => {
    try {
      if (!sound) {
        throw new Error('No track loaded');
      }
      
      await sound.pauseAsync();
      setIsPlaying(false);
      
      // Track pause event
      if (currentTrackId) {
        const track = getTrackById(currentTrackId);
        if (track) {
          trackCustomEvent('meditation_track_paused', {
            track_id: currentTrackId,
            track_title: track.title,
            position: position,
          });
        }
      }
      
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to pause track');
      setError(error);
      console.error('Failed to pause track:', err);
      return false;
    }
  }, [sound, currentTrackId, getTrackById, trackCustomEvent, position]);
  
  // Stop
  const stop = useCallback(async () => {
    try {
      if (!sound) {
        throw new Error('No track loaded');
      }
      
      await sound.stopAsync();
      await sound.setPositionAsync(0);
      setIsPlaying(false);
      setPosition(0);
      
      // End session if started
      if (sessionId && sessionStartTime) {
        handleSessionEnd(false, true);
      }
      
      // Track stop event
      if (currentTrackId) {
        const track = getTrackById(currentTrackId);
        if (track) {
          trackCustomEvent('meditation_track_stopped', {
            track_id: currentTrackId,
            track_title: track.title,
          });
        }
      }
      
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to stop track');
      setError(error);
      console.error('Failed to stop track:', err);
      return false;
    }
  }, [sound, currentTrackId, sessionId, sessionStartTime, getTrackById, trackCustomEvent]);
  
  // Seek to position
  const seekTo = useCallback(async (seconds: number) => {
    try {
      if (!sound) {
        throw new Error('No track loaded');
      }
      
      await sound.setPositionAsync(seconds * 1000); // Convert to milliseconds
      setPosition(seconds);
      
      // Track seek event
      if (currentTrackId) {
        const track = getTrackById(currentTrackId);
        if (track) {
          trackCustomEvent('meditation_track_seek', {
            track_id: currentTrackId,
            track_title: track.title,
            position: seconds,
          });
        }
      }
      
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to seek');
      setError(error);
      console.error('Failed to seek:', err);
      return false;
    }
  }, [sound, currentTrackId, getTrackById, trackCustomEvent]);
  
  // Set volume
  const setVolumeLevel = useCallback(async (level: number) => {
    try {
      const normalizedLevel = Math.max(0, Math.min(1, level));
      
      if (sound) {
        await sound.setVolumeAsync(normalizedLevel);
      }
      
      setVolume(normalizedLevel);
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to set volume');
      setError(error);
      console.error('Failed to set volume:', err);
      return false;
    }
  }, [sound]);
  
  // Set playback rate
  const setPlaybackRate = useCallback(async (newRate: number) => {
    try {
      // Limit rate to reasonable values (0.5x to 2.0x)
      const normalizedRate = Math.max(0.5, Math.min(2.0, newRate));
      
      if (sound) {
        await sound.setRateAsync(normalizedRate, true); // true = correct pitch
      }
      
      setRate(normalizedRate);
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to set playback rate');
      setError(error);
      console.error('Failed to set playback rate:', err);
      return false;
    }
  }, [sound]);
  
  // Handle playback finished
  const handlePlaybackFinished = useCallback(() => {
    setIsPlaying(false);
    setPosition(0);
    
    // End session if started
    if (sessionId && sessionStartTime && currentTrackId) {
      handleSessionEnd(true, false);
    }
    
    // Track completion event
    if (currentTrackId) {
      const track = getTrackById(currentTrackId);
      if (track) {
        trackCustomEvent('meditation_track_completed', {
          track_id: currentTrackId,
          track_title: track.title,
          duration: track.duration,
        });
        
        // Update track progress
        updateTrackProgress(currentTrackId, track.duration, true);
      }
    }
  }, [sessionId, sessionStartTime, currentTrackId, getTrackById, updateTrackProgress, trackCustomEvent]);
  
  // Handle session end
  const handleSessionEnd = useCallback((completed: boolean, interrupted: boolean) => {
    if (!sessionId || !sessionStartTime || !currentTrackId) return;
    
    const endTime = new Date();
    const durationMs = endTime.getTime() - sessionStartTime.getTime();
    const durationSeconds = Math.round(durationMs / 1000);
    
    // Update session
    updateMeditationSession(sessionId, {
      endTime: endTime.toISOString(),
      duration: durationSeconds,
      completed,
      interrupted,
    });
    
    // Track session end
    trackCustomEvent('meditation_session_ended', {
      session_id: sessionId,
      track_id: currentTrackId,
      duration: durationSeconds,
      completed,
      interrupted,
    });
    
    // Reset session tracking
    setSessionId(null);
    setSessionStartTime(null);
  }, [sessionId, sessionStartTime, currentTrackId, updateMeditationSession, trackCustomEvent]);
  
  // Get formatted position and duration
  const getFormattedTime = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);
  
  const formattedPosition = getFormattedTime(position);
  const formattedDuration = getFormattedTime(duration);
  
  // Get progress percentage
  const progressPercentage = duration > 0 ? (position / duration) * 100 : 0;
  
  return {
    currentTrackId,
    isPlaying,
    isLoading,
    duration,
    position,
    volume,
    rate,
    error,
    formattedPosition,
    formattedDuration,
    progressPercentage,
    loadTrack,
    play,
    pause,
    stop,
    seekTo,
    setVolumeLevel,
    setPlaybackRate,
  };
};

/**
 * Hook for managing meditation timer
 */
export const useMeditationTimer = () => {
  const [timerSettings, setTimerSettings] = useState<MeditationTimer>({
    duration: 600, // 10 minutes default
    remainingTime: 600,
    isRunning: false,
    intervalBells: [],
    startBell: true,
    endBell: true,
    backgroundSoundVolume: 0.5,
    bellVolume: 0.7,
  });
  
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [backgroundSound, setBackgroundSound] = useState<Audio.Sound | null>(null);
  const [bellSound, setBellSound] = useState<Audio.Sound | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const { trackCustomEvent } = useAnalytics();
  const { createMeditationSession, updateMeditationSession } = useMeditationJournal();
  const { updateMeditationStats } = useUserProgress();
  const { meditationSettings } = useSettings();
  
  // Session ID for tracking the current meditation session
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  
  // Load timer settings from storage on mount
  useEffect(() => {
    const loadTimerSettings = async () => {
      try {
        const storedSettings = await AsyncStorage.getItem(MEDITATION_TIMER_SETTINGS_KEY);
        
        if (storedSettings) {
          const parsedSettings = JSON.parse(storedSettings);
          setTimerSettings(prevSettings => ({
            ...prevSettings,
            ...parsedSettings,
            isRunning: false, // Always start with timer stopped
            remainingTime: parsedSettings.duration, // Reset remaining time
          }));
        }
      } catch (err) {
        console.error('Failed to load timer settings:', err);
      }
    };
    
    loadTimerSettings();
    loadSounds();
  }, []);
  
  // Save timer settings to storage when they change
  useEffect(() => {
    const saveTimerSettings = async () => {
      try {
        // Only save certain properties, not the running state
        const settingsToSave = {
          duration: timerSettings.duration,
          intervalBells: timerSettings.intervalBells,
          startBell: timerSettings.startBell,
          endBell: timerSettings.endBell,
          backgroundSound: timerSettings.backgroundSound,
          backgroundSoundVolume: timerSettings.backgroundSoundVolume,
          bellVolume: timerSettings.bellVolume,
        };
        
        await AsyncStorage.setItem(MEDITATION_TIMER_SETTINGS_KEY, JSON.stringify(settingsToSave));
      } catch (err) {
        console.error('Failed to save timer settings:', err);
      }
    };
    
    saveTimerSettings();
  }, [
    timerSettings.duration,
    timerSettings.intervalBells,
    timerSettings.startBell,
    timerSettings.endBell,
    timerSettings.backgroundSound,
    timerSettings.backgroundSoundVolume,
    timerSettings.bellVolume,
  ]);
  
  // Update timer every second when running
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (timerSettings.isRunning && timerSettings.remainingTime > 0) {
      interval = setInterval(() => {
        setTimerSettings(prevSettings => {
          const newRemainingTime = prevSettings.remainingTime - 1;
          
          // Check if we need to play interval bell
          if (prevSettings.intervalBells.includes(newRemainingTime)) {
            playBellSound();
          }
          
          // Check if timer has ended
          if (newRemainingTime <= 0) {
            handleTimerEnd();
            return {
              ...prevSettings,
              remainingTime: 0,
              isRunning: false,
            };
          }
          
          return {
            ...prevSettings,
            remainingTime: newRemainingTime,
          };
        });
      }, 1000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [timerSettings.isRunning, timerSettings.remainingTime, timerSettings.intervalBells]);
  
  // Clean up sounds on unmount
  useEffect(() => {
    return () => {
      if (backgroundSound) {
        backgroundSound.unloadAsync();
      }
      if (bellSound) {
        bellSound.unloadAsync();
      }
    };
  }, [backgroundSound, bellSound]);
  
  // Load sounds
  const loadSounds = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Load bell sound
      const { sound: newBellSound } = await Audio.Sound.createAsync(
        require('../../assets/sounds/meditation_bell.mp3'), // Adjust path as needed
        { volume: timerSettings.bellVolume }
      );
      
      setBellSound(newBellSound);
      
      // Load background sound if specified
      if (timerSettings.backgroundSound) {
        const { sound: newBackgroundSound } = await Audio.Sound.createAsync(
          { uri: timerSettings.backgroundSound },
          { 
            volume: timerSettings.backgroundSoundVolume,
            isLooping: true,
          }
        );
        
        setBackgroundSound(newBackgroundSound);
      }
      
      setIsLoading(false);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load sounds');
      setError(error);
      console.error('Failed to load sounds:', err);
      setIsLoading(false);
    }
  }, [timerSettings.bellVolume, timerSettings.backgroundSound, timerSettings.backgroundSoundVolume]);
  
  // Play bell sound
  const playBellSound = useCallback(async () => {
    if (bellSound) {
      try {
        await bellSound.setVolumeAsync(timerSettings.bellVolume);
        await bellSound.replayAsync();
      } catch (err) {
        console.error('Failed to play bell sound:', err);
      }
    }
  }, [bellSound, timerSettings.bellVolume]);
  
  // Start timer
  const startTimer = useCallback(async () => {
    try {
      // Play start bell if enabled
      if (timerSettings.startBell) {
        await playBellSound();
      }
      
      // Start background sound if available
      if (backgroundSound && timerSettings.backgroundSound) {
        await backgroundSound.setVolumeAsync(timerSettings.backgroundSoundVolume);
        await backgroundSound.playAsync();
      }
      
      // Start session
      const startTime = new Date();
      
      // Create new session
      const newSessionId = await createMeditationSession({
        trackId: null, // No track for timer meditation
        startTime: startTime.toISOString(),
        duration: 0, // Will be updated when session ends
        completed: false,
        interrupted: false,
      });
      
      setSessionId(newSessionId);
      setSessionStartTime(startTime);
      
      // Track session start
      trackCustomEvent('meditation_timer_started', {
        session_id: newSessionId,
        duration_set: timerSettings.duration,
        has_interval_bells: timerSettings.intervalBells.length > 0,
        has_background_sound: !!timerSettings.backgroundSound,
      });
      
      // Start timer
      setTimerSettings(prevSettings => ({
        ...prevSettings,
        isRunning: true,
      }));
      
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to start timer');
      setError(error);
      console.error('Failed to start timer:', err);
      return false;
    }
  }, [
    timerSettings.startBell,
    timerSettings.backgroundSound,
    timerSettings.backgroundSoundVolume,
    timerSettings.duration,
    timerSettings.intervalBells,
    backgroundSound,
    playBellSound,
    createMeditationSession,
    trackCustomEvent,
  ]);
  
  // Pause timer
  const pauseTimer = useCallback(async () => {
    try {
      // Pause background sound if playing
      if (backgroundSound) {
        await backgroundSound.pauseAsync();
      }
      
      // Pause timer
      setTimerSettings(prevSettings => ({
        ...prevSettings,
        isRunning: false,
      }));
      
      // Track pause event
      trackCustomEvent('meditation_timer_paused', {
        session_id: sessionId,
        remaining_time: timerSettings.remainingTime,
      });
      
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to pause timer');
      setError(error);
      console.error('Failed to pause timer:', err);
      return false;
    }
  }, [backgroundSound, sessionId, timerSettings.remainingTime, trackCustomEvent]);
  
  // Resume timer
  const resumeTimer = useCallback(async () => {
    try {
      // Resume background sound if available
      if (backgroundSound && timerSettings.backgroundSound) {
        await backgroundSound.playAsync();
      }
      
      // Resume timer
      setTimerSettings(prevSettings => ({
        ...prevSettings,
        isRunning: true,
      }));
      
      // Track resume event
      trackCustomEvent('meditation_timer_resumed', {
        session_id: sessionId,
        remaining_time: timerSettings.remainingTime,
      });
      
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to resume timer');
      setError(error);
      console.error('Failed to resume timer:', err);
      return false;
    }
  }, [backgroundSound, timerSettings.backgroundSound, sessionId, timerSettings.remainingTime, trackCustomEvent]);
  
  // Stop timer
  const stopTimer = useCallback(async () => {
    try {
      // Stop background sound if playing
      if (backgroundSound) {
        await backgroundSound.stopAsync();
      }
      
      // End session if started
      if (sessionId && sessionStartTime) {
        handleSessionEnd(false, true);
      }
      
      // Reset timer
      setTimerSettings(prevSettings => ({
        ...prevSettings,
        isRunning: false,
        remainingTime: prevSettings.duration,
      }));
      
      // Track stop event
      trackCustomEvent('meditation_timer_stopped', {
        session_id: sessionId,
      });
      
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to stop timer');
      setError(error);
      console.error('Failed to stop timer:', err);
      return false;
    }
  }, [backgroundSound, sessionId, sessionStartTime, trackCustomEvent]);
  
  // Handle timer end
  const handleTimerEnd = useCallback(async () => {
    try {
      // Play end bell if enabled
      if (timerSettings.endBell) {
        await playBellSound();
      }
      
      // Stop background sound if playing
      if (backgroundSound) {
        await backgroundSound.stopAsync();
      }
      
      // End session if started
      if (sessionId && sessionStartTime) {
        handleSessionEnd(true, false);
      }
      
      // Track timer completed event
      trackCustomEvent('meditation_timer_completed', {
        session_id: sessionId,
        duration: timerSettings.duration,
      });
      
      // Update meditation stats
      updateMeditationStats(timerSettings.duration / 60, 1); // Convert seconds to minutes
      
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to handle timer end');
      setError(error);
      console.error('Failed to handle timer end:', err);
      return false;
    }
  }, [
    timerSettings.endBell,
    timerSettings.duration,
    backgroundSound,
    sessionId,
    sessionStartTime,
    playBellSound,
    updateMeditationStats,
    trackCustomEvent,
  ]);
  
  // Handle session end
  const handleSessionEnd = useCallback((completed: boolean, interrupted: boolean) => {
    if (!sessionId || !sessionStartTime) return;
    
    const endTime = new Date();
    const durationMs = endTime.getTime() - sessionStartTime.getTime();
    const durationSeconds = Math.round(durationMs / 1000);
    
    // Update session
    updateMeditationSession(sessionId, {
      endTime: endTime.toISOString(),
      duration: durationSeconds,
      completed,
      interrupted,
    });
    
    // Track session end
    trackCustomEvent('meditation_session_ended', {
      session_id: sessionId,
      duration: durationSeconds,
      completed,
      interrupted,
      is_timer: true,
    });
    
    // Reset session tracking
    setSessionId(null);
    setSessionStartTime(null);
  }, [sessionId, sessionStartTime, updateMeditationSession, trackCustomEvent]);
  
  // Set timer duration
  const setDuration = useCallback((seconds: number) => {
    setTimerSettings(prevSettings => ({
      ...prevSettings,
      duration: seconds,
      remainingTime: prevSettings.isRunning ? prevSettings.remainingTime : seconds,
    }));
    
    // Track duration change
    trackCustomEvent('meditation_timer_duration_set', {
      duration: seconds,
    });
  }, [trackCustomEvent]);
  
  // Set interval bells
  const setIntervalBells = useCallback((intervals: number[]) => {
    setTimerSettings(prevSettings => ({
      ...prevSettings,
      intervalBells: intervals,
    }));
    
    // Track interval bells change
    trackCustomEvent('meditation_timer_intervals_set', {
      intervals: intervals,
      count: intervals.length,
    });
  }, [trackCustomEvent]);
  
  // Toggle start bell
  const toggleStartBell = useCallback(() => {
    setTimerSettings(prevSettings => ({
      ...prevSettings,
      startBell: !prevSettings.startBell,
    }));
  }, []);
  
  // Toggle end bell
  const toggleEndBell = useCallback(() => {
    setTimerSettings(prevSettings => ({
      ...prevSettings,
      endBell: !prevSettings.endBell,
    }));
  }, []);
  
  // Set background sound
  const setBackgroundSoundUri = useCallback(async (uri: string | undefined) => {
    try {
      // Unload previous background sound if exists
      if (backgroundSound) {
        await backgroundSound.unloadAsync();
        setBackgroundSound(null);
      }
      
      // Load new background sound if provided
      if (uri) {
        const { sound: newBackgroundSound } = await Audio.Sound.createAsync(
          { uri },
          { 
            volume: timerSettings.backgroundSoundVolume,
            isLooping: