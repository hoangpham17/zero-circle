import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUserQuery } from './useUserQuery';
import { useNetworkState } from './useAppState';

// Types for app settings
export interface AppSettings {
  // Appearance settings
  theme: 'light' | 'dark' | 'system';
  fontScale: number;
  
  // Notification settings
  notificationsEnabled: boolean;
  meditationReminders: boolean;
  reminderTime: string; // Format: 'HH:MM'
  
  // Meditation settings
  defaultMeditationDuration: number; // in minutes
  meditationSoundEnabled: boolean;
  meditationVibrationEnabled: boolean;
  backgroundMusicEnabled: boolean;
  backgroundMusicVolume: number; // 0-1
  
  // Content settings
  downloadOverWifiOnly: boolean;
  autoPlayNextContent: boolean;
  contentLanguage: string;
  
  // Privacy settings
  shareUsageData: boolean;
  shareMeditationStats: boolean;
  
  // Accessibility settings
  reduceAnimations: boolean;
  highContrast: boolean;
  screenReaderOptimized: boolean;
}

// Default settings
const defaultSettings: AppSettings = {
  theme: 'system',
  fontScale: 1,
  
  notificationsEnabled: true,
  meditationReminders: false,
  reminderTime: '08:00',
  
  defaultMeditationDuration: 10,
  meditationSoundEnabled: true,
  meditationVibrationEnabled: true,
  backgroundMusicEnabled: true,
  backgroundMusicVolume: 0.5,
  
  downloadOverWifiOnly: true,
  autoPlayNextContent: false,
  contentLanguage: 'vi',
  
  shareUsageData: true,
  shareMeditationStats: false,
  
  reduceAnimations: false,
  highContrast: false,
  screenReaderOptimized: false,
};

// Storage key
const SETTINGS_STORAGE_KEY = 'zero_circle_app_settings';

/**
 * Hook for managing app settings
 * Handles local storage and syncing with server when user is logged in
 */
export const useSettings = () => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const { isConnected } = useNetworkState();
  const { data: userSettings, isLoading: isUserSettingsLoading, isError: isUserSettingsError, updateUserSettings } = useUserQuery.useUserSettings();
  
  // Load settings from storage on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const storedSettings = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
        
        if (storedSettings) {
          setSettings({
            ...defaultSettings,
            ...JSON.parse(storedSettings),
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load settings'));
        console.error('Failed to load settings:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSettings();
  }, []);
  
  // Sync with user settings from server when available
  useEffect(() => {
    if (!isUserSettingsLoading && !isUserSettingsError && userSettings && isConnected) {
      // Merge local settings with user settings from server
      // Server settings take precedence over local settings
      setSettings(prevSettings => ({
        ...prevSettings,
        ...userSettings,
      }));
    }
  }, [userSettings, isUserSettingsLoading, isUserSettingsError, isConnected]);
  
  // Save settings to storage whenever they change
  useEffect(() => {
    if (!isLoading) {
      const saveSettings = async () => {
        try {
          await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
          
          // If connected and user settings are available, sync with server
          if (isConnected && updateUserSettings && !isUserSettingsLoading) {
            await updateUserSettings.mutateAsync(settings);
          }
        } catch (err) {
          console.error('Failed to save settings:', err);
        }
      };
      
      saveSettings();
    }
  }, [settings, isLoading, isConnected, updateUserSettings, isUserSettingsLoading]);
  
  // Update a single setting
  const updateSetting = useCallback(<K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);
  
  // Update multiple settings at once
  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings,
    }));
  }, []);
  
  // Reset settings to default
  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
  }, []);
  
  // Reset a specific setting to default
  const resetSetting = useCallback(<K extends keyof AppSettings>(key: K) => {
    setSettings(prev => ({
      ...prev,
      [key]: defaultSettings[key],
    }));
  }, []);
  
  return {
    settings,
    isLoading,
    error,
    updateSetting,
    updateSettings,
    resetSettings,
    resetSetting,
    defaultSettings,
  };
};

/**
 * Hook for accessing specific setting groups
 */
export const useAppearanceSettings = () => {
  const { settings, updateSetting, isLoading } = useSettings();
  
  return {
    theme: settings.theme,
    fontScale: settings.fontScale,
    setTheme: (theme: AppSettings['theme']) => updateSetting('theme', theme),
    setFontScale: (scale: number) => updateSetting('fontScale', scale),
    isLoading,
  };
};

export const useNotificationSettings = () => {
  const { settings, updateSetting, isLoading } = useSettings();
  
  return {
    notificationsEnabled: settings.notificationsEnabled,
    meditationReminders: settings.meditationReminders,
    reminderTime: settings.reminderTime,
    setNotificationsEnabled: (enabled: boolean) => updateSetting('notificationsEnabled', enabled),
    setMeditationReminders: (enabled: boolean) => updateSetting('meditationReminders', enabled),
    setReminderTime: (time: string) => updateSetting('reminderTime', time),
    isLoading,
  };
};

export const useMeditationSettings = () => {
  const { settings, updateSetting, isLoading } = useSettings();
  
  return {
    defaultMeditationDuration: settings.defaultMeditationDuration,
    meditationSoundEnabled: settings.meditationSoundEnabled,
    meditationVibrationEnabled: settings.meditationVibrationEnabled,
    backgroundMusicEnabled: settings.backgroundMusicEnabled,
    backgroundMusicVolume: settings.backgroundMusicVolume,
    setDefaultMeditationDuration: (duration: number) => updateSetting('defaultMeditationDuration', duration),
    setMeditationSoundEnabled: (enabled: boolean) => updateSetting('meditationSoundEnabled', enabled),
    setMeditationVibrationEnabled: (enabled: boolean) => updateSetting('meditationVibrationEnabled', enabled),
    setBackgroundMusicEnabled: (enabled: boolean) => updateSetting('backgroundMusicEnabled', enabled),
    setBackgroundMusicVolume: (volume: number) => updateSetting('backgroundMusicVolume', volume),
    isLoading,
  };
};

export const useContentSettings = () => {
  const { settings, updateSetting, isLoading } = useSettings();
  
  return {
    downloadOverWifiOnly: settings.downloadOverWifiOnly,
    autoPlayNextContent: settings.autoPlayNextContent,
    contentLanguage: settings.contentLanguage,
    setDownloadOverWifiOnly: (enabled: boolean) => updateSetting('downloadOverWifiOnly', enabled),
    setAutoPlayNextContent: (enabled: boolean) => updateSetting('autoPlayNextContent', enabled),
    setContentLanguage: (language: string) => updateSetting('contentLanguage', language),
    isLoading,
  };
};

export const usePrivacySettings = () => {
  const { settings, updateSetting, isLoading } = useSettings();
  
  return {
    shareUsageData: settings.shareUsageData,
    shareMeditationStats: settings.shareMeditationStats,
    setShareUsageData: (enabled: boolean) => updateSetting('shareUsageData', enabled),
    setShareMeditationStats: (enabled: boolean) => updateSetting('shareMeditationStats', enabled),
    isLoading,
  };
};

export const useAccessibilitySettings = () => {
  const { settings, updateSetting, isLoading } = useSettings();
  
  return {
    reduceAnimations: settings.reduceAnimations,
    highContrast: settings.highContrast,
    screenReaderOptimized: settings.screenReaderOptimized,
    setReduceAnimations: (enabled: boolean) => updateSetting('reduceAnimations', enabled),
    setHighContrast: (enabled: boolean) => updateSetting('highContrast', enabled),
    setScreenReaderOptimized: (enabled: boolean) => updateSetting('screenReaderOptimized', enabled),
    isLoading,
  };
};