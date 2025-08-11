import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { buddhistContentService } from '../services/buddhistContentService';
import { Progress } from '../types/content';

// Buddhist Content Queries
export const useBuddhistContent = (params?: { category?: string; contentType?: string; search?: string }) => {
  return useQuery({
    queryKey: ['buddhistContent', params],
    queryFn: () => buddhistContentService.getAllContent(params),
  });
};

export const useBuddhistContentById = (id: string) => {
  return useQuery({
    queryKey: ['buddhistContent', id],
    queryFn: () => buddhistContentService.getContentById(id),
    enabled: !!id,
  });
};

export const useBuddhistCategories = () => {
  return useQuery({
    queryKey: ['buddhistCategories'],
    queryFn: buddhistContentService.getCategories,
  });
};

export const useRelatedContent = (contentId: string) => {
  return useQuery({
    queryKey: ['relatedBuddhistContent', contentId],
    queryFn: () => buddhistContentService.getRelatedContent(contentId),
    enabled: !!contentId,
  });
};

// Favorites Queries
export const useUserFavorites = (userId: string) => {
  return useQuery({
    queryKey: ['buddhistFavorites', userId],
    queryFn: () => buddhistContentService.getUserFavorites(userId),
    enabled: !!userId,
  });
};

export const useAddToFavorites = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, contentId }: { userId: string; contentId: string }) => 
      buddhistContentService.addToFavorites(userId, contentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['buddhistFavorites', variables.userId] });
    },
  });
};

export const useRemoveFromFavorites = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, contentId }: { userId: string; contentId: string }) => 
      buddhistContentService.removeFromFavorites(userId, contentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['buddhistFavorites', variables.userId] });
    },
  });
};

// Progress Queries
export const useUserProgress = (userId: string) => {
  return useQuery({
    queryKey: ['buddhistProgress', userId],
    queryFn: () => buddhistContentService.getUserProgress(userId),
    enabled: !!userId,
  });
};

export const useContentProgress = (userId: string, contentId: string) => {
  return useQuery({
    queryKey: ['buddhistProgress', userId, contentId],
    queryFn: () => buddhistContentService.getUserProgress(userId, contentId),
    enabled: !!userId && !!contentId,
  });
};

export const useCreateProgress = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, contentId, data }: { userId: string; contentId: string; data: Partial<Progress> }) => 
      buddhistContentService.createProgress(userId, contentId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['buddhistProgress', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['buddhistProgress', variables.userId, variables.contentId] });
    },
  });
};

export const useUpdateProgress = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, contentId, data }: { userId: string; contentId: string; data: Partial<Progress> }) => 
      buddhistContentService.updateProgress(userId, contentId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['buddhistProgress', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['buddhistProgress', variables.userId, variables.contentId] });
    },
  });
};