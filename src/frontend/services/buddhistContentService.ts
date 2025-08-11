import apiClient from './apiClient';
import { BuddhistContent, Favorite, Progress } from '../types/content';

export const buddhistContentService = {
  // Get all Buddhist content
  async getAllContent(params?: { category?: string; contentType?: string; search?: string }) {
    const response = await apiClient.get('/buddhist-content', { params });
    return response.data;
  },

  // Get Buddhist content by ID
  async getContentById(id: string): Promise<BuddhistContent> {
    const response = await apiClient.get(`/buddhist-content/${id}`);
    return response.data;
  },

  // Get user favorites
  async getUserFavorites(userId: string): Promise<Favorite[]> {
    const response = await apiClient.get(`/buddhist-content/favorites/user/${userId}`);
    return response.data;
  },

  // Add content to favorites
  async addToFavorites(userId: string, contentId: string, contentType: 'meditation' | 'buddhist'): Promise<Favorite> {
    const payload = {
      userId,
      ...(contentType === 'meditation' ? { meditationContentId: contentId } : { buddhistContentId: contentId }),
    };
    const response = await apiClient.post('/buddhist-content/favorites', payload);
    return response.data;
  },

  // Remove content from favorites
  async removeFromFavorites(favoriteId: string): Promise<void> {
    await apiClient.delete(`/buddhist-content/favorites/${favoriteId}`);
  },

  // Get user progress
  async getUserProgress(userId: string): Promise<Progress[]> {
    const response = await apiClient.get(`/buddhist-content/progress/user/${userId}`);
    return response.data;
  },

  // Create progress for content
  async createProgress(userId: string, contentId: string, contentType: 'meditation' | 'buddhist', progress: number, lastPosition: number, completed: boolean): Promise<Progress> {
    const payload = {
      userId,
      ...(contentType === 'meditation' ? { meditationContentId: contentId } : { buddhistContentId: contentId }),
      progress,
      lastPosition,
      completed,
    };
    const response = await apiClient.post('/buddhist-content/progress', payload);
    return response.data;
  },

  // Update progress for content
  async updateProgress(progressId: string, progress: number, lastPosition: number, completed: boolean): Promise<Progress> {
    const payload = {
      progress,
      lastPosition,
      completed,
    };
    const response = await apiClient.put(`/buddhist-content/progress/${progressId}`, payload);
    return response.data;
  },

  // Get Buddhist content categories
  async getCategories(): Promise<string[]> {
    const response = await apiClient.get('/buddhist-content/categories');
    return response.data;
  },

  // Get related Buddhist content
  async getRelatedContent(contentId: string): Promise<BuddhistContent[]> {
    const response = await apiClient.get(`/buddhist-content/related/${contentId}`);
    return response.data;
  },
};