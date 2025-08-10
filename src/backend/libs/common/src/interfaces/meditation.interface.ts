import { Level } from '@prisma/client';

export interface IMeditationSession {
  id: string;
  userId: string;
  duration: number; // in seconds
  startTime: Date;
  endTime?: Date;
  completed: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMeditationContent {
  id: string;
  title: string;
  description?: string;
  audioUrl: string;
  duration: number; // in seconds
  level: Level;
  category: string;
  teacher?: string;
  isPublic: boolean;
  isPremium: boolean;
  createdAt: Date;
  updatedAt: Date;
}