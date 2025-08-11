import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MeditationConfig } from '../types/meditation';
import { useNetworkState } from './useAppState';
import { useAnalytics } from './useAnalytics';
import { useMeditationResources } from './useMeditationResources';

const MEDITATION_CONFIGS_STORAGE_KEY = 'meditation_configs';
const DEFAULT_CONFIG_ID_STORAGE_KEY = 'default_meditation_config_id';

interface UseMeditationConfigsReturn {
  configs: MeditationConfig[];
  defaultConfig: MeditationConfig | null;
  isLoading: boolean;
  error: Error | null;
  
  // Actions
  createConfig: (config: Omit<MeditationConfig, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<MeditationConfig>;
  updateConfig: (id: string, updates: Partial<MeditationConfig>) => Promise<MeditationConfig>;
  deleteConfig: (id: string) => Promise<void>;
  setDefaultConfig: (id: string) => Promise<void>;
  getConfigById: (id: string) => MeditationConfig | undefined;
  resetToDefaultConfigs: () => Promise<void>;
  syncConfigs: () => Promise<void>;
}

export const useMeditationConfigs = (): UseMeditationConfigsReturn => {
  const { isConnected } = useNetworkState();
  const { trackEvent } = useAnalytics();
  const { systemSounds, systemImages } = useMeditationResources();
  
  const [configs, setConfigs] = useState<MeditationConfig[]>([]);
  const [defaultConfigId, setDefaultConfigId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Get default config
  const defaultConfig = configs.find(config => config.id === defaultConfigId) || null;
  
  // Load configs from storage
  useEffect(() => {
    const loadConfigs = async () => {
      setIsLoading(true);
      try {
        // Load configs
        const storedConfigs = await AsyncStorage.getItem(MEDITATION_CONFIGS_STORAGE_KEY);
        if (storedConfigs) {
          setConfigs(JSON.parse(storedConfigs));
        } else {
          // If no configs exist, create default ones
          await resetToDefaultConfigs();
        }
        
        // Load default config ID
        const storedDefaultConfigId = await AsyncStorage.getItem(DEFAULT_CONFIG_ID_STORAGE_KEY);
        if (storedDefaultConfigId) {
          setDefaultConfigId(storedDefaultConfigId);
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading meditation configs:', err);
        setError(err instanceof Error ? err : new Error('Failed to load meditation configs'));
        setIsLoading(false);
      }
    };
    
    loadConfigs();
  }, []);
  
  // Save configs to storage
  const saveConfigs = useCallback(async (newConfigs: MeditationConfig[]): Promise<void> => {
    try {
      await AsyncStorage.setItem(MEDITATION_CONFIGS_STORAGE_KEY, JSON.stringify(newConfigs));
    } catch (err) {
      console.error('Error saving meditation configs:', err);
      throw err;
    }
  }, []);
  
  // Save default config ID to storage
  const saveDefaultConfigId = useCallback(async (id: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(DEFAULT_CONFIG_ID_STORAGE_KEY, id);
    } catch (err) {
      console.error('Error saving default meditation config ID:', err);
      throw err;
    }
  }, []);
  
  // Create a new config
  const createConfig = useCallback(async (config: Omit<MeditationConfig, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<MeditationConfig> => {
    try {
      const now = new Date().toISOString();
      const newConfig: MeditationConfig = {
        ...config,
        id: `local_${Date.now().toString()}`,
        userId: 'local', // Will be replaced with actual user ID when synced
        createdAt: now,
        updatedAt: now
      };
      
      const updatedConfigs = [...configs, newConfig];
      await saveConfigs(updatedConfigs);
      setConfigs(updatedConfigs);
      
      // If this is the first config, set it as default
      if (updatedConfigs.length === 1) {
        await setDefaultConfig(newConfig.id);
      }
      
      trackEvent('meditation_config_created', {
        configId: newConfig.id,
        configName: newConfig.name
      });
      
      return newConfig;
    } catch (err) {
      console.error('Error creating meditation config:', err);
      throw err;
    }
  }, [configs, saveConfigs, trackEvent]);
  
  // Update an existing config
  const updateConfig = useCallback(async (id: string, updates: Partial<MeditationConfig>): Promise<MeditationConfig> => {
    try {
      const configIndex = configs.findIndex(config => config.id === id);
      if (configIndex === -1) {
        throw new Error(`Config with ID ${id} not found`);
      }
      
      const updatedConfig = {
        ...configs[configIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      const updatedConfigs = [...configs];
      updatedConfigs[configIndex] = updatedConfig;
      
      await saveConfigs(updatedConfigs);
      setConfigs(updatedConfigs);
      
      trackEvent('meditation_config_updated', {
        configId: updatedConfig.id,
        configName: updatedConfig.name
      });
      
      return updatedConfig;
    } catch (err) {
      console.error('Error updating meditation config:', err);
      throw err;
    }
  }, [configs, saveConfigs, trackEvent]);
  
  // Delete a config
  const deleteConfig = useCallback(async (id: string): Promise<void> => {
    try {
      // Don't allow deleting the default config
      if (id === defaultConfigId) {
        throw new Error('Cannot delete the default meditation config');
      }
      
      const updatedConfigs = configs.filter(config => config.id !== id);
      
      // If we're deleting the last config, create a new default one
      if (updatedConfigs.length === 0) {
        await resetToDefaultConfigs();
        return;
      }
      
      await saveConfigs(updatedConfigs);
      setConfigs(updatedConfigs);
      
      trackEvent('meditation_config_deleted', {
        configId: id
      });
    } catch (err) {
      console.error('Error deleting meditation config:', err);
      throw err;
    }
  }, [configs, defaultConfigId, saveConfigs, trackEvent]);
  
  // Set default config
  const setDefaultConfig = useCallback(async (id: string): Promise<void> => {
    try {
      const config = configs.find(config => config.id === id);
      if (!config) {
        throw new Error(`Config with ID ${id} not found`);
      }
      
      await saveDefaultConfigId(id);
      setDefaultConfigId(id);
      
      // Update the isDefault flag on all configs
      const updatedConfigs = configs.map(config => ({
        ...config,
        isDefault: config.id === id
      }));
      
      await saveConfigs(updatedConfigs);
      setConfigs(updatedConfigs);
      
      trackEvent('meditation_default_config_set', {
        configId: id,
        configName: config.name
      });
    } catch (err) {
      console.error('Error setting default meditation config:', err);
      throw err;
    }
  }, [configs, saveDefaultConfigId, saveConfigs, trackEvent]);
  
  // Get config by ID
  const getConfigById = useCallback((id: string): MeditationConfig | undefined => {
    return configs.find(config => config.id === id);
  }, [configs]);
  
  // Reset to default configs
  const resetToDefaultConfigs = useCallback(async (): Promise<void> => {
    try {
      const now = new Date().toISOString();
      
      // Find default sounds and images
      const defaultStartSound = systemSounds.find(sound => sound.name === 'Bell');
      const defaultEndSound = systemSounds.find(sound => sound.name === 'Bowl');
      const defaultPeriodicSound = systemSounds.find(sound => sound.name === 'Chime');
      const defaultBackgroundImage = systemImages.find(image => image.name === 'Mountain');
      
      // Create default configs
      const defaultConfigs: MeditationConfig[] = [
        {
          id: `default_${Date.now().toString()}`,
          userId: 'local',
          name: 'Basic Meditation',
          isDefault: true,
          backgroundImageId: defaultBackgroundImage?.id,
          startSoundId: defaultStartSound?.id,
          endSoundId: defaultEndSound?.id,
          periodicChimeEnabled: false,
          createdAt: now,
          updatedAt: now
        },
        {
          id: `default_${Date.now().toString() + 1}`,
          userId: 'local',
          name: 'Interval Meditation',
          isDefault: false,
          backgroundImageId: defaultBackgroundImage?.id,
          startSoundId: defaultStartSound?.id,
          endSoundId: defaultEndSound?.id,
          periodicChimeEnabled: true,
          periodicChimeInterval: 300, // 5 minutes
          periodicChimeSoundId: defaultPeriodicSound?.id,
          createdAt: now,
          updatedAt: now
        }
      ];
      
      await saveConfigs(defaultConfigs);
      setConfigs(defaultConfigs);
      
      // Set the first config as default
      await saveDefaultConfigId(defaultConfigs[0].id);
      setDefaultConfigId(defaultConfigs[0].id);
      
      trackEvent('meditation_configs_reset');
    } catch (err) {
      console.error('Error resetting meditation configs:', err);
      throw err;
    }
  }, [systemSounds, systemImages, saveConfigs, saveDefaultConfigId, trackEvent]);
  
  // Sync configs with server
  const syncConfigs = useCallback(async (): Promise<void> => {
    if (!isConnected) {
      throw new Error('Cannot sync meditation configs while offline');
    }
    
    // TODO: Implement syncing with server
    // This would involve:
    // 1. Fetching configs from server
    // 2. Merging with local configs (handling conflicts)
    // 3. Uploading local configs to server
    // 4. Updating local storage with merged configs
    
    trackEvent('meditation_configs_synced');
  }, [isConnected, trackEvent]);
  
  return {
    configs,
    defaultConfig,
    isLoading,
    error,
    createConfig,
    updateConfig,
    deleteConfig,
    setDefaultConfig,
    getConfigById,
    resetToDefaultConfigs,
    syncConfigs
  };
};

// Hook to manage a single meditation config
export const useMeditationConfig = (configId?: string) => {
  const {
    configs,
    defaultConfig,
    isLoading,
    error,
    updateConfig,
    deleteConfig,
    setDefaultConfig
  } = useMeditationConfigs();
  
  // Get the specified config or default config
  const config = configId
    ? configs.find(config => config.id === configId)
    : defaultConfig;
  
  // Check if this is the default config
  const isDefault = config ? config.id === defaultConfig?.id : false;
  
  // Update this config
  const update = useCallback(async (updates: Partial<MeditationConfig>): Promise<MeditationConfig> => {
    if (!config) {
      throw new Error('No config selected');
    }
    
    return updateConfig(config.id, updates);
  }, [config, updateConfig]);
  
  // Delete this config
  const remove = useCallback(async (): Promise<void> => {
    if (!config) {
      throw new Error('No config selected');
    }
    
    return deleteConfig(config.id);
  }, [config, deleteConfig]);
  
  // Set this config as default
  const setAsDefault = useCallback(async (): Promise<void> => {
    if (!config) {
      throw new Error('No config selected');
    }
    
    return setDefaultConfig(config.id);
  }, [config, setDefaultConfig]);
  
  return {
    config,
    isDefault,
    isLoading,
    error,
    update,
    remove,
    setAsDefault
  };
};