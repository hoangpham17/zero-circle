export interface ISoundResource {
  id: string;
  name: string;
  url: string;
  duration?: number; // in seconds
  isSystem: boolean;
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IImageResource {
  id: string;
  name: string;
  url: string;
  isSystem: boolean;
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
}