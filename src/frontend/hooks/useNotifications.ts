import { useState, useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/userService';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

type ScheduleNotificationProps = {
  title: string;
  body: string;
  data?: Record<string, unknown>;
  trigger: Notifications.NotificationTriggerInput;
};

export const useNotifications = () => {
  const [expoPushToken, setExpoPushToken] = useState<string>('');
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();
  const { user } = useAuth();

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      if (token) {
        setExpoPushToken(token);
      }
    });

    // Listen for incoming notifications
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    // Listen for user interaction with notifications
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const { notification } = response;
      const data = notification.request.content.data;
      
      // Handle notification response based on data
      handleNotificationResponse(data);
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  // Update notification settings when user changes
  useEffect(() => {
    if (user?.id) {
      syncNotificationSettings(user.id);
    }
  }, [user]);

  // Register for push notifications
  const registerForPushNotificationsAsync = async () => {
    let token;
    
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
      }
      
      token = (await Notifications.getExpoPushTokenAsync()).data;
    } else {
      console.log('Must use physical device for Push Notifications');
    }

    return token;
  };

  // Sync notification settings with user preferences
  const syncNotificationSettings = async (userId: string) => {
    try {
      const settings = await userService.getUserSettings(userId);
      
      if (!settings.notifications) {
        // If notifications are disabled, cancel all scheduled notifications
        await Notifications.cancelAllScheduledNotificationsAsync();
      }
    } catch (error) {
      console.error('Error syncing notification settings:', error);
    }
  };

  // Handle notification response
  const handleNotificationResponse = (data: any) => {
    // Handle different notification types based on data
    if (data?.type === 'meditation_reminder') {
      // Navigate to meditation screen or show meditation dialog
      console.log('Meditation reminder clicked');
    } else if (data?.type === 'content_update') {
      // Navigate to content screen
      console.log('Content update clicked');
    }
  };

  // Schedule a notification
  const scheduleNotification = async ({ title, body, data = {}, trigger }: ScheduleNotificationProps) => {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
        },
        trigger,
      });
      
      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  };

  // Schedule a daily meditation reminder
  const scheduleDailyReminder = async (hour: number, minute: number, title: string, body: string) => {
    try {
      // Cancel any existing daily reminders
      await cancelNotificationsByType('meditation_reminder');
      
      // Schedule new daily reminder
      return await scheduleNotification({
        title,
        body,
        data: { type: 'meditation_reminder' },
        trigger: {
          hour,
          minute,
          repeats: true,
        },
      });
    } catch (error) {
      console.error('Error scheduling daily reminder:', error);
      return null;
    }
  };

  // Cancel notifications by type
  const cancelNotificationsByType = async (type: string) => {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      
      for (const notification of scheduledNotifications) {
        if (notification.content.data?.type === type) {
          await Notifications.cancelScheduledNotificationAsync(notification.identifier);
        }
      }
    } catch (error) {
      console.error('Error canceling notifications by type:', error);
    }
  };

  // Cancel all scheduled notifications
  const cancelAllNotifications = async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  };

  return {
    expoPushToken,
    notification,
    scheduleNotification,
    scheduleDailyReminder,
    cancelNotificationsByType,
    cancelAllNotifications,
  };
};