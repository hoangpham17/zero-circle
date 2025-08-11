import { useState, useEffect } from 'react';
import { Dimensions, Platform, ScaledSize } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import * as Haptics from 'expo-haptics';

// Hook to get device information
export const useDeviceInfo = () => {
  const [deviceInfo, setDeviceInfo] = useState<{
    isDevice: boolean;
    brand: string | null;
    manufacturer: string | null;
    modelName: string | null;
    deviceYearClass: number | null;
    totalMemory: number | null;
    osName: string | null;
    osVersion: string | null;
  }>({ 
    isDevice: true,
    brand: null,
    manufacturer: null,
    modelName: null,
    deviceYearClass: null,
    totalMemory: null,
    osName: null,
    osVersion: null,
  });

  useEffect(() => {
    const getDeviceInfo = async () => {
      try {
        const isDevice = await Device.isDeviceAsync();
        const brand = Device.brand;
        const manufacturer = Device.manufacturer;
        const modelName = Device.modelName;
        const deviceYearClass = await Device.getDeviceYearClassAsync();
        const totalMemory = await Device.getTotalMemoryAsync();
        const osName = Device.osName;
        const osVersion = Device.osVersion;

        setDeviceInfo({
          isDevice,
          brand,
          manufacturer,
          modelName,
          deviceYearClass,
          totalMemory,
          osName,
          osVersion,
        });
      } catch (error) {
        console.error('Error getting device info:', error);
      }
    };

    getDeviceInfo();
  }, []);

  return deviceInfo;
};

// Hook to get screen dimensions and handle orientation changes
export const useScreenDimensions = () => {
  const [dimensions, setDimensions] = useState<{
    window: ScaledSize;
    screen: ScaledSize;
    isPortrait: boolean;
  }>({
    window: Dimensions.get('window'),
    screen: Dimensions.get('screen'),
    isPortrait: Dimensions.get('window').height > Dimensions.get('window').width,
  });

  useEffect(() => {
    const onChange = ({ window, screen }: { window: ScaledSize; screen: ScaledSize }) => {
      const isPortrait = window.height > window.width;
      setDimensions({ window, screen, isPortrait });
    };

    const subscription = Dimensions.addEventListener('change', onChange);

    return () => {
      subscription.remove();
    };
  }, []);

  return dimensions;
};

// Hook to register for push notifications
export const useNotifications = () => {
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
  const [notification, setNotification] = useState<Notifications.Notification | undefined>();
  const [permission, setPermission] = useState<boolean | undefined>();

  useEffect(() => {
    const registerForPushNotifications = async () => {
      try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        setPermission(finalStatus === 'granted');

        if (finalStatus !== 'granted') {
          return;
        }

        const token = (await Notifications.getExpoPushTokenAsync()).data;
        setExpoPushToken(token);
      } catch (error) {
        console.error('Error registering for push notifications:', error);
      }
    };

    if (Device.isDevice) {
      registerForPushNotifications();
    }

    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    return () => {
      notificationListener.remove();
    };
  }, []);

  return { expoPushToken, notification, permission };
};

// Hook for haptic feedback
export const useHaptics = () => {
  const triggerImpact = async (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Medium) => {
    try {
      await Haptics.impactAsync(style);
    } catch (error) {
      console.error('Error triggering haptic impact:', error);
    }
  };

  const triggerNotification = async (type: Haptics.NotificationFeedbackType = Haptics.NotificationFeedbackType.Success) => {
    try {
      await Haptics.notificationAsync(type);
    } catch (error) {
      console.error('Error triggering haptic notification:', error);
    }
  };

  const triggerSelection = async () => {
    try {
      await Haptics.selectionAsync();
    } catch (error) {
      console.error('Error triggering haptic selection:', error);
    }
  };

  return { triggerImpact, triggerNotification, triggerSelection };
};