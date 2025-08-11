import { useState, useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { ImageResource } from '../types/meditation';
import { useNetworkState } from './useAppState';
import { useAnalytics } from './useAnalytics';
import {
  useImageResources as useImageResourcesQuery,
  useImageResourceById,
  useCreateImage,
  useUpdateImage,
  useDeleteImage
} from './useResourceQuery';

const IMAGE_RESOURCES_CACHE_KEY = 'image_resources_cache';
const IMAGE_RESOURCES_CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

export interface ImageResourceWithLocalUri extends ImageResource {
  localUri?: string;
  isDownloaded?: boolean;
}

interface UseImageResourcesReturn {
  // Data
  images: ImageResourceWithLocalUri[];
  systemImages: ImageResourceWithLocalUri[];
  userImages: ImageResourceWithLocalUri[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  
  // Actions
  refreshImages: () => Promise<void>;
  createImage: (name: string, url: string) => Promise<ImageResource>;
  updateImage: (id: string, data: Partial<ImageResource>) => Promise<ImageResource>;
  deleteImage: (id: string) => Promise<void>;
  
  // Download management
  downloadImage: (image: ImageResource) => Promise<string>;
  deleteDownloadedImage: (image: ImageResourceWithLocalUri) => Promise<void>;
  isDownloaded: (imageId: string) => boolean;
  getLocalUri: (imageId: string) => string | undefined;
}

export const useImageResources = (params?: { isSystem?: boolean; search?: string }): UseImageResourcesReturn => {
  const { isConnected } = useNetworkState();
  const { trackEvent } = useAnalytics();
  const queryClient = useQueryClient();
  
  // State
  const [downloadedImages, setDownloadedImages] = useState<Record<string, string>>({});
  
  // Queries
  const { data: remoteImages, isLoading, isError, error, refetch } = useImageResourcesQuery(params);
  
  // Load downloaded images from storage
  useEffect(() => {
    const loadDownloadedImages = async () => {
      try {
        const storedData = await AsyncStorage.getItem('downloaded_images');
        if (storedData) {
          setDownloadedImages(JSON.parse(storedData));
        }
      } catch (error) {
        console.error('Error loading downloaded images:', error);
      }
    };
    
    loadDownloadedImages();
  }, []);
  
  // Save downloaded images to storage when changed
  useEffect(() => {
    const saveDownloadedImages = async () => {
      try {
        await AsyncStorage.setItem('downloaded_images', JSON.stringify(downloadedImages));
      } catch (error) {
        console.error('Error saving downloaded images:', error);
      }
    };
    
    if (Object.keys(downloadedImages).length > 0) {
      saveDownloadedImages();
    }
  }, [downloadedImages]);
  
  // Combine remote images with local information
  const images: ImageResourceWithLocalUri[] = (remoteImages || []).map(image => ({
    ...image,
    localUri: downloadedImages[image.id],
    isDownloaded: !!downloadedImages[image.id]
  }));
  
  // Filter system and user images
  const systemImages = images.filter(image => image.isSystem);
  const userImages = images.filter(image => !image.isSystem);
  
  // Mutations
  const createImageMutation = useCreateImage();
  const updateImageMutation = useUpdateImage();
  const deleteImageMutation = useDeleteImage();
  
  // Download an image for offline use
  const downloadImage = useCallback(async (image: ImageResourceWithLocalUri): Promise<string> => {
    if (!image.url) {
      throw new Error('Image URL is required for download');
    }
    
    try {
      // Create directory if it doesn't exist
      const imagesDir = `${FileSystem.documentDirectory}images/`;
      const dirInfo = await FileSystem.getInfoAsync(imagesDir);
      
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(imagesDir, { intermediates: true });
      }
      
      // Generate local filename
      const fileExtension = image.url.split('.').pop() || 'jpg';
      const localUri = `${imagesDir}${image.id}.${fileExtension}`;
      
      // Check if file already exists
      const fileInfo = await FileSystem.getInfoAsync(localUri);
      
      if (!fileInfo.exists) {
        // Download the file
        const downloadResult = await FileSystem.downloadAsync(image.url, localUri);
        
        if (downloadResult.status !== 200) {
          throw new Error(`Failed to download image: ${downloadResult.status}`);
        }
        
        // Update state with new downloaded image
        setDownloadedImages((prev: Record<string, string>) => ({
          ...prev,
          [image.id]: localUri
        }));
        
        trackEvent('image_downloaded', {
          imageId: image.id,
          imageName: image.name,
          isSystem: image.isSystem
        });
        
        return localUri;
      }
      
      // File already exists
      setDownloadedImages((prev: Record<string, string>) => ({
        ...prev,
        [image.id]: localUri
      }));
      
      return localUri;
    } catch (error) {
      console.error('Error downloading image:', error);
      throw error;
    }
  }, [trackEvent]);
  
  // Delete a downloaded image
  const deleteDownloadedImage = useCallback(async (image: ImageResourceWithLocalUri): Promise<void> => {
    if (!image.localUri) {
      return;
    }
    
    try {
      // Check if file exists
      const fileInfo = await FileSystem.getInfoAsync(image.localUri);
      
      if (fileInfo.exists) {
        // Delete the file
        await FileSystem.deleteAsync(image.localUri);
      }
      
      // Update state to remove the downloaded image
      setDownloadedImages((prev: Record<string, string>) => {
        const updated = { ...prev };
        delete updated[image.id];
        return updated;
      });
      
      trackEvent('image_deleted', {
        imageId: image.id,
        imageName: image.name,
        isSystem: image.isSystem
      });
    } catch (error) {
      console.error('Error deleting downloaded image:', error);
      throw error;
    }
  }, [trackEvent]);
  
  // Check if an image is downloaded
  const isDownloaded = useCallback((imageId: string): boolean => {
    return !!downloadedImages[imageId];
  }, [downloadedImages]);
  
  // Get local URI for an image
  const getLocalUri = useCallback((imageId: string): string | undefined => {
    return downloadedImages[imageId];
  }, [downloadedImages]);
  
  // Refresh images
  const refreshImages = useCallback(async (): Promise<void> => {
    if (isConnected) {
      await refetch();
    }
  }, [isConnected, refetch]);
  
  // Create a new image
  const createImage = useCallback(async (name: string, url: string): Promise<ImageResource> => {
    if (!isConnected) {
      throw new Error('Cannot create image while offline');
    }
    
    const result = await createImageMutation.mutateAsync({ name, url });
    
    trackEvent('image_created', {
      imageId: result.id,
      imageName: result.name
    });
    
    return result;
  }, [isConnected, createImageMutation, trackEvent]);
  
  // Update an image
  const updateImage = useCallback(async (id: string, data: Partial<ImageResource>): Promise<ImageResource> => {
    if (!isConnected) {
      throw new Error('Cannot update image while offline');
    }
    
    const result = await updateImageMutation.mutateAsync({ id, data });
    
    trackEvent('image_updated', {
      imageId: result.id,
      imageName: result.name
    });
    
    return result;
  }, [isConnected, updateImageMutation, trackEvent]);
  
  // Delete an image
  const deleteImage = useCallback(async (id: string): Promise<void> => {
    if (!isConnected) {
      throw new Error('Cannot delete image while offline');
    }
    
    // If the image is downloaded, delete the local file first
    if (downloadedImages[id]) {
      const image = images.find(i => i.id === id);
      if (image) {
        await deleteDownloadedImage(image);
      }
    }
    
    await deleteImageMutation.mutateAsync(id);
    
    trackEvent('image_deleted', {
      imageId: id
    });
  }, [isConnected, downloadedImages, images, deleteDownloadedImage, deleteImageMutation, trackEvent]);
  
  return {
    images,
    systemImages,
    userImages,
    isLoading,
    isError,
    error,
    refreshImages,
    createImage,
    updateImage,
    deleteImage,
    downloadImage,
    deleteDownloadedImage,
    isDownloaded,
    getLocalUri
  };
};

// Hook to get a specific image by ID
export const useImageResource = (id: string) => {
  const { isConnected } = useNetworkState();
  const [downloadedImages, setDownloadedImages] = useState<Record<string, string>>({});
  
  // Query for remote image
  const { data: image, isLoading, isError, error } = useImageResourceById(id);
  
  // Load downloaded images from storage
  useEffect(() => {
    const loadDownloadedImages = async () => {
      try {
        const storedData = await AsyncStorage.getItem('downloaded_images');
        if (storedData) {
          setDownloadedImages(JSON.parse(storedData));
        }
      } catch (error) {
        console.error('Error loading downloaded images:', error);
      }
    };
    
    loadDownloadedImages();
  }, []);
  
  // Combine remote image with local information
  const imageWithLocalInfo: ImageResourceWithLocalUri | undefined = image
    ? {
        ...image,
        localUri: downloadedImages[image.id],
        isDownloaded: !!downloadedImages[image.id]
      }
    : undefined;
  
  return {
    image: imageWithLocalInfo,
    isLoading,
    isError,
    error,
    isOffline: !isConnected
  };
};

// Hook for system images
export const useSystemImages = () => {
  const { systemImages, isLoading, isError, error, ...rest } = useImageResources({ isSystem: true });
  
  return {
    images: systemImages,
    isLoading,
    isError,
    error,
    ...rest
  };
};

// Hook for user images
export const useUserImages = () => {
  const { userImages, isLoading, isError, error, ...rest } = useImageResources({ isSystem: false });
  
  return {
    images: userImages,
    isLoading,
    isError,
    error,
    ...rest
  };
};