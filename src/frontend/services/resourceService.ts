import apiClient from './apiClient';
import { SoundResource, ImageResource } from '../types/meditation';

export const resourceService = {
  // Get all sound resources
  async getAllSounds(params?: { isSystem?: boolean; search?: string }): Promise<SoundResource[]> {
    const response = await apiClient.get('/resources/sounds', { params });
    return response.data;
  },

  // Get sound resource by ID
  async getSoundById(id: string): Promise<SoundResource> {
    const response = await apiClient.get(`/resources/sounds/${id}`);
    return response.data;
  },

  // Create new sound resource
  async createSound(name: string, url: string, duration?: number): Promise<SoundResource> {
    const payload = {
      name,
      url,
      duration,
    };
    const response = await apiClient.post('/resources/sounds', payload);
    return response.data;
  },

  // Update sound resource
  async updateSound(id: string, data: Partial<SoundResource>): Promise<SoundResource> {
    const response = await apiClient.put(`/resources/sounds/${id}`, data);
    return response.data;
  },

  // Delete sound resource
  async deleteSound(id: string): Promise<void> {
    await apiClient.delete(`/resources/sounds/${id}`);
  },

  // Get all image resources
  async getAllImages(params?: { isSystem?: boolean; search?: string }): Promise<ImageResource[]> {
    const response = await apiClient.get('/resources/images', { params });
    return response.data;
  },

  // Get image resource by ID
  async getImageById(id: string): Promise<ImageResource> {
    const response = await apiClient.get(`/resources/images/${id}`);
    return response.data;
  },

  // Create new image resource
  async createImage(name: string, url: string): Promise<ImageResource> {
    const payload = {
      name,
      url,
    };
    const response = await apiClient.post('/resources/images', payload);
    return response.data;
  },

  // Update image resource
  async updateImage(id: string, data: Partial<ImageResource>): Promise<ImageResource> {
    const response = await apiClient.put(`/resources/images/${id}`, data);
    return response.data;
  },

  // Delete image resource
  async deleteImage(id: string): Promise<void> {
    await apiClient.delete(`/resources/images/${id}`);
  },
};