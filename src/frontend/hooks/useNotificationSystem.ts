import { useState, useEffect, useCallback, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSettings } from './useSettings';
import { useAnalytics } from './useAnalytics';
import { useAppState } from './useAppState';

// Types for notifications
export interface NotificationContent {
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: boolean;
  vibrate?: boolean | number[];
  priority?: Notifications.AndroidNotificationPriority;
  badge?: number;
  color?: string;
  icon?: string;
  categoryId?: string;
}

export interface ScheduledNotification {
  id: string;
  content: NotificationContent;
  trigger: Notifications.NotificationTriggerInput;
  type: 'meditation_reminder' | 'content_update' | 'streak' | 'custom';
}

// Storage keys
const NOTIFICATION_PERMISSION_KEY = 'zero_circle_notification_permission';
const SCHEDULED_NOTIFICATIONS_KEY = 'zero_circle_scheduled_notifications';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Hook for managing notifications
 */
export const useNotificationSystem = () => {
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
  const [permission, setPermission] = useState<Notifications.PermissionStatus | null>(null);
  const [scheduledNotifications, setScheduledNotifications] = useState<ScheduledNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();
  
  const { settings } = useSettings();
  const { trackNotificationReceived, trackNotificationOpened } = useAnalytics();
  const { appState } = useAppState();
  
  // Initialize notifications on mount
  useEffect(() => {
    const initNotifications = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Load stored permission status
        const storedPermission = await AsyncStorage.getItem(NOTIFICATION_PERMISSION_KEY);
        if (storedPermission) {
          setPermission(JSON.parse(storedPermission));
        }
        
        // Load scheduled notifications
        const storedNotifications = await AsyncStorage.getItem(SCHEDULED_NOTIFICATIONS_KEY);
        if (storedNotifications) {
          setScheduledNotifications(JSON.parse(storedNotifications));
        }
        
        // Register for push notifications if enabled
        if (settings.notificationsEnabled) {
          await registerForPushNotifications();
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to initialize notifications'));
        console.error('Failed to initialize notifications:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    initNotifications();
    
    // Set up notification listeners
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      const { identifier, request, date } = notification;
      
      // Track notification received
      trackNotificationReceived(
        identifier,
        request.content.data?.type || 'unknown',
        {
          title: request.content.title,
          body: request.content.body,
          date: date.toISOString(),
          data: request.content.data,
        }
      );
    });
    
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const { notification, actionIdentifier } = response;
      
      // Track notification opened
      trackNotificationOpened(
        notification.request.identifier,
        notification.request.content.data?.type || 'unknown',
        {
          title: notification.request.content.title,
          body: notification.request.content.body,
          action: actionIdentifier,
          data: notification.request.content.data,
        }
      );
      
      // Handle notification response
      handleNotificationResponse(response);
    });
    
    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [settings.notificationsEnabled]);
  
  // Save scheduled notifications to storage whenever they change
  useEffect(() => {
    if (!isLoading) {
      const saveNotifications = async () => {
        try {
          await AsyncStorage.setItem(SCHEDULED_NOTIFICATIONS_KEY, JSON.stringify(scheduledNotifications));
        } catch (err) {
          console.error('Failed to save scheduled notifications:', err);
        }
      };
      
      saveNotifications();
    }
  }, [scheduledNotifications, isLoading]);
  
  // Update badge count when app comes to foreground
  useEffect(() => {
    if (appState === 'active') {
      Notifications.setBadgeCountAsync(0).catch(console.error);
    }
  }, [appState]);
  
  // Register for push notifications
  const registerForPushNotifications = useCallback(async () => {
    if (!Device.isDevice) {
      setError(new Error('Push notifications are not supported in the simulator'));
      return null;
    }
    
    try {
      // Request permission
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      // Save permission status
      setPermission(finalStatus);
      await AsyncStorage.setItem(NOTIFICATION_PERMISSION_KEY, JSON.stringify(finalStatus));
      
      if (finalStatus !== 'granted') {
        return null;
      }
      
      // Get push token
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
      });
      
      setExpoPushToken(token.data);
      
      // Configure for Android
      if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
        
        // Create meditation channel
        Notifications.setNotificationChannelAsync('meditation', {
          name: 'Meditation Reminders',
          description: 'Reminders for your daily meditation practice',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#5F9EA0',
          sound: 'meditation_bell.wav', // Custom sound file in android/app/src/main/res/raw/
        });
        
        // Create content channel
        Notifications.setNotificationChannelAsync('content', {
          name: 'Content Updates',
          description: 'Updates about new content and features',
          importance: Notifications.AndroidImportance.DEFAULT,
        });
      }
      
      return token.data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to register for push notifications'));
      console.error('Failed to register for push notifications:', err);
      return null;
    }
  }, []);
  
  // Handle notification response
  const handleNotificationResponse = useCallback((response: Notifications.NotificationResponse) => {
    const { notification, actionIdentifier } = response;
    const data = notification.request.content.data;
    
    // Handle different notification types
    if (data?.type === 'meditation_reminder') {
      // TODO: Navigate to meditation screen
      console.log('Navigate to meditation screen');
    } else if (data?.type === 'content_update') {
      // TODO: Navigate to content screen
      console.log('Navigate to content screen', data.contentId);
    } else if (data?.type === 'streak') {
      // TODO: Navigate to stats screen
      console.log('Navigate to stats screen');
    }
    
    // Handle notification actions
    if (actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER) {
      // Default action (notification tapped)
      console.log('Notification tapped');
    } else {
      // Custom action
      console.log('Custom action:', actionIdentifier);
    }
  }, []);
  
  // Schedule a local notification
  const scheduleNotification = useCallback(async (
    content: NotificationContent,
    trigger: Notifications.NotificationTriggerInput,
    type: ScheduledNotification['type'] = 'custom',
    id?: string
  ) => {
    if (!settings.notificationsEnabled) {
      return null;
    }
    
    try {
      // Add type to notification data
      const notificationContent: Notifications.NotificationContentInput = {
        ...content,
        data: {
          ...content.data,
          type,
        },
      };
      
      // Set channel ID for Android
      if (Platform.OS === 'android') {
        if (type === 'meditation_reminder') {
          notificationContent.channelId = 'meditation';
        } else if (type === 'content_update') {
          notificationContent.channelId = 'content';
        }
      }
      
      // Schedule the notification
      const notificationId = id || `notification_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      const identifier = await Notifications.scheduleNotificationAsync({
        content: notificationContent,
        trigger,
        identifier: notificationId,
      });
      
      // Save scheduled notification
      const newNotification: ScheduledNotification = {
        id: identifier,
        content,
        trigger,
        type,
      };
      
      setScheduledNotifications(prev => [...prev, newNotification]);
      
      return identifier;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to schedule notification'));
      console.error('Failed to schedule notification:', err);
      return null;
    }
  }, [settings.notificationsEnabled]);
  
  // Schedule a meditation reminder
  const scheduleMeditationReminder = useCallback(async (
    time: { hour: number; minute: number },
    days: number[] = [1, 2, 3, 4, 5, 6, 7], // 1 = Monday, 7 = Sunday
    message?: string
  ) => {
    if (!settings.meditationReminders) {
      return null;
    }
    
    try {
      // Cancel existing meditation reminders
      await cancelNotificationsByType('meditation_reminder');
      
      const identifiers: string[] = [];
      
      // Schedule a reminder for each day
      for (const day of days) {
        const trigger: Notifications.DailyTriggerInput = {
          hour: time.hour,
          minute: time.minute,
          repeats: true,
          weekday: day,
        };
        
        const content: NotificationContent = {
          title: 'Time to Meditate',
          body: message || 'Take a moment to practice mindfulness and find peace in your day.',
          sound: true,
          vibrate: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          data: {
            screen: 'Meditation',
          },
        };
        
        const id = `meditation_reminder_${day}`;
        const identifier = await scheduleNotification(content, trigger, 'meditation_reminder', id);
        
        if (identifier) {
          identifiers.push(identifier);
        }
      }
      
      return identifiers;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to schedule meditation reminder'));
      console.error('Failed to schedule meditation reminder:', err);
      return null;
    }
  }, [settings.meditationReminders, scheduleNotification]);
  
  // Cancel a notification by ID
  const cancelNotification = useCallback(async (id: string) => {
    try {
      await Notifications.cancelScheduledNotificationAsync(id);
      
      // Remove from scheduled notifications
      setScheduledNotifications(prev => prev.filter(notification => notification.id !== id));
      
      return true;
    } catch (err) {
      console.error('Failed to cancel notification:', err);
      return false;
    }
  }, []);
  
  // Cancel notifications by type
  const cancelNotificationsByType = useCallback(async (type: ScheduledNotification['type']) => {
    try {
      const notificationsToCancel = scheduledNotifications.filter(notification => notification.type === type);
      
      for (const notification of notificationsToCancel) {
        await Notifications.cancelScheduledNotificationAsync(notification.id);
      }
      
      // Remove from scheduled notifications
      setScheduledNotifications(prev => prev.filter(notification => notification.type !== type));
      
      return notificationsToCancel.length;
    } catch (err) {
      console.error(`Failed to cancel ${type} notifications:`, err);
      return 0;
    }
  }, [scheduledNotifications]);
  
  // Cancel all scheduled notifications
  const cancelAllNotifications = useCallback(async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      setScheduledNotifications([]);
      return true;
    } catch (err) {
      console.error('Failed to cancel all notifications:', err);
      return false;
    }
  }, []);
  
  // Get all scheduled notifications
  const getScheduledNotifications = useCallback(async () => {
    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      return notifications;
    } catch (err) {
      console.error('Failed to get scheduled notifications:', err);
      return [];
    }
  }, []);
  
  // Send an immediate notification
  const sendImmediateNotification = useCallback(async (content: NotificationContent) => {
    if (!settings.notificationsEnabled) {
      return null;
    }
    
    try {
      const notificationId = `immediate_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      await Notifications.presentNotificationAsync({
        ...content,
        data: {
          ...content.data,
          type: 'custom',
        },
        identifier: notificationId,
      });
      
      return notificationId;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to send immediate notification'));
      console.error('Failed to send immediate notification:', err);
      return null;
    }
  }, [settings.notificationsEnabled]);
  
  // Check if notifications are enabled
  const areNotificationsEnabled = useCallback(async () => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status === 'granted' && settings.notificationsEnabled;
    } catch (err) {
      console.error('Failed to check if notifications are enabled:', err);
      return false;
    }
  }, [settings.notificationsEnabled]);
  
  return {
    expoPushToken,
    permission,
    scheduledNotifications,
    isLoading,
    error,
    registerForPushNotifications,
    scheduleNotification,
    scheduleMeditationReminder,
    cancelNotification,
    cancelNotificationsByType,
    cancelAllNotifications,
    getScheduledNotifications,
    sendImmediateNotification,
    areNotificationsEnabled,
  };
};

/**
 * Hook for managing meditation reminders
 */
export const useMeditationReminders = () => {
  const { settings, updateSetting } = useSettings();
  const {
    scheduleMeditationReminder,
    cancelNotificationsByType,
    isLoading,
    error,
  } = useNotificationSystem();
  
  // Parse reminder time string to hour and minute
  const parseReminderTime = (timeString: string) => {
    const [hour, minute] = timeString.split(':').map(Number);
    return { hour, minute };
  };
  
  // Schedule reminders based on settings
  const updateReminders = useCallback(async () => {
    if (settings.meditationReminders) {
      const time = parseReminderTime(settings.reminderTime);
      return await scheduleMeditationReminder(time);
    } else {
      return await cancelNotificationsByType('meditation_reminder');
    }
  }, [settings.meditationReminders, settings.reminderTime, scheduleMeditationReminder, cancelNotificationsByType]);
  
  // Toggle meditation reminders
  const toggleMeditationReminders = useCallback(async (enabled: boolean) => {
    updateSetting('meditationReminders', enabled);
    
    if (enabled) {
      const time = parseReminderTime(settings.reminderTime);
      return await scheduleMeditationReminder(time);
    } else {
      return await cancelNotificationsByType('meditation_reminder');
    }
  }, [settings.reminderTime, updateSetting, scheduleMeditationReminder, cancelNotificationsByType]);
  
  // Set reminder time
  const setReminderTime = useCallback(async (timeString: string) => {
    updateSetting('reminderTime', timeString);
    
    if (settings.meditationReminders) {
      const time = parseReminderTime(timeString);
      return await scheduleMeditationReminder(time);
    }
    
    return null;
  }, [settings.meditationReminders, updateSetting, scheduleMeditationReminder]);
  
  return {
    meditationReminders: settings.meditationReminders,
    reminderTime: settings.reminderTime,
    isLoading,
    error,
    toggleMeditationReminders,
    setReminderTime,
    updateReminders,
  };
};