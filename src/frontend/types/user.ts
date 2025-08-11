export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  role: 'USER' | 'CONTENT_MANAGER' | 'TEACHER' | 'ADMIN';
}

export interface UserSettings {
  id: string;
  userId: string;
  theme: string;
  notificationsEnabled: boolean;
  reminderTime?: string;
  language: string;
  createdAt: string;
  updatedAt: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}