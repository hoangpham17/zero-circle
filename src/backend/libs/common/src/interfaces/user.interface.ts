import { Role } from '@prisma/client';

export interface IUser {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  bio?: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserSettings {
  id: string;
  userId: string;
  theme: string;
  notificationsEnabled: boolean;
  reminderTime?: Date;
  language: string;
  createdAt: Date;
  updatedAt: Date;
}