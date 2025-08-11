import apiClient from './apiClient';
import { MeditationContent, Progress } from '../types/content';
import { MeditationSession, MeditationConfig, MeditationStats } from '../types/meditation';

export const meditationService = {
  // Get all meditation content
  async getAllContent(params?: { category?: string; level?: string; search?: string }) {
    const response = await apiClient.get('/meditation/content', { params });
    return response.data;
  },

  // Get meditation content by ID
  async getContentById(id: string): Promise<MeditationContent> {
    const response = await apiClient.get(`/meditation/content/${id}`);
    return response.data;
  },

  // Get user meditation sessions
  async getUserSessions(userId: string): Promise<MeditationSession[]> {
    const response = await apiClient.get('/meditation/sessions', { params: { userId } });
    return response.data;
  },

  // Get meditation session by ID
  async getSessionById(id: string): Promise<MeditationSession> {
    const response = await apiClient.get(`/meditation/sessions/${id}`);
    return response.data;
  },

  // Create new meditation session
  async createSession(sessionData: Partial<MeditationSession>): Promise<MeditationSession> {
    const response = await apiClient.post('/meditation/sessions', sessionData);
    return response.data;
  },

  // Update meditation session
  async updateSession(id: string, sessionData: Partial<MeditationSession>): Promise<MeditationSession> {
    const response = await apiClient.put(`/meditation/sessions/${id}`, sessionData);
    return response.data;
  },

  // Delete meditation session
  async deleteSession(id: string): Promise<void> {
    await apiClient.delete(`/meditation/sessions/${id}`);
  },

  // Get meditation categories
  async getCategories(): Promise<string[]> {
    const response = await apiClient.get('/meditation/categories');
    return response.data;
  },

  // Get user meditation stats
  async getUserStats(userId: string): Promise<MeditationStats> {
    const response = await apiClient.get('/meditation/stats', { params: { userId } });
    return response.data;
  },

  // Get user meditation configs
  async getUserConfigs(userId: string): Promise<MeditationConfig[]> {
    const response = await apiClient.get('/meditation-config', { params: { userId } });
    return response.data;
  },

  // Get default meditation config
  async getDefaultConfig(): Promise<MeditationConfig> {
    const response = await apiClient.get('/meditation-config/default');
    return response.data;
  },

  // Get meditation config by ID
  async getConfigById(id: string): Promise<MeditationConfig> {
    const response = await apiClient.get(`/meditation-config/${id}`);
    return response.data;
  },

  // Create new meditation config
  async createConfig(configData: Partial<MeditationConfig>): Promise<MeditationConfig> {
    const response = await apiClient.post('/meditation-config', configData);
    return response.data;
  },

  // Update meditation config
  async updateConfig(id: string, configData: Partial<MeditationConfig>): Promise<MeditationConfig> {
    const response = await apiClient.put(`/meditation-config/${id}`, configData);
    return response.data;
  },

  // Delete meditation config
  async deleteConfig(id: string): Promise<void> {
    await apiClient.delete(`/meditation-config/${id}`);
  },
};