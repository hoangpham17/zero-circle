import { ContentType } from '@prisma/client';

export interface IBuddhistContent {
  id: string;
  title: string;
  description?: string;
  contentType: ContentType;
  content?: string; // For text content
  audioUrl?: string; // For audio content
  videoUrl?: string; // For video content
  author?: string;
  source?: string;
  isPublic: boolean;
  isPremium: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFavorite {
  id: string;
  userId: string;
  meditationContentId?: string;
  buddhistContentId?: string;
  createdAt: Date;
}

export interface IProgress {
  id: string;
  userId: string;
  meditationContentId?: string;
  buddhistContentId?: string;
  progress: number; // 0-100%
  lastPosition: number; // in seconds for audio/video
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}