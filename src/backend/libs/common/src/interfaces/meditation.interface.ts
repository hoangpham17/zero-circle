import { Level } from '@prisma/client';

export interface IMeditationSession {
  id: string;
  userId: string;
  duration: number; // in seconds
  startTime: Date;
  endTime?: Date;
  completed: boolean;
  notes?: string;
  
  // New fields for Sprint 1
  backgroundImageId?: string;
  backgroundImage?: any; // IImageResource
  
  startSoundId?: string;
  startSound?: any; // ISoundResource
  
  endSoundId?: string;
  endSound?: any; // ISoundResource
  
  periodicChimeEnabled: boolean;
  periodicChimeInterval?: number;
  periodicChimeSoundId?: string;
  periodicChimeSound?: any; // ISoundResource
  
  configId?: string;
  config?: any; // IMeditationConfig
  
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