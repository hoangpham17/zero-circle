import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/userService';
import { User, UserSettings } from '../types/user';

// User Queries
export const useUser = (id: string) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => userService.getUserById(id),
    enabled: !!id,
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) => 
      userService.updateUser(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user', data.id] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

export const useUserStats = (id: string) => {
  return useQuery({
    queryKey: ['userStats', id],
    queryFn: () => userService.getUserStats(id),
    enabled: !!id,
  });
};

// User Settings Queries
export const useUserSettings = (userId: string) => {
  return useQuery({
    queryKey: ['userSettings', userId],
    queryFn: () => userService.getUserSettings(userId),
    enabled: !!userId,
  });
};

export const useUpdateUserSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, settings }: { userId: string; settings: Partial<UserSettings> }) => 
      userService.updateUserSettings(userId, settings),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['userSettings', data.userId] });
    },
  });
};