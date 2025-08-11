export interface MeditationSession {
  id: string;
  userId: string;
  duration: number; // in seconds
  startTime: string;
  endTime?: string;
  completed: boolean;
  notes?: string;
  
  // Background and sound settings
  backgroundImageId?: string;
  backgroundImage?: ImageResource;
  startSoundId?: string;
  startSound?: SoundResource;
  endSoundId?: string;
  endSound?: SoundResource;
  
  // Periodic chime settings
  periodicChimeEnabled: boolean;
  periodicChimeInterval?: number; // in seconds
  periodicChimeSoundId?: string;
  periodicChimeSound?: SoundResource;
  
  // Configuration reference
  configId?: string;
  config?: MeditationConfig;
  
  createdAt: string;
  updatedAt: string;
}

export interface MeditationConfig {
  id: string;
  userId: string;
  name: string;
  isDefault: boolean;
  
  // Configuration settings
  backgroundImageId?: string;
  backgroundImage?: ImageResource;
  startSoundId?: string;
  startSound?: SoundResource;
  endSoundId?: string;
  endSound?: SoundResource;
  
  // Periodic chime settings
  periodicChimeEnabled: boolean;
  periodicChimeInterval?: number; // in seconds
  periodicChimeSoundId?: string;
  periodicChimeSound?: SoundResource;
  
  createdAt: string;
  updatedAt: string;
}

export interface SoundResource {
  id: string;
  name: string;
  url: string;
  duration?: number; // in seconds
  isSystem: boolean;
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ImageResource {
  id: string;
  name: string;
  url: string;
  isSystem: boolean;
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MeditationStats {
  totalSessions: number;
  totalMinutes: number;
  longestStreak: number;
  currentStreak: number;
  completedSessions: number;
  averageSessionLength: number; // in minutes
}