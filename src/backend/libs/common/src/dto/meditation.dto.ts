import { IsString, IsNumber, IsOptional, IsBoolean, IsEnum, IsUUID, IsDateString, IsUrl, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Level } from '@prisma/client';

export class CreateMeditationSessionDto {
  @ApiProperty({ description: 'Meditation duration in seconds' })
  @IsNumber()
  @Min(1)
  duration: number;

  @ApiProperty({ description: 'Meditation start time' })
  @IsDateString()
  startTime: Date;

  @ApiPropertyOptional({ description: 'Meditation end time' })
  @IsDateString()
  @IsOptional()
  endTime?: Date;

  @ApiPropertyOptional({ description: 'Meditation completion status', default: false })
  @IsBoolean()
  @IsOptional()
  completed?: boolean;

  @ApiPropertyOptional({ description: 'Meditation session notes' })
  @IsString()
  @IsOptional()
  notes?: string;
  
  @ApiPropertyOptional({ description: 'Background image ID' })
  @IsUUID()
  @IsOptional()
  backgroundImageId?: string;
  
  @ApiPropertyOptional({ description: 'Start sound ID' })
  @IsUUID()
  @IsOptional()
  startSoundId?: string;
  
  @ApiPropertyOptional({ description: 'End sound ID' })
  @IsUUID()
  @IsOptional()
  endSoundId?: string;
  
  @ApiPropertyOptional({ description: 'Enable periodic chimes', default: false })
  @IsBoolean()
  @IsOptional()
  periodicChimeEnabled?: boolean;
  
  @ApiPropertyOptional({ description: 'Periodic chime interval in seconds' })
  @IsNumber()
  @IsOptional()
  periodicChimeInterval?: number;
  
  @ApiPropertyOptional({ description: 'Periodic chime sound ID' })
  @IsUUID()
  @IsOptional()
  periodicChimeSoundId?: string;
  
  @ApiPropertyOptional({ description: 'Meditation configuration ID' })
  @IsUUID()
  @IsOptional()
  configId?: string;
}

export class UpdateMeditationSessionDto {
  @ApiPropertyOptional({ description: 'Meditation duration in seconds' })
  @IsNumber()
  @Min(1)
  @IsOptional()
  duration?: number;

  @ApiPropertyOptional({ description: 'Meditation end time' })
  @IsDateString()
  @IsOptional()
  endTime?: Date;

  @ApiPropertyOptional({ description: 'Meditation completion status' })
  @IsBoolean()
  @IsOptional()
  completed?: boolean;

  @ApiPropertyOptional({ description: 'Meditation session notes' })
  @IsString()
  @IsOptional()
  notes?: string;
  
  @ApiPropertyOptional({ description: 'Background image ID' })
  @IsUUID()
  @IsOptional()
  backgroundImageId?: string;
  
  @ApiPropertyOptional({ description: 'Start sound ID' })
  @IsUUID()
  @IsOptional()
  startSoundId?: string;
  
  @ApiPropertyOptional({ description: 'End sound ID' })
  @IsUUID()
  @IsOptional()
  endSoundId?: string;
  
  @ApiPropertyOptional({ description: 'Enable periodic chimes' })
  @IsBoolean()
  @IsOptional()
  periodicChimeEnabled?: boolean;
  
  @ApiPropertyOptional({ description: 'Periodic chime interval in seconds' })
  @IsNumber()
  @IsOptional()
  periodicChimeInterval?: number;
  
  @ApiPropertyOptional({ description: 'Periodic chime sound ID' })
  @IsUUID()
  @IsOptional()
  periodicChimeSoundId?: string;
  
  @ApiPropertyOptional({ description: 'Meditation configuration ID' })
  @IsUUID()
  @IsOptional()
  configId?: string;
}

export class CreateMeditationContentDto {
  @ApiProperty({ description: 'Meditation title' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Meditation description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Meditation audio URL' })
  @IsUrl()
  audioUrl: string;

  @ApiProperty({ description: 'Meditation duration in seconds' })
  @IsNumber()
  @Min(1)
  duration: number;

  @ApiProperty({ description: 'Meditation difficulty level', enum: Level, default: Level.BEGINNER })
  @IsEnum(Level)
  @IsOptional()
  level?: Level;

  @ApiProperty({ description: 'Meditation category' })
  @IsString()
  category: string;

  @ApiPropertyOptional({ description: 'Meditation teacher' })
  @IsString()
  @IsOptional()
  teacher?: string;

  @ApiPropertyOptional({ description: 'Meditation public status', default: true })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @ApiPropertyOptional({ description: 'Meditation premium status', default: false })
  @IsBoolean()
  @IsOptional()
  isPremium?: boolean;
}

export class UpdateMeditationContentDto {
  @ApiPropertyOptional({ description: 'Meditation title' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'Meditation description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Meditation audio URL' })
  @IsUrl()
  @IsOptional()
  audioUrl?: string;

  @ApiPropertyOptional({ description: 'Meditation duration in seconds' })
  @IsNumber()
  @Min(1)
  @IsOptional()
  duration?: number;

  @ApiPropertyOptional({ description: 'Meditation difficulty level', enum: Level })
  @IsEnum(Level)
  @IsOptional()
  level?: Level;

  @ApiPropertyOptional({ description: 'Meditation category' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ description: 'Meditation teacher' })
  @IsString()
  @IsOptional()
  teacher?: string;

  @ApiPropertyOptional({ description: 'Meditation public status' })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @ApiPropertyOptional({ description: 'Meditation premium status' })
  @IsBoolean()
  @IsOptional()
  isPremium?: boolean;
}

export class MeditationSessionResponseDto {
  @ApiProperty({ description: 'Meditation session ID' })
  id: string;

  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ description: 'Meditation duration in seconds' })
  duration: number;

  @ApiProperty({ description: 'Meditation start time' })
  startTime: Date;

  @ApiPropertyOptional({ description: 'Meditation end time' })
  endTime?: Date;

  @ApiProperty({ description: 'Meditation completion status' })
  completed: boolean;

  @ApiPropertyOptional({ description: 'Meditation session notes' })
  notes?: string;
  
  @ApiPropertyOptional({ description: 'Background image ID' })
  backgroundImageId?: string;
  
  @ApiPropertyOptional({ description: 'Background image details' })
  backgroundImage?: any; // Will be populated with ImageResourceResponseDto
  
  @ApiPropertyOptional({ description: 'Start sound ID' })
  startSoundId?: string;
  
  @ApiPropertyOptional({ description: 'Start sound details' })
  startSound?: any; // Will be populated with SoundResourceResponseDto
  
  @ApiPropertyOptional({ description: 'End sound ID' })
  endSoundId?: string;
  
  @ApiPropertyOptional({ description: 'End sound details' })
  endSound?: any; // Will be populated with SoundResourceResponseDto
  
  @ApiProperty({ description: 'Enable periodic chimes' })
  periodicChimeEnabled: boolean;
  
  @ApiPropertyOptional({ description: 'Periodic chime interval in seconds' })
  periodicChimeInterval?: number;
  
  @ApiPropertyOptional({ description: 'Periodic chime sound ID' })
  periodicChimeSoundId?: string;
  
  @ApiPropertyOptional({ description: 'Periodic chime sound details' })
  periodicChimeSound?: any; // Will be populated with SoundResourceResponseDto
  
  @ApiPropertyOptional({ description: 'Meditation configuration ID' })
  configId?: string;
  
  @ApiPropertyOptional({ description: 'Meditation configuration details' })
  config?: any; // Will be populated with MeditationConfigResponseDto

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;
}

export class MeditationContentResponseDto {
  @ApiProperty({ description: 'Meditation content ID' })
  id: string;

  @ApiProperty({ description: 'Meditation title' })
  title: string;

  @ApiPropertyOptional({ description: 'Meditation description' })
  description?: string;

  @ApiProperty({ description: 'Meditation audio URL' })
  audioUrl: string;

  @ApiProperty({ description: 'Meditation duration in seconds' })
  duration: number;

  @ApiProperty({ description: 'Meditation difficulty level', enum: Level })
  level: Level;

  @ApiProperty({ description: 'Meditation category' })
  category: string;

  @ApiPropertyOptional({ description: 'Meditation teacher' })
  teacher?: string;

  @ApiProperty({ description: 'Meditation public status' })
  isPublic: boolean;

  @ApiProperty({ description: 'Meditation premium status' })
  isPremium: boolean;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;
}

export class MeditationQueryDto {
  @ApiPropertyOptional({ description: 'Filter by level', enum: Level })
  @IsEnum(Level)
  @IsOptional()
  level?: Level;

  @ApiPropertyOptional({ description: 'Filter by category' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ description: 'Filter by teacher' })
  @IsString()
  @IsOptional()
  teacher?: string;

  @ApiPropertyOptional({ description: 'Filter by duration (min seconds)' })
  @IsNumber()
  @IsOptional()
  minDuration?: number;

  @ApiPropertyOptional({ description: 'Filter by duration (max seconds)' })
  @IsNumber()
  @IsOptional()
  maxDuration?: number;

  @ApiPropertyOptional({ description: 'Filter by premium status' })
  @IsBoolean()
  @IsOptional()
  isPremium?: boolean;

  @ApiPropertyOptional({ description: 'Search term' })
  @IsString()
  @IsOptional()
  search?: string;
}