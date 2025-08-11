import { IImageResource, ISoundResource } from './resource.interface';

export interface IMeditationConfig {
  id: string;
  userId: string;
  name: string;
  isDefault: boolean;
  
  backgroundImageId?: string;
  backgroundImage?: IImageResource;
  
  startSoundId?: string;
  startSound?: ISoundResource;
  
  endSoundId?: string;
  endSound?: ISoundResource;
  
  periodicChimeEnabled: boolean;
  periodicChimeInterval?: number;
  periodicChimeSoundId?: string;
  periodicChimeSound?: ISoundResource;
  
  createdAt: Date;
  updatedAt: Date;
}