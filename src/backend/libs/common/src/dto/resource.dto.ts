import { IsString, IsNumber, IsOptional, IsBoolean, IsUrl, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Sound Resource DTOs
export class CreateSoundResourceDto {
  @ApiProperty({ description: 'Sound name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Sound file URL' })
  @IsUrl()
  url: string;

  @ApiPropertyOptional({ description: 'Sound duration in seconds' })
  @IsNumber()
  @IsOptional()
  duration?: number;

  @ApiPropertyOptional({ description: 'Is this a system sound', default: false })
  @IsBoolean()
  @IsOptional()
  isSystem?: boolean;
}

export class UpdateSoundResourceDto {
  @ApiPropertyOptional({ description: 'Sound name' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Sound file URL' })
  @IsUrl()
  @IsOptional()
  url?: string;

  @ApiPropertyOptional({ description: 'Sound duration in seconds' })
  @IsNumber()
  @IsOptional()
  duration?: number;
}

export class SoundResourceResponseDto {
  @ApiProperty({ description: 'Sound resource ID' })
  id: string;

  @ApiProperty({ description: 'Sound name' })
  name: string;

  @ApiProperty({ description: 'Sound file URL' })
  url: string;

  @ApiPropertyOptional({ description: 'Sound duration in seconds' })
  duration?: number;

  @ApiProperty({ description: 'Is this a system sound' })
  isSystem: boolean;

  @ApiPropertyOptional({ description: 'User ID who created this sound' })
  userId?: string;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;
}

// Image Resource DTOs
export class CreateImageResourceDto {
  @ApiProperty({ description: 'Image name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Image file URL' })
  @IsUrl()
  url: string;

  @ApiPropertyOptional({ description: 'Is this a system image', default: false })
  @IsBoolean()
  @IsOptional()
  isSystem?: boolean;
}

export class UpdateImageResourceDto {
  @ApiPropertyOptional({ description: 'Image name' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Image file URL' })
  @IsUrl()
  @IsOptional()
  url?: string;
}

export class ImageResourceResponseDto {
  @ApiProperty({ description: 'Image resource ID' })
  id: string;

  @ApiProperty({ description: 'Image name' })
  name: string;

  @ApiProperty({ description: 'Image file URL' })
  url: string;

  @ApiProperty({ description: 'Is this a system image' })
  isSystem: boolean;

  @ApiPropertyOptional({ description: 'User ID who created this image' })
  userId?: string;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;
}

// Resource Query DTO
export class ResourceQueryDto {
  @ApiPropertyOptional({ description: 'Filter by system resources' })
  @IsBoolean()
  @IsOptional()
  isSystem?: boolean;

  @ApiPropertyOptional({ description: 'Filter by user ID' })
  @IsUUID()
  @IsOptional()
  userId?: string;

  @ApiPropertyOptional({ description: 'Search term' })
  @IsString()
  @IsOptional()
  search?: string;
}