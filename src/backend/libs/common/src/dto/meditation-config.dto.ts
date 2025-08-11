import { IsString, IsNumber, IsOptional, IsBoolean, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMeditationConfigDto {
  @ApiProperty({ description: 'Configuration name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Is this the default configuration', default: false })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

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
}

export class UpdateMeditationConfigDto {
  @ApiPropertyOptional({ description: 'Configuration name' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Is this the default configuration' })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

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
}

export class MeditationConfigResponseDto {
  @ApiProperty({ description: 'Configuration ID' })
  id: string;

  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ description: 'Configuration name' })
  name: string;

  @ApiProperty({ description: 'Is this the default configuration' })
  isDefault: boolean;

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

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;
}

export class MeditationConfigQueryDto {
  @ApiPropertyOptional({ description: 'Filter by default status' })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @ApiPropertyOptional({ description: 'Search term' })
  @IsString()
  @IsOptional()
  search?: string;
}