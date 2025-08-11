import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import { useNetworkState, useAppState } from './useAppState';
import { useSettings } from './useSettings';

// Types for analytics events
export type AnalyticsEventType =
  | 'app_open'
  | 'app_close'
  | 'screen_view'
  | 'meditation_start'
  | 'meditation_complete'
  | 'meditation_pause'
  | 'content_view'
  | 'content_complete'
  | 'content_favorite'
  | 'content_unfavorite'
  | 'search'
  | 'download'
  | 'error'
  | 'login'
  | 'logout'
  | 'register'
  | 'settings_change'
  | 'notification_received'
  | 'notification_opened'
  | 'custom';

export interface AnalyticsEvent {
  id: string;
  type: AnalyticsEventType;
  timestamp: string;
  properties: Record<string, any>;
  sessionId: string;
}

// Storage keys
const ANALYTICS_EVENTS_KEY = 'zero_circle_analytics_events';
const ANALYTICS_SESSION_KEY = 'zero_circle_analytics_session';

/**
 * Hook for tracking analytics events
 */
export const useAnalytics = () => {
  const [sessionId, setSessionId] = useState<string>('');
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const { isConnected } = useNetworkState();
  const { appState } = useAppState();
  const { settings } = useSettings();
  
  // Initialize or restore session on mount
  useEffect(() => {
    const initSession = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Try to restore existing session
        const storedSession = await AsyncStorage.getItem(ANALYTICS_SESSION_KEY);
        
        if (storedSession) {
          setSessionId(storedSession);
        } else {
          // Create new session ID
          const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
          setSessionId(newSessionId);
          await AsyncStorage.setItem(ANALYTICS_SESSION_KEY, newSessionId);
        }
        
        // Load stored events
        const storedEvents = await AsyncStorage.getItem(ANALYTICS_EVENTS_KEY);
        
        if (storedEvents) {
          setEvents(JSON.parse(storedEvents));
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to initialize analytics session'));
        console.error('Failed to initialize analytics session:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    initSession();
  }, []);
  
  // Save events to storage whenever they change
  useEffect(() => {
    if (!isLoading && events.length > 0) {
      const saveEvents = async () => {
        try {
          await AsyncStorage.setItem(ANALYTICS_EVENTS_KEY, JSON.stringify(events));
        } catch (err) {
          console.error('Failed to save analytics events:', err);
        }
      };
      
      saveEvents();
    }
  }, [events, isLoading]);
  
  // Track app state changes
  useEffect(() => {
    if (!isLoading && sessionId && settings.shareUsageData) {
      if (appState === 'active') {
        // App came to foreground
        trackEvent('app_open', {});
      } else if (appState === 'background') {
        // App went to background
        trackEvent('app_close', {});
      }
    }
  }, [appState, isLoading, sessionId, settings.shareUsageData]);
  
  // Function to track an event
  const trackEvent = useCallback(
    (type: AnalyticsEventType, properties: Record<string, any> = {}) => {
      if (!settings.shareUsageData || !sessionId) {
        return;
      }
      
      const newEvent: AnalyticsEvent = {
        id: `event_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        type,
        timestamp: new Date().toISOString(),
        properties: {
          ...properties,
          platform: Platform.OS,
          deviceModel: Device.modelName || 'unknown',
          osVersion: Platform.Version,
          appState,
        },
        sessionId,
      };
      
      setEvents(prevEvents => [...prevEvents, newEvent]);
      
      // If connected, try to send events immediately
      if (isConnected) {
        sendEvents().catch(console.error);
      }
      
      return newEvent;
    },
    [sessionId, appState, isConnected, settings.shareUsageData]
  );
  
  // Track screen view
  const trackScreenView = useCallback(
    (screenName: string, screenProps: Record<string, any> = {}) => {
      return trackEvent('screen_view', {
        screen_name: screenName,
        ...screenProps,
      });
    },
    [trackEvent]
  );
  
  // Track meditation events
  const trackMeditationStart = useCallback(
    (meditationId: string, duration: number, properties: Record<string, any> = {}) => {
      return trackEvent('meditation_start', {
        meditation_id: meditationId,
        duration,
        ...properties,
      });
    },
    [trackEvent]
  );
  
  const trackMeditationComplete = useCallback(
    (meditationId: string, duration: number, actualDuration: number, properties: Record<string, any> = {}) => {
      return trackEvent('meditation_complete', {
        meditation_id: meditationId,
        duration,
        actual_duration: actualDuration,
        completion_rate: Math.min(1, actualDuration / duration),
        ...properties,
      });
    },
    [trackEvent]
  );
  
  const trackMeditationPause = useCallback(
    (meditationId: string, elapsedTime: number, properties: Record<string, any> = {}) => {
      return trackEvent('meditation_pause', {
        meditation_id: meditationId,
        elapsed_time: elapsedTime,
        ...properties,
      });
    },
    [trackEvent]
  );
  
  // Track content events
  const trackContentView = useCallback(
    (contentId: string, contentType: string, properties: Record<string, any> = {}) => {
      return trackEvent('content_view', {
        content_id: contentId,
        content_type: contentType,
        ...properties,
      });
    },
    [trackEvent]
  );
  
  const trackContentComplete = useCallback(
    (contentId: string, contentType: string, properties: Record<string, any> = {}) => {
      return trackEvent('content_complete', {
        content_id: contentId,
        content_type: contentType,
        ...properties,
      });
    },
    [trackEvent]
  );
  
  const trackContentFavorite = useCallback(
    (contentId: string, contentType: string, properties: Record<string, any> = {}) => {
      return trackEvent('content_favorite', {
        content_id: contentId,
        content_type: contentType,
        ...properties,
      });
    },
    [trackEvent]
  );
  
  const trackContentUnfavorite = useCallback(
    (contentId: string, contentType: string, properties: Record<string, any> = {}) => {
      return trackEvent('content_unfavorite', {
        content_id: contentId,
        content_type: contentType,
        ...properties,
      });
    },
    [trackEvent]
  );
  
  // Track search
  const trackSearch = useCallback(
    (query: string, resultCount: number, properties: Record<string, any> = {}) => {
      return trackEvent('search', {
        query,
        result_count: resultCount,
        ...properties,
      });
    },
    [trackEvent]
  );
  
  // Track download
  const trackDownload = useCallback(
    (contentId: string, contentType: string, size: number, properties: Record<string, any> = {}) => {
      return trackEvent('download', {
        content_id: contentId,
        content_type: contentType,
        size,
        ...properties,
      });
    },
    [trackEvent]
  );
  
  // Track error
  const trackError = useCallback(
    (errorMessage: string, errorCode?: string, properties: Record<string, any> = {}) => {
      return trackEvent('error', {
        error_message: errorMessage,
        error_code: errorCode,
        ...properties,
      });
    },
    [trackEvent]
  );
  
  // Track authentication events
  const trackLogin = useCallback(
    (method: string, properties: Record<string, any> = {}) => {
      return trackEvent('login', {
        method,
        ...properties,
      });
    },
    [trackEvent]
  );
  
  const trackLogout = useCallback(
    (properties: Record<string, any> = {}) => {
      return trackEvent('logout', properties);
    },
    [trackEvent]
  );
  
  const trackRegister = useCallback(
    (method: string, properties: Record<string, any> = {}) => {
      return trackEvent('register', {
        method,
        ...properties,
      });
    },
    [trackEvent]
  );
  
  // Track settings change
  const trackSettingsChange = useCallback(
    (settingName: string, oldValue: any, newValue: any, properties: Record<string, any> = {}) => {
      return trackEvent('settings_change', {
        setting_name: settingName,
        old_value: oldValue,
        new_value: newValue,
        ...properties,
      });
    },
    [trackEvent]
  );
  
  // Track notification events
  const trackNotificationReceived = useCallback(
    (notificationId: string, notificationType: string, properties: Record<string, any> = {}) => {
      return trackEvent('notification_received', {
        notification_id: notificationId,
        notification_type: notificationType,
        ...properties,
      });
    },
    [trackEvent]
  );
  
  const trackNotificationOpened = useCallback(
    (notificationId: string, notificationType: string, properties: Record<string, any> = {}) => {
      return trackEvent('notification_opened', {
        notification_id: notificationId,
        notification_type: notificationType,
        ...properties,
      });
    },
    [trackEvent]
  );
  
  // Track custom event
  const trackCustomEvent = useCallback(
    (eventName: string, properties: Record<string, any> = {}) => {
      return trackEvent('custom', {
        event_name: eventName,
        ...properties,
      });
    },
    [trackEvent]
  );
  
  // Send events to server
  const sendEvents = useCallback(async () => {
    if (!isConnected || events.length === 0 || !settings.shareUsageData) {
      return { sent: 0, remaining: events.length };
    }
    
    try {
      // TODO: Implement actual API call to send events to server
      // For now, just simulate sending events
      console.log(`Sending ${events.length} analytics events to server`);
      
      // Clear sent events
      setEvents([]);
      await AsyncStorage.setItem(ANALYTICS_EVENTS_KEY, JSON.stringify([]));
      
      return { sent: events.length, remaining: 0 };
    } catch (err) {
      console.error('Failed to send analytics events:', err);
      return { sent: 0, remaining: events.length, error: err };
    }
  }, [events, isConnected, settings.shareUsageData]);
  
  // Clear all events
  const clearEvents = useCallback(async () => {
    try {
      setEvents([]);
      await AsyncStorage.setItem(ANALYTICS_EVENTS_KEY, JSON.stringify([]));
      return true;
    } catch (err) {
      console.error('Failed to clear analytics events:', err);
      return false;
    }
  }, []);
  
  // Reset session
  const resetSession = useCallback(async () => {
    try {
      // Create new session ID
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      setSessionId(newSessionId);
      await AsyncStorage.setItem(ANALYTICS_SESSION_KEY, newSessionId);
      return true;
    } catch (err) {
      console.error('Failed to reset analytics session:', err);
      return false;
    }
  }, []);
  
  return {
    sessionId,
    events,
    isLoading,
    error,
    trackEvent,
    trackScreenView,
    trackMeditationStart,
    trackMeditationComplete,
    trackMeditationPause,
    trackContentView,
    trackContentComplete,
    trackContentFavorite,
    trackContentUnfavorite,
    trackSearch,
    trackDownload,
    trackError,
    trackLogin,
    trackLogout,
    trackRegister,
    trackSettingsChange,
    trackNotificationReceived,
    trackNotificationOpened,
    trackCustomEvent,
    sendEvents,
    clearEvents,
    resetSession,
  };
};

/**
 * Hook for tracking meditation analytics
 */
export const useMeditationAnalytics = () => {
  const {
    trackMeditationStart,
    trackMeditationComplete,
    trackMeditationPause,
  } = useAnalytics();
  
  return {
    trackMeditationStart,
    trackMeditationComplete,
    trackMeditationPause,
  };
};

/**
 * Hook for tracking content analytics
 */
export const useContentAnalytics = () => {
  const {
    trackContentView,
    trackContentComplete,
    trackContentFavorite,
    trackContentUnfavorite,
  } = useAnalytics();
  
  return {
    trackContentView,
    trackContentComplete,
    trackContentFavorite,
    trackContentUnfavorite,
  };
};

/**
 * Hook for tracking navigation analytics
 */
export const useNavigationAnalytics = () => {
  const { trackScreenView } = useAnalytics();
  
  return {
    trackScreenView,
  };
};