import { IsString, IsOptional, IsBoolean, IsEnum, IsUrl, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ContentType } from '@prisma/client';

export class CreateBuddhistContentDto {
  @ApiProperty({ description: 'Content title' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Content description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Content type', enum: ContentType })
  @IsEnum(ContentType)
  contentType: ContentType;

  @ApiPropertyOptional({ description: 'Text content (for TEXT type)' })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({ description: 'Audio URL (for AUDIO type)' })
  @IsUrl()
  @IsOptional()
  audioUrl?: string;

  @ApiPropertyOptional({ description: 'Video URL (for VIDEO type)' })
  @IsUrl()
  @IsOptional()
  videoUrl?: string;

  @ApiPropertyOptional({ description: 'Content author' })
  @IsString()
  @IsOptional()
  author?: string;

  @ApiPropertyOptional({ description: 'Content source' })
  @IsString()
  @IsOptional()
  source?: string;

  @ApiPropertyOptional({ description: 'Content public status', default: true })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @ApiPropertyOptional({ description: 'Content premium status', default: false })
  @IsBoolean()
  @IsOptional()
  isPremium?: boolean;
}

export class UpdateBuddhistContentDto {
  @ApiPropertyOptional({ description: 'Content title' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'Content description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Content type', enum: ContentType })
  @IsEnum(ContentType)
  @IsOptional()
  contentType?: ContentType;

  @ApiPropertyOptional({ description: 'Text content (for TEXT type)' })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({ description: 'Audio URL (for AUDIO type)' })
  @IsUrl()
  @IsOptional()
  audioUrl?: string;

  @ApiPropertyOptional({ description: 'Video URL (for VIDEO type)' })
  @IsUrl()
  @IsOptional()
  videoUrl?: string;

  @ApiPropertyOptional({ description: 'Content author' })
  @IsString()
  @IsOptional()
  author?: string;

  @ApiPropertyOptional({ description: 'Content source' })
  @IsString()
  @IsOptional()
  source?: string;

  @ApiPropertyOptional({ description: 'Content public status' })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @ApiPropertyOptional({ description: 'Content premium status' })
  @IsBoolean()
  @IsOptional()
  isPremium?: boolean;
}

export class BuddhistContentResponseDto {
  @ApiProperty({ description: 'Content ID' })
  id: string;

  @ApiProperty({ description: 'Content title' })
  title: string;

  @ApiPropertyOptional({ description: 'Content description' })
  description?: string;

  @ApiProperty({ description: 'Content type', enum: ContentType })
  contentType: ContentType;

  @ApiPropertyOptional({ description: 'Text content (for TEXT type)' })
  content?: string;

  @ApiPropertyOptional({ description: 'Audio URL (for AUDIO type)' })
  audioUrl?: string;

  @ApiPropertyOptional({ description: 'Video URL (for VIDEO type)' })
  videoUrl?: string;

  @ApiPropertyOptional({ description: 'Content author' })
  author?: string;

  @ApiPropertyOptional({ description: 'Content source' })
  source?: string;

  @ApiProperty({ description: 'Content public status' })
  isPublic: boolean;

  @ApiProperty({ description: 'Content premium status' })
  isPremium: boolean;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;
}

export class ContentQueryDto {
  @ApiPropertyOptional({ description: 'Filter by content type', enum: ContentType })
  @IsEnum(ContentType)
  @IsOptional()
  contentType?: ContentType;

  @ApiPropertyOptional({ description: 'Filter by author' })
  @IsString()
  @IsOptional()
  author?: string;

  @ApiPropertyOptional({ description: 'Filter by source' })
  @IsString()
  @IsOptional()
  source?: string;

  @ApiPropertyOptional({ description: 'Filter by premium status' })
  @IsBoolean()
  @IsOptional()
  isPremium?: boolean;

  @ApiPropertyOptional({ description: 'Search term' })
  @IsString()
  @IsOptional()
  search?: string;
}

export class CreateFavoriteDto {
  @ApiPropertyOptional({ description: 'Meditation content ID' })
  @IsString()
  @IsOptional()
  meditationContentId?: string;

  @ApiPropertyOptional({ description: 'Buddhist content ID' })
  @IsString()
  @IsOptional()
  buddhistContentId?: string;
}

export class CreateProgressDto {
  @ApiPropertyOptional({ description: 'Meditation content ID' })
  @IsString()
  @IsOptional()
  meditationContentId?: string;

  @ApiPropertyOptional({ description: 'Buddhist content ID' })
  @IsString()
  @IsOptional()
  buddhistContentId?: string;

  @ApiProperty({ description: 'Progress percentage (0-100)' })
  @IsNumber()
  @Min(0)
  @Max(100)
  progress: number;

  @ApiProperty({ description: 'Last position in seconds' })
  @IsNumber()
  @Min(0)
  lastPosition: number;

  @ApiPropertyOptional({ description: 'Completion status', default: false })
  @IsBoolean()
  @IsOptional()
  completed?: boolean;
}

export class UpdateProgressDto {
  @ApiPropertyOptional({ description: 'Progress percentage (0-100)' })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  progress?: number;

  @ApiPropertyOptional({ description: 'Last position in seconds' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  lastPosition?: number;

  @ApiPropertyOptional({ description: 'Completion status' })
  @IsBoolean()
  @IsOptional()
  completed?: boolean;
}