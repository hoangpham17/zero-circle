import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { resourceService } from '../services/resourceService';
import { SoundResource, ImageResource } from '../types/meditation';

// Sound Resource Queries
export const useSoundResources = (params?: { isSystem?: boolean; search?: string }) => {
  return useQuery({
    queryKey: ['soundResources', params],
    queryFn: () => resourceService.getAllSounds(params),
  });
};

export const useSoundResourceById = (id: string) => {
  return useQuery({
    queryKey: ['soundResource', id],
    queryFn: () => resourceService.getSoundById(id),
    enabled: !!id,
  });
};

export const useCreateSound = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ name, url, duration }: { name: string; url: string; duration?: number }) => 
      resourceService.createSound(name, url, duration),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['soundResources'] });
    },
  });
};

export const useUpdateSound = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SoundResource> }) => 
      resourceService.updateSound(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['soundResource', data.id] });
      queryClient.invalidateQueries({ queryKey: ['soundResources'] });
    },
  });
};

export const useDeleteSound = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => resourceService.deleteSound(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['soundResources'] });
      queryClient.removeQueries({ queryKey: ['soundResource', id] });
    },
  });
};

// Image Resource Queries
export const useImageResources = (params?: { isSystem?: boolean; search?: string }) => {
  return useQuery({
    queryKey: ['imageResources', params],
    queryFn: () => resourceService.getAllImages(params),
  });
};

export const useImageResourceById = (id: string) => {
  return useQuery({
    queryKey: ['imageResource', id],
    queryFn: () => resourceService.getImageById(id),
    enabled: !!id,
  });
};

export const useCreateImage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ name, url }: { name: string; url: string }) => 
      resourceService.createImage(name, url),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['imageResources'] });
    },
  });
};

export const useUpdateImage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ImageResource> }) => 
      resourceService.updateImage(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['imageResource', data.id] });
      queryClient.invalidateQueries({ queryKey: ['imageResources'] });
    },
  });
};

export const useDeleteImage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => resourceService.deleteImage(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['imageResources'] });
      queryClient.removeQueries({ queryKey: ['imageResource', id] });
    },
  });
};