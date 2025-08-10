import { IsEmail, IsString, IsOptional, IsBoolean, IsEnum, IsUUID, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({ description: 'User email address' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({ description: 'User password' })
  @IsString()
  password: string;

  @ApiPropertyOptional({ description: 'User name' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'User avatar URL' })
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiPropertyOptional({ description: 'User bio' })
  @IsString()
  @IsOptional()
  bio?: string;
}

export class UpdateUserDto {
  @ApiPropertyOptional({ description: 'User name' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'User avatar URL' })
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiPropertyOptional({ description: 'User bio' })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiPropertyOptional({ description: 'User active status' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'User role', enum: Role })
  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}

export class UserSettingsDto {
  @ApiProperty({ description: 'User ID' })
  @IsUUID()
  userId: string;

  @ApiPropertyOptional({ description: 'Theme preference', default: 'light' })
  @IsString()
  @IsOptional()
  theme?: string;

  @ApiPropertyOptional({ description: 'Notifications enabled', default: true })
  @IsBoolean()
  @IsOptional()
  notificationsEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Reminder time' })
  @IsDateString()
  @IsOptional()
  reminderTime?: Date;

  @ApiPropertyOptional({ description: 'Language preference', default: 'en' })
  @IsString()
  @IsOptional()
  language?: string;
}

export class UserResponseDto {
  @ApiProperty({ description: 'User ID' })
  id: string;

  @ApiProperty({ description: 'User email address' })
  email: string;

  @ApiPropertyOptional({ description: 'User name' })
  name?: string;

  @ApiPropertyOptional({ description: 'User avatar URL' })
  avatar?: string;

  @ApiPropertyOptional({ description: 'User bio' })
  bio?: string;

  @ApiProperty({ description: 'User role', enum: Role })
  role: Role;

  @ApiProperty({ description: 'User active status' })
  isActive: boolean;

  @ApiProperty({ description: 'User creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'User last update date' })
  updatedAt: Date;
}