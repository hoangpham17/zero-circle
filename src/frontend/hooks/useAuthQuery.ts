import { useMutation, useQuery } from '@tanstack/react-query';
import { authService } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';

export const useProfile = () => {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: ['profile'],
    queryFn: authService.getProfile,
    enabled: isAuthenticated,
  });
};

export const useLogin = () => {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => 
      authService.login(email, password),
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: ({ email, password, name }: { email: string; password: string; name: string }) => 
      authService.register(email, password, name),
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: ({ oldPassword, newPassword }: { oldPassword: string; newPassword: string }) => 
      authService.changePassword(oldPassword, newPassword),
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: ({ email }: { email: string }) => 
      authService.forgotPassword(email),
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: ({ token, newPassword }: { token: string; newPassword: string }) => 
      authService.resetPassword(token, newPassword),
  });
};