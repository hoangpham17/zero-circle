import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { useNetworkState } from './useAppState';
import { useSettings } from './useSettings';

// Types for offline content
export interface OfflineContent {
  id: string;
  type: 'meditation' | 'buddhist_content' | 'audio' | 'image';
  title: string;
  localUri: string;
  size: number; // in bytes
  downloadedAt: string; // ISO date string
  expiresAt?: string; // ISO date string, optional
  metadata?: Record<string, any>; // Additional metadata
}

// Storage keys
const OFFLINE_CONTENT_KEY = 'zero_circle_offline_content';
const OFFLINE_CONTENT_DIR = `${FileSystem.documentDirectory}offline/`;

/**
 * Hook for managing offline content
 */
export const useOfflineData = () => {
  const [offlineContent, setOfflineContent] = useState<OfflineContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [totalStorageUsed, setTotalStorageUsed] = useState(0);
  
  const { isConnected, type: networkType } = useNetworkState();
  const { settings } = useSettings();
  
  // Initialize offline directory
  useEffect(() => {
    const initOfflineDir = async () => {
      try {
        const dirInfo = await FileSystem.getInfoAsync(OFFLINE_CONTENT_DIR);
        if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(OFFLINE_CONTENT_DIR, { intermediates: true });
        }
      } catch (err) {
        console.error('Failed to initialize offline directory:', err);
        setError(err instanceof Error ? err : new Error('Failed to initialize offline directory'));
      }
    };
    
    initOfflineDir();
  }, []);
  
  // Load offline content list from storage
  useEffect(() => {
    const loadOfflineContent = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const storedContent = await AsyncStorage.getItem(OFFLINE_CONTENT_KEY);
        
        if (storedContent) {
          const parsedContent: OfflineContent[] = JSON.parse(storedContent);
          setOfflineContent(parsedContent);
          
          // Calculate total storage used
          const total = parsedContent.reduce((sum, item) => sum + item.size, 0);
          setTotalStorageUsed(total);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load offline content'));
        console.error('Failed to load offline content:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadOfflineContent();
  }, []);
  
  // Save offline content list to storage
  const saveOfflineContent = useCallback(async (content: OfflineContent[]) => {
    try {
      await AsyncStorage.setItem(OFFLINE_CONTENT_KEY, JSON.stringify(content));
      
      // Update total storage used
      const total = content.reduce((sum, item) => sum + item.size, 0);
      setTotalStorageUsed(total);
    } catch (err) {
      console.error('Failed to save offline content:', err);
      throw err;
    }
  }, []);
  
  // Download content for offline use
  const downloadContent = useCallback(async (
    id: string,
    type: OfflineContent['type'],
    title: string,
    remoteUri: string,
    metadata?: Record<string, any>,
    expiresAt?: string
  ) => {
    // Check if we should download based on network settings
    if (settings.downloadOverWifiOnly && networkType !== 'wifi') {
      throw new Error('Download over WiFi only is enabled');
    }
    
    if (!isConnected) {
      throw new Error('No internet connection');
    }
    
    try {
      // Check if content already exists
      const existingContent = offlineContent.find(item => item.id === id && item.type === type);
      if (existingContent) {
        return existingContent;
      }
      
      // Create a unique filename
      const fileExt = remoteUri.split('.').pop() || '';
      const localFilename = `${id}_${Date.now()}.${fileExt}`;
      const localUri = `${OFFLINE_CONTENT_DIR}${localFilename}`;
      
      // Download the file
      const downloadResult = await FileSystem.downloadAsync(remoteUri, localUri);
      
      if (downloadResult.status !== 200) {
        throw new Error(`Download failed with status ${downloadResult.status}`);
      }
      
      // Get file info
      const fileInfo = await FileSystem.getInfoAsync(localUri);
      
      // Create new offline content entry
      const newContent: OfflineContent = {
        id,
        type,
        title,
        localUri,
        size: fileInfo.size || 0,
        downloadedAt: new Date().toISOString(),
        expiresAt,
        metadata,
      };
      
      // Update offline content list
      const updatedContent = [...offlineContent, newContent];
      setOfflineContent(updatedContent);
      await saveOfflineContent(updatedContent);
      
      return newContent;
    } catch (err) {
      console.error('Failed to download content:', err);
      setError(err instanceof Error ? err : new Error('Failed to download content'));
      throw err;
    }
  }, [offlineContent, isConnected, networkType, settings.downloadOverWifiOnly, saveOfflineContent]);
  
  // Remove offline content
  const removeContent = useCallback(async (id: string, type: OfflineContent['type']) => {
    try {
      // Find content to remove
      const contentToRemove = offlineContent.find(item => item.id === id && item.type === type);
      
      if (!contentToRemove) {
        return false;
      }
      
      // Delete the file
      await FileSystem.deleteAsync(contentToRemove.localUri, { idempotent: true });
      
      // Update offline content list
      const updatedContent = offlineContent.filter(item => !(item.id === id && item.type === type));
      setOfflineContent(updatedContent);
      await saveOfflineContent(updatedContent);
      
      return true;
    } catch (err) {
      console.error('Failed to remove content:', err);
      setError(err instanceof Error ? err : new Error('Failed to remove content'));
      throw err;
    }
  }, [offlineContent, saveOfflineContent]);
  
  // Check if content is available offline
  const isContentAvailable = useCallback((id: string, type: OfflineContent['type']) => {
    return offlineContent.some(item => item.id === id && item.type === type);
  }, [offlineContent]);
  
  // Get offline content by id and type
  const getContent = useCallback((id: string, type: OfflineContent['type']) => {
    return offlineContent.find(item => item.id === id && item.type === type) || null;
  }, [offlineContent]);
  
  // Get all offline content by type
  const getContentByType = useCallback((type: OfflineContent['type']) => {
    return offlineContent.filter(item => item.type === type);
  }, [offlineContent]);
  
  // Clear all offline content
  const clearAllContent = useCallback(async () => {
    try {
      // Delete all files
      for (const content of offlineContent) {
        await FileSystem.deleteAsync(content.localUri, { idempotent: true }).catch(() => {});
      }
      
      // Clear offline content list
      setOfflineContent([]);
      await saveOfflineContent([]);
      
      return true;
    } catch (err) {
      console.error('Failed to clear all content:', err);
      setError(err instanceof Error ? err : new Error('Failed to clear all content'));
      throw err;
    }
  }, [offlineContent, saveOfflineContent]);
  
  // Clean up expired content
  const cleanupExpiredContent = useCallback(async () => {
    try {
      const now = new Date();
      const expiredContent = offlineContent.filter(item => {
        if (!item.expiresAt) return false;
        return new Date(item.expiresAt) < now;
      });
      
      if (expiredContent.length === 0) {
        return 0;
      }
      
      // Delete expired files
      for (const content of expiredContent) {
        await FileSystem.deleteAsync(content.localUri, { idempotent: true }).catch(() => {});
      }
      
      // Update offline content list
      const updatedContent = offlineContent.filter(item => {
        if (!item.expiresAt) return true;
        return new Date(item.expiresAt) >= now;
      });
      
      setOfflineContent(updatedContent);
      await saveOfflineContent(updatedContent);
      
      return expiredContent.length;
    } catch (err) {
      console.error('Failed to cleanup expired content:', err);
      setError(err instanceof Error ? err : new Error('Failed to cleanup expired content'));
      throw err;
    }
  }, [offlineContent, saveOfflineContent]);
  
  return {
    offlineContent,
    isLoading,
    error,
    totalStorageUsed,
    downloadContent,
    removeContent,
    isContentAvailable,
    getContent,
    getContentByType,
    clearAllContent,
    cleanupExpiredContent,
  };
};

/**
 * Hook for managing offline meditation content
 */
export const useOfflineMeditations = () => {
  const {
    isLoading,
    error,
    downloadContent,
    removeContent,
    isContentAvailable,
    getContent,
    getContentByType,
  } = useOfflineData();
  
  const offlineMeditations = getContentByType('meditation');
  
  const downloadMeditation = useCallback(
    (id: string, title: string, remoteUri: string, metadata?: Record<string, any>, expiresAt?: string) => {
      return downloadContent(id, 'meditation', title, remoteUri, metadata, expiresAt);
    },
    [downloadContent]
  );
  
  const removeMeditation = useCallback(
    (id: string) => {
      return removeContent(id, 'meditation');
    },
    [removeContent]
  );
  
  const isMeditationAvailable = useCallback(
    (id: string) => {
      return isContentAvailable(id, 'meditation');
    },
    [isContentAvailable]
  );
  
  const getMeditation = useCallback(
    (id: string) => {
      return getContent(id, 'meditation');
    },
    [getContent]
  );
  
  return {
    offlineMeditations,
    isLoading,
    error,
    downloadMeditation,
    removeMeditation,
    isMeditationAvailable,
    getMeditation,
  };
};

/**
 * Hook for managing offline Buddhist content
 */
export const useOfflineBuddhistContent = () => {
  const {
    isLoading,
    error,
    downloadContent,
    removeContent,
    isContentAvailable,
    getContent,
    getContentByType,
  } = useOfflineData();
  
  const offlineBuddhistContent = getContentByType('buddhist_content');
  
  const downloadBuddhistContent = useCallback(
    (id: string, title: string, remoteUri: string, metadata?: Record<string, any>, expiresAt?: string) => {
      return downloadContent(id, 'buddhist_content', title, remoteUri, metadata, expiresAt);
    },
    [downloadContent]
  );
  
  const removeBuddhistContent = useCallback(
    (id: string) => {
      return removeContent(id, 'buddhist_content');
    },
    [removeContent]
  );
  
  const isBuddhistContentAvailable = useCallback(
    (id: string) => {
      return isContentAvailable(id, 'buddhist_content');
    },
    [isContentAvailable]
  );
  
  const getBuddhistContent = useCallback(
    (id: string) => {
      return getContent(id, 'buddhist_content');
    },
    [getContent]
  );
  
  return {
    offlineBuddhistContent,
    isLoading,
    error,
    downloadBuddhistContent,
    removeBuddhistContent,
    isBuddhistContentAvailable,
    getBuddhistContent,
  };
};

/**
 * Hook for managing offline audio resources
 */
export const useOfflineAudio = () => {
  const {
    isLoading,
    error,
    downloadContent,
    removeContent,
    isContentAvailable,
    getContent,
    getContentByType,
  } = useOfflineData();
  
  const offlineAudio = getContentByType('audio');
  
  const downloadAudio = useCallback(
    (id: string, title: string, remoteUri: string, metadata?: Record<string, any>, expiresAt?: string) => {
      return downloadContent(id, 'audio', title, remoteUri, metadata, expiresAt);
    },
    [downloadContent]
  );
  
  const removeAudio = useCallback(
    (id: string) => {
      return removeContent(id, 'audio');
    },
    [removeContent]
  );
  
  const isAudioAvailable = useCallback(
    (id: string) => {
      return isContentAvailable(id, 'audio');
    },
    [isContentAvailable]
  );
  
  const getAudio = useCallback(
    (id: string) => {
      return getContent(id, 'audio');
    },
    [getContent]
  );
  
  return {
    offlineAudio,
    isLoading,
    error,
    downloadAudio,
    removeAudio,
    isAudioAvailable,
    getAudio,
  };
};

/**
 * Hook for managing offline image resources
 */
export const useOfflineImages = () => {
  const {
    isLoading,
    error,
    downloadContent,
    removeContent,
    isContentAvailable,
    getContent,
    getContentByType,
  } = useOfflineData();
  
  const offlineImages = getContentByType('image');
  
  const downloadImage = useCallback(
    (id: string, title: string, remoteUri: string, metadata?: Record<string, any>, expiresAt?: string) => {
      return downloadContent(id, 'image', title, remoteUri, metadata, expiresAt);
    },
    [downloadContent]
  );
  
  const removeImage = useCallback(
    (id: string) => {
      return removeContent(id, 'image');
    },
    [removeContent]
  );
  
  const isImageAvailable = useCallback(
    (id: string) => {
      return isContentAvailable(id, 'image');
    },
    [isContentAvailable]
  );
  
  const getImage = useCallback(
    (id: string) => {
      return getContent(id, 'image');
    },
    [getContent]
  );
  
  return {
    offlineImages,
    isLoading,
    error,
    downloadImage,
    removeImage,
    isImageAvailable,
    getImage,
  };
};