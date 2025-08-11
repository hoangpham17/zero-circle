import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { meditationService } from '../services/meditationService';
import { MeditationSession, MeditationConfig } from '../types/meditation';

// Meditation Content Queries
export const useMeditationContent = (params?: { category?: string; level?: string; search?: string }) => {
  return useQuery({
    queryKey: ['meditationContent', params],
    queryFn: () => meditationService.getAllContent(params),
  });
};

export const useMeditationContentById = (id: string) => {
  return useQuery({
    queryKey: ['meditationContent', id],
    queryFn: () => meditationService.getContentById(id),
    enabled: !!id,
  });
};

export const useMeditationCategories = () => {
  return useQuery({
    queryKey: ['meditationCategories'],
    queryFn: meditationService.getCategories,
  });
};

// Meditation Session Queries
export const useUserSessions = (userId: string) => {
  return useQuery({
    queryKey: ['meditationSessions', userId],
    queryFn: () => meditationService.getUserSessions(userId),
    enabled: !!userId,
  });
};

export const useSessionById = (id: string) => {
  return useQuery({
    queryKey: ['meditationSession', id],
    queryFn: () => meditationService.getSessionById(id),
    enabled: !!id,
  });
};

export const useCreateSession = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (sessionData: Partial<MeditationSession>) => 
      meditationService.createSession(sessionData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['meditationSessions', variables.userId] });
    },
  });
};

export const useUpdateSession = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MeditationSession> }) => 
      meditationService.updateSession(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['meditationSession', data.id] });
      queryClient.invalidateQueries({ queryKey: ['meditationSessions', data.userId] });
    },
  });
};

export const useDeleteSession = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) => 
      meditationService.deleteSession(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['meditationSessions', variables.userId] });
    },
  });
};

// Meditation Stats Query
export const useUserStats = (userId: string) => {
  return useQuery({
    queryKey: ['meditationStats', userId],
    queryFn: () => meditationService.getUserStats(userId),
    enabled: !!userId,
  });
};

// Meditation Config Queries
export const useUserConfigs = (userId: string) => {
  return useQuery({
    queryKey: ['meditationConfigs', userId],
    queryFn: () => meditationService.getUserConfigs(userId),
    enabled: !!userId,
  });
};

export const useDefaultConfig = () => {
  return useQuery({
    queryKey: ['meditationDefaultConfig'],
    queryFn: meditationService.getDefaultConfig,
  });
};

export const useConfigById = (id: string) => {
  return useQuery({
    queryKey: ['meditationConfig', id],
    queryFn: () => meditationService.getConfigById(id),
    enabled: !!id,
  });
};

export const useCreateConfig = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (configData: Partial<MeditationConfig>) => 
      meditationService.createConfig(configData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['meditationConfigs', variables.userId] });
    },
  });
};

export const useUpdateConfig = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MeditationConfig> }) => 
      meditationService.updateConfig(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['meditationConfig', data.id] });
      queryClient.invalidateQueries({ queryKey: ['meditationConfigs', data.userId] });
    },
  });
};

export const useDeleteConfig = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) => 
      meditationService.deleteConfig(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['meditationConfigs', variables.userId] });
    },
  });
};