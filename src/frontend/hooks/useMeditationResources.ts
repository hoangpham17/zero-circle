import { useCallback } from 'react';
import { MeditationConfig, MeditationSession } from '../types/meditation';
import { useSoundResources, useSoundResource, SoundResourceWithLocalUri } from './useSoundResources';
import { useImageResources, useImageResource, ImageResourceWithLocalUri } from './useImageResources';
import { useAnalytics } from './useAnalytics';

interface UseMeditationResourcesReturn {
  // Sound resources
  sounds: SoundResourceWithLocalUri[];
  systemSounds: SoundResourceWithLocalUri[];
  userSounds: SoundResourceWithLocalUri[];
  isSoundsLoading: boolean;
  isSoundsError: boolean;
  soundsError: Error | null;
  
  // Image resources
  images: ImageResourceWithLocalUri[];
  systemImages: ImageResourceWithLocalUri[];
  userImages: ImageResourceWithLocalUri[];
  isImagesLoading: boolean;
  isImagesError: boolean;
  imagesError: Error | null;
  
  // Actions
  refreshResources: () => Promise<void>;
  
  // Sound actions
  createSound: (name: string, url: string, duration?: number) => Promise<SoundResourceWithLocalUri>;
  updateSound: (id: string, data: Partial<SoundResourceWithLocalUri>) => Promise<SoundResourceWithLocalUri>;
  deleteSound: (id: string) => Promise<void>;
  downloadSound: (sound: SoundResourceWithLocalUri) => Promise<string>;
  deleteDownloadedSound: (sound: SoundResourceWithLocalUri) => Promise<void>;
  isSoundDownloaded: (soundId: string) => boolean;
  getSoundLocalUri: (soundId: string) => string | undefined;
  previewSound: (sound: SoundResourceWithLocalUri) => Promise<void>;
  stopSoundPreview: () => Promise<void>;
  isPlayingSound: boolean;
  currentPreviewSoundId: string | null;
  
  // Image actions
  createImage: (name: string, url: string) => Promise<ImageResourceWithLocalUri>;
  updateImage: (id: string, data: Partial<ImageResourceWithLocalUri>) => Promise<ImageResourceWithLocalUri>;
  deleteImage: (id: string) => Promise<void>;
  downloadImage: (image: ImageResourceWithLocalUri) => Promise<string>;
  deleteDownloadedImage: (image: ImageResourceWithLocalUri) => Promise<void>;
  isImageDownloaded: (imageId: string) => boolean;
  getImageLocalUri: (imageId: string) => string | undefined;
  
  // Helpers
  getResourcesForConfig: (config: MeditationConfig) => {
    backgroundImage?: ImageResourceWithLocalUri;
    startSound?: SoundResourceWithLocalUri;
    endSound?: SoundResourceWithLocalUri;
    periodicChimeSound?: SoundResourceWithLocalUri;
  };
  getResourcesForSession: (session: MeditationSession) => {
    backgroundImage?: ImageResourceWithLocalUri;
    startSound?: SoundResourceWithLocalUri;
    endSound?: SoundResourceWithLocalUri;
    periodicChimeSound?: SoundResourceWithLocalUri;
  };
  ensureResourcesDownloaded: (resources: {
    backgroundImage?: ImageResourceWithLocalUri;
    startSound?: SoundResourceWithLocalUri;
    endSound?: SoundResourceWithLocalUri;
    periodicChimeSound?: SoundResourceWithLocalUri;
  }) => Promise<void>;
}

export const useMeditationResources = (): UseMeditationResourcesReturn => {
  const { trackEvent } = useAnalytics();
  
  // Sound resources
  const {
    sounds,
    systemSounds,
    userSounds,
    isLoading: isSoundsLoading,
    isError: isSoundsError,
    error: soundsError,
    refreshSounds,
    createSound,
    updateSound,
    deleteSound,
    downloadSound,
    deleteDownloadedSound,
    isDownloaded: isSoundDownloaded,
    getLocalUri: getSoundLocalUri,
    previewSound,
    stopPreview: stopSoundPreview,
    isPlaying: isPlayingSound,
    currentPreviewId: currentPreviewSoundId
  } = useSoundResources();
  
  // Image resources
  const {
    images,
    systemImages,
    userImages,
    isLoading: isImagesLoading,
    isError: isImagesError,
    error: imagesError,
    refreshImages,
    createImage,
    updateImage,
    deleteImage,
    downloadImage,
    deleteDownloadedImage,
    isDownloaded: isImageDownloaded,
    getLocalUri: getImageLocalUri
  } = useImageResources();
  
  // Refresh all resources
  const refreshResources = useCallback(async (): Promise<void> => {
    await Promise.all([refreshSounds(), refreshImages()]);
  }, [refreshSounds, refreshImages]);
  
  // Get resources for a meditation config
  const getResourcesForConfig = useCallback((config: MeditationConfig) => {
    const backgroundImage = config.backgroundImageId
      ? images.find(img => img.id === config.backgroundImageId)
      : undefined;
      
    const startSound = config.startSoundId
      ? sounds.find(snd => snd.id === config.startSoundId)
      : undefined;
      
    const endSound = config.endSoundId
      ? sounds.find(snd => snd.id === config.endSoundId)
      : undefined;
      
    const periodicChimeSound = config.periodicChimeSoundId
      ? sounds.find(snd => snd.id === config.periodicChimeSoundId)
      : undefined;
      
    return {
      backgroundImage,
      startSound,
      endSound,
      periodicChimeSound
    };
  }, [images, sounds]);
  
  // Get resources for a meditation session
  const getResourcesForSession = useCallback((session: MeditationSession) => {
    const backgroundImage = session.backgroundImageId
      ? images.find(img => img.id === session.backgroundImageId)
      : undefined;
      
    const startSound = session.startSoundId
      ? sounds.find(snd => snd.id === session.startSoundId)
      : undefined;
      
    const endSound = session.endSoundId
      ? sounds.find(snd => snd.id === session.endSoundId)
      : undefined;
      
    const periodicChimeSound = session.periodicChimeSoundId
      ? sounds.find(snd => snd.id === session.periodicChimeSoundId)
      : undefined;
      
    return {
      backgroundImage,
      startSound,
      endSound,
      periodicChimeSound
    };
  }, [images, sounds]);
  
  // Ensure all resources are downloaded
  const ensureResourcesDownloaded = useCallback(async (resources: {
    backgroundImage?: ImageResourceWithLocalUri;
    startSound?: SoundResourceWithLocalUri;
    endSound?: SoundResourceWithLocalUri;
    periodicChimeSound?: SoundResourceWithLocalUri;
  }): Promise<void> => {
    const downloadPromises: Promise<string>[] = [];
    
    // Download background image if needed
    if (resources.backgroundImage && !resources.backgroundImage.isDownloaded) {
      downloadPromises.push(downloadImage(resources.backgroundImage));
    }
    
    // Download start sound if needed
    if (resources.startSound && !resources.startSound.isDownloaded) {
      downloadPromises.push(downloadSound(resources.startSound));
    }
    
    // Download end sound if needed
    if (resources.endSound && !resources.endSound.isDownloaded) {
      downloadPromises.push(downloadSound(resources.endSound));
    }
    
    // Download periodic chime sound if needed
    if (resources.periodicChimeSound && !resources.periodicChimeSound.isDownloaded) {
      downloadPromises.push(downloadSound(resources.periodicChimeSound));
    }
    
    if (downloadPromises.length > 0) {
      trackEvent('meditation_resources_downloaded', {
        resourceCount: downloadPromises.length
      });
      
      await Promise.all(downloadPromises);
    }
  }, [downloadImage, downloadSound, trackEvent]);
  
  return {
    // Sound resources
    sounds,
    systemSounds,
    userSounds,
    isSoundsLoading,
    isSoundsError,
    soundsError,
    
    // Image resources
    images,
    systemImages,
    userImages,
    isImagesLoading,
    isImagesError,
    imagesError,
    
    // Actions
    refreshResources,
    
    // Sound actions
    createSound,
    updateSound,
    deleteSound,
    downloadSound,
    deleteDownloadedSound,
    isSoundDownloaded,
    getSoundLocalUri,
    previewSound,
    stopSoundPreview,
    isPlayingSound,
    currentPreviewSoundId,
    
    // Image actions
    createImage,
    updateImage,
    deleteImage,
    downloadImage,
    deleteDownloadedImage,
    isImageDownloaded,
    getImageLocalUri,
    
    // Helpers
    getResourcesForConfig,
    getResourcesForSession,
    ensureResourcesDownloaded
  };
};

// Hook to get resources for a specific meditation config
export const useMeditationConfigResources = (config?: MeditationConfig) => {
  const {
    images,
    sounds,
    isSoundsLoading,
    isImagesLoading,
    downloadSound,
    downloadImage,
    isSoundDownloaded,
    isImageDownloaded,
    getSoundLocalUri,
    getImageLocalUri
  } = useMeditationResources();
  
  // Get background image
  const backgroundImage = config?.backgroundImageId
    ? images.find(img => img.id === config.backgroundImageId)
    : undefined;
    
  // Get start sound
  const startSound = config?.startSoundId
    ? sounds.find(snd => snd.id === config.startSoundId)
    : undefined;
    
  // Get end sound
  const endSound = config?.endSoundId
    ? sounds.find(snd => snd.id === config.endSoundId)
    : undefined;
    
  // Get periodic chime sound
  const periodicChimeSound = config?.periodicChimeSoundId && config.periodicChimeEnabled
    ? sounds.find(snd => snd.id === config.periodicChimeSoundId)
    : undefined;
  
  // Check if all resources are downloaded
  const allResourcesDownloaded = (
    (!backgroundImage || backgroundImage.isDownloaded) &&
    (!startSound || startSound.isDownloaded) &&
    (!endSound || endSound.isDownloaded) &&
    (!periodicChimeSound || periodicChimeSound.isDownloaded)
  );
  
  // Download all resources
  const downloadAllResources = async (): Promise<void> => {
    const downloadPromises: Promise<string>[] = [];
    
    if (backgroundImage && !backgroundImage.isDownloaded) {
      downloadPromises.push(downloadImage(backgroundImage));
    }
    
    if (startSound && !startSound.isDownloaded) {
      downloadPromises.push(downloadSound(startSound));
    }
    
    if (endSound && !endSound.isDownloaded) {
      downloadPromises.push(downloadSound(endSound));
    }
    
    if (periodicChimeSound && !periodicChimeSound.isDownloaded) {
      downloadPromises.push(downloadSound(periodicChimeSound));
    }
    
    await Promise.all(downloadPromises);
  };
  
  return {
    backgroundImage,
    startSound,
    endSound,
    periodicChimeSound,
    isLoading: isSoundsLoading || isImagesLoading,
    allResourcesDownloaded,
    downloadAllResources
  };
};

// Hook to get resources for a specific meditation session
export const useMeditationSessionResources = (session?: MeditationSession) => {
  const {
    images,
    sounds,
    isSoundsLoading,
    isImagesLoading,
    downloadSound,
    downloadImage,
    isSoundDownloaded,
    isImageDownloaded,
    getSoundLocalUri,
    getImageLocalUri
  } = useMeditationResources();
  
  // Get background image
  const backgroundImage = session?.backgroundImageId
    ? images.find(img => img.id === session.backgroundImageId)
    : undefined;
    
  // Get start sound
  const startSound = session?.startSoundId
    ? sounds.find(snd => snd.id === session.startSoundId)
    : undefined;
    
  // Get end sound
  const endSound = session?.endSoundId
    ? sounds.find(snd => snd.id === session.endSoundId)
    : undefined;
    
  // Get periodic chime sound
  const periodicChimeSound = session?.periodicChimeSoundId && session.periodicChimeEnabled
    ? sounds.find(snd => snd.id === session.periodicChimeSoundId)
    : undefined;
  
  // Check if all resources are downloaded
  const allResourcesDownloaded = (
    (!backgroundImage || backgroundImage.isDownloaded) &&
    (!startSound || startSound.isDownloaded) &&
    (!endSound || endSound.isDownloaded) &&
    (!periodicChimeSound || periodicChimeSound.isDownloaded)
  );
  
  // Download all resources
  const downloadAllResources = async (): Promise<void> => {
    const downloadPromises: Promise<string>[] = [];
    
    if (backgroundImage && !backgroundImage.isDownloaded) {
      downloadPromises.push(downloadImage(backgroundImage));
    }
    
    if (startSound && !startSound.isDownloaded) {
      downloadPromises.push(downloadSound(startSound));
    }
    
    if (endSound && !endSound.isDownloaded) {
      downloadPromises.push(downloadSound(endSound));
    }
    
    if (periodicChimeSound && !periodicChimeSound.isDownloaded) {
      downloadPromises.push(downloadSound(periodicChimeSound));
    }
    
    await Promise.all(downloadPromises);
  };
  
  return {
    backgroundImage,
    startSound,
    endSound,
    periodicChimeSound,
    isLoading: isSoundsLoading || isImagesLoading,
    allResourcesDownloaded,
    downloadAllResources
  };
};