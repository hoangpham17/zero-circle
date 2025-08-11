import { useState, useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';
import { SoundResource } from '../types/meditation';
import { useAudio } from './useAudio';
import { useNetworkState } from './useAppState';
import { useAnalytics } from './useAnalytics';
import {
  useSoundResources as useSoundResourcesQuery,
  useSoundResourceById,
  useCreateSound,
  useUpdateSound,
  useDeleteSound
} from './useResourceQuery';

const SOUND_RESOURCES_CACHE_KEY = 'sound_resources_cache';
const SOUND_RESOURCES_CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

export interface SoundResourceWithLocalUri extends SoundResource {
  localUri?: string;
  isDownloaded?: boolean;
}

interface UseSoundResourcesReturn {
  // Data
  sounds: SoundResourceWithLocalUri[];
  systemSounds: SoundResourceWithLocalUri[];
  userSounds: SoundResourceWithLocalUri[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  
  // Actions
  refreshSounds: () => Promise<void>;
  createSound: (name: string, url: string, duration?: number) => Promise<SoundResource>;
  updateSound: (id: string, data: Partial<SoundResource>) => Promise<SoundResource>;
  deleteSound: (id: string) => Promise<void>;
  
  // Download management
  downloadSound: (sound: SoundResource) => Promise<string>;
  deleteDownloadedSound: (sound: SoundResourceWithLocalUri) => Promise<void>;
  isDownloaded: (soundId: string) => boolean;
  getLocalUri: (soundId: string) => string | undefined;
  
  // Playback
  previewSound: (sound: SoundResourceWithLocalUri) => Promise<void>;
  stopPreview: () => Promise<void>;
  isPlaying: boolean;
  currentPreviewId: string | null;
}

export const useSoundResources = (params?: { isSystem?: boolean; search?: string }): UseSoundResourcesReturn => {
  const { isConnected } = useNetworkState();
  const { trackEvent } = useAnalytics();
  const queryClient = useQueryClient();
  
  // State
  const [downloadedSounds, setDownloadedSounds] = useState<Record<string, string>>({});
  const [currentPreviewId, setCurrentPreviewId] = useState<string | null>(null);
  
  // Queries
  const { data: remoteSounds, isLoading, isError, error, refetch } = useSoundResourcesQuery(params);
  
  // Audio playback
  const [previewUri, setPreviewUri] = useState<string | undefined>(undefined);
  const [audioState, audioControls] = useAudio(previewUri);
  
  // Load downloaded sounds from storage
  useEffect(() => {
    const loadDownloadedSounds = async () => {
      try {
        const storedData = await AsyncStorage.getItem('downloaded_sounds');
        if (storedData) {
          setDownloadedSounds(JSON.parse(storedData));
        }
      } catch (error) {
        console.error('Error loading downloaded sounds:', error);
      }
    };
    
    loadDownloadedSounds();
  }, []);
  
  // Save downloaded sounds to storage when changed
  useEffect(() => {
    const saveDownloadedSounds = async () => {
      try {
        await AsyncStorage.setItem('downloaded_sounds', JSON.stringify(downloadedSounds));
      } catch (error) {
        console.error('Error saving downloaded sounds:', error);
      }
    };
    
    if (Object.keys(downloadedSounds).length > 0) {
      saveDownloadedSounds();
    }
  }, [downloadedSounds]);
  
  // Combine remote sounds with local information
  const sounds: SoundResourceWithLocalUri[] = (remoteSounds || []).map(sound => ({
    ...sound,
    localUri: downloadedSounds[sound.id],
    isDownloaded: !!downloadedSounds[sound.id]
  }));
  
  // Filter system and user sounds
  const systemSounds = sounds.filter(sound => sound.isSystem);
  const userSounds = sounds.filter(sound => !sound.isSystem);
  
  // Mutations
  const createSoundMutation = useCreateSound();
  const updateSoundMutation = useUpdateSound();
  const deleteSoundMutation = useDeleteSound();
  
  // Download a sound for offline use
  const downloadSound = useCallback(async (sound: SoundResourceWithLocalUri): Promise<string> => {
    if (!sound.url) {
      throw new Error('Sound URL is required for download');
    }
    
    try {
      // Create directory if it doesn't exist
      const soundsDir = `${FileSystem.documentDirectory}sounds/`;
      const dirInfo = await FileSystem.getInfoAsync(soundsDir);
      
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(soundsDir, { intermediates: true });
      }
      
      // Generate local filename
      const fileExtension = sound.url.split('.').pop() || 'mp3';
      const localUri = `${soundsDir}${sound.id}.${fileExtension}`;
      
      // Check if file already exists
      const fileInfo = await FileSystem.getInfoAsync(localUri);
      
      if (!fileInfo.exists) {
        // Download the file
        const downloadResult = await FileSystem.downloadAsync(sound.url, localUri);
        
        if (downloadResult.status !== 200) {
          throw new Error(`Failed to download sound: ${downloadResult.status}`);
        }
        
        // Update state with new downloaded sound
        setDownloadedSounds((prev: Record<string, string>) => ({
        ...prev,
        [sound.id]: localUri
      }));
        
        trackEvent('sound_downloaded', {
          soundId: sound.id,
          soundName: sound.name,
          isSystem: sound.isSystem
        });
        
        return localUri;
      }
      
      // File already exists
      setDownloadedSounds((prev: Record<string, string>) => ({
        ...prev,
        [sound.id]: localUri
      }));
      
      return localUri;
    } catch (error) {
      console.error('Error downloading sound:', error);
      throw error;
    }
  }, [trackEvent]);
  
  // Delete a downloaded sound
  const deleteDownloadedSound = useCallback(async (sound: SoundResourceWithLocalUri): Promise<void> => {
    if (!sound.localUri) {
      return;
    }
    
    try {
      // Check if file exists
      const fileInfo = await FileSystem.getInfoAsync(sound.localUri);
      
      if (fileInfo.exists) {
        // Delete the file
        await FileSystem.deleteAsync(sound.localUri);
      }
      
      // Update state to remove the downloaded sound
      setDownloadedSounds((prev: Record<string, string>) => {
        const updated = { ...prev };
        delete updated[sound.id];
        return updated;
      });
      
      trackEvent('sound_deleted', {
        soundId: sound.id,
        soundName: sound.name,
        isSystem: sound.isSystem
      });
    } catch (error) {
      console.error('Error deleting downloaded sound:', error);
      throw error;
    }
  }, [trackEvent]);
  
  // Check if a sound is downloaded
  const isDownloaded = useCallback((soundId: string): boolean => {
    return !!downloadedSounds[soundId];
  }, [downloadedSounds]);
  
  // Get local URI for a sound
  const getLocalUri = useCallback((soundId: string): string | undefined => {
    return downloadedSounds[soundId];
  }, [downloadedSounds]);
  
  // Preview a sound
  const previewSound = useCallback(async (sound: SoundResourceWithLocalUri): Promise<void> => {
    // Stop current preview if playing
    if (audioState.isPlaying) {
      await audioControls.stop();
    }
    
    // Set the sound to preview
    setCurrentPreviewId(sound.id);
    
    // Use local URI if available, otherwise use remote URL
    const uri = sound.localUri || sound.url;
    setPreviewUri(uri);
    
    // Play the sound after a short delay to ensure it's loaded
    setTimeout(async () => {
      await audioControls.play();
      
      trackEvent('sound_previewed', {
        soundId: sound.id,
        soundName: sound.name,
        isSystem: sound.isSystem,
        isLocal: !!sound.localUri
      });
    }, 100);
  }, [audioState.isPlaying, audioControls, trackEvent]);
  
  // Stop preview
  const stopPreview = useCallback(async (): Promise<void> => {
    if (audioState.isPlaying) {
      await audioControls.stop();
    }
    setCurrentPreviewId(null);
  }, [audioState.isPlaying, audioControls]);
  
  // Refresh sounds
  const refreshSounds = useCallback(async (): Promise<void> => {
    if (isConnected) {
      await refetch();
    }
  }, [isConnected, refetch]);
  
  // Create a new sound
  const createSound = useCallback(async (name: string, url: string, duration?: number): Promise<SoundResource> => {
    if (!isConnected) {
      throw new Error('Cannot create sound while offline');
    }
    
    const result = await createSoundMutation.mutateAsync({ name, url, duration });
    
    trackEvent('sound_created', {
      soundId: result.id,
      soundName: result.name
    });
    
    return result;
  }, [isConnected, createSoundMutation, trackEvent]);
  
  // Update a sound
  const updateSound = useCallback(async (id: string, data: Partial<SoundResource>): Promise<SoundResource> => {
    if (!isConnected) {
      throw new Error('Cannot update sound while offline');
    }
    
    const result = await updateSoundMutation.mutateAsync({ id, data });
    
    trackEvent('sound_updated', {
      soundId: result.id,
      soundName: result.name
    });
    
    return result;
  }, [isConnected, updateSoundMutation, trackEvent]);
  
  // Delete a sound
  const deleteSound = useCallback(async (id: string): Promise<void> => {
    if (!isConnected) {
      throw new Error('Cannot delete sound while offline');
    }
    
    // If the sound is downloaded, delete the local file first
    if (downloadedSounds[id]) {
      const sound = sounds.find(s => s.id === id);
      if (sound) {
        await deleteDownloadedSound(sound);
      }
    }
    
    await deleteSoundMutation.mutateAsync(id);
    
    trackEvent('sound_deleted', {
      soundId: id
    });
  }, [isConnected, downloadedSounds, sounds, deleteDownloadedSound, deleteSoundMutation, trackEvent]);
  
  return {
    sounds,
    systemSounds,
    userSounds,
    isLoading,
    isError,
    error,
    refreshSounds,
    createSound,
    updateSound,
    deleteSound,
    downloadSound,
    deleteDownloadedSound,
    isDownloaded,
    getLocalUri,
    previewSound,
    stopPreview,
    isPlaying: audioState.isPlaying,
    currentPreviewId
  };
};

// Hook to get a specific sound by ID
export const useSoundResource = (id: string) => {
  const { isConnected } = useNetworkState();
  const [downloadedSounds, setDownloadedSounds] = useState<Record<string, string>>({});
  
  // Query for remote sound
  const { data: sound, isLoading, isError, error } = useSoundResourceById(id);
  
  // Load downloaded sounds from storage
  useEffect(() => {
    const loadDownloadedSounds = async () => {
      try {
        const storedData = await AsyncStorage.getItem('downloaded_sounds');
        if (storedData) {
          setDownloadedSounds(JSON.parse(storedData));
        }
      } catch (error) {
        console.error('Error loading downloaded sounds:', error);
      }
    };
    
    loadDownloadedSounds();
  }, []);
  
  // Combine remote sound with local information
  const soundWithLocalInfo: SoundResourceWithLocalUri | undefined = sound
    ? {
        ...sound,
        localUri: downloadedSounds[sound.id],
        isDownloaded: !!downloadedSounds[sound.id]
      }
    : undefined;
  
  return {
    sound: soundWithLocalInfo,
    isLoading,
    isError,
    error,
    isOffline: !isConnected
  };
};

// Hook for system sounds
export const useSystemSounds = () => {
  const { systemSounds, isLoading, isError, error, ...rest } = useSoundResources({ isSystem: true });
  
  return {
    sounds: systemSounds,
    isLoading,
    isError,
    error,
    ...rest
  };
};

// Hook for user sounds
export const useUserSounds = () => {
  const { userSounds, isLoading, isError, error, ...rest } = useSoundResources({ isSystem: false });
  
  return {
    sounds: userSounds,
    isLoading,
    isError,
    error,
    ...rest
  };
};

// Hook for sound playback
export const useSoundPlayback = (soundId?: string) => {
  const { sound } = soundId ? useSoundResource(soundId) : { sound: undefined };
  const [audioState, audioControls] = useAudio(sound?.localUri || sound?.url);
  const { trackEvent } = useAnalytics();
  
  // Play the sound
  const play = useCallback(async () => {
    if (!sound) return;
    
    await audioControls.play();
    
    trackEvent('sound_played', {
      soundId: sound.id,
      soundName: sound.name,
      isSystem: sound.isSystem,
      isLocal: !!sound.localUri
    });
  }, [sound, audioControls, trackEvent]);
  
  // Pause the sound
  const pause = useCallback(async () => {
    await audioControls.pause();
  }, [audioControls]);
  
  // Stop the sound
  const stop = useCallback(async () => {
    await audioControls.stop();
  }, [audioControls]);
  
  return {
    sound,
    isPlaying: audioState.isPlaying,
    duration: audioState.duration,
    position: audioState.position,
    isLoaded: audioState.isLoaded,
    isBuffering: audioState.isBuffering,
    play,
    pause,
    stop,
    seekTo: audioControls.seekTo,
    setRate: audioControls.setRate,
    setVolume: audioControls.setVolume,
    toggleMute: audioControls.toggleMute
  };
};