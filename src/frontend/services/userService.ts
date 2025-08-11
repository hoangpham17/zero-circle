import apiClient from './apiClient';
import { User, UserSettings } from '../types/user';

export const userService = {
  // Get user by ID
  async getUserById(id: string): Promise<User> {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  // Update user
  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const response = await apiClient.put(`/users/${id}`, data);
    return response.data;
  },

  // Get user statistics
  async getUserStats(id: string): Promise<any> {
    const response = await apiClient.get(`/users/${id}/stats`);
    return response.data;
  },

  // Get user settings
  async getUserSettings(userId: string): Promise<UserSettings> {
    const response = await apiClient.get(`/settings/${userId}`);
    return response.data;
  },

  // Update user settings
  async updateUserSettings(userId: string, settings: Partial<UserSettings>): Promise<UserSettings> {
    const response = await apiClient.put(`/settings/${userId}`, settings);
    return response.data;
  },
};