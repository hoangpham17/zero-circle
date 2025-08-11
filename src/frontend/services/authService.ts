import apiClient from './apiClient';
import { User, TokenResponse } from '../types/user';

export const authService = {
  // Login with email and password
  async login(email: string, password: string): Promise<TokenResponse> {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  },

  // Register new user
  async register(email: string, password: string, name: string): Promise<TokenResponse> {
    const response = await apiClient.post('/auth/register', { email, password, name });
    return response.data;
  },

  // Refresh token
  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    const response = await apiClient.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  // Get current user profile
  async getProfile(): Promise<User> {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  // Change password
  async changePassword(oldPassword: string, newPassword: string): Promise<{ message: string }> {
    const response = await apiClient.post('/auth/change-password', { oldPassword, newPassword });
    return response.data;
  },

  // Request password reset
  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Reset password with token
  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const response = await apiClient.post('/auth/reset-password', { token, newPassword });
    return response.data;
  },
};