import apiClient from './apiClient';

export const contentService = {
  // Search for content across all types
  async searchContent(query: string, contentType?: string, category?: string) {
    const params = { query, contentType, category };
    const response = await apiClient.get('/content/search', { params });
    return response.data;
  },

  // Get featured content
  async getFeaturedContent() {
    const response = await apiClient.get('/content/featured');
    return response.data;
  },

  // Get recommended content based on user preferences
  async getRecommendedContent(userId: string) {
    const response = await apiClient.get('/content/recommended', { params: { userId } });
    return response.data;
  },
};