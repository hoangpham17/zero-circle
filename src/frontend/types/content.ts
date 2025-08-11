export interface MeditationContent {
  id: string;
  title: string;
  description?: string;
  audioUrl: string;
  duration: number; // in seconds
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  category: string;
  teacher?: string;
  isPublic: boolean;
  isPremium: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BuddhistContent {
  id: string;
  title: string;
  description?: string;
  contentType: 'TEXT' | 'AUDIO' | 'VIDEO';
  content?: string; // For text content
  audioUrl?: string; // For audio content
  videoUrl?: string; // For video content
  author?: string;
  source?: string;
  isPublic: boolean;
  isPremium: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Favorite {
  id: string;
  userId: string;
  meditationContentId?: string;
  meditationContent?: MeditationContent;
  buddhistContentId?: string;
  buddhistContent?: BuddhistContent;
  createdAt: string;
}

export interface Progress {
  id: string;
  userId: string;
  meditationContentId?: string;
  meditationContent?: MeditationContent;
  buddhistContentId?: string;
  buddhistContent?: BuddhistContent;
  progress: number; // 0-100%
  lastPosition: number; // in seconds for audio/video
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}