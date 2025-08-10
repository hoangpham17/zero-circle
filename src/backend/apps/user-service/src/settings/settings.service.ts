import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@app/database';
import { UserSettingsDto } from '@app/common';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserSettings(userId: string) {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Get user settings
    const settings = await this.prisma.userSettings.findUnique({
      where: { userId },
    });

    if (!settings) {
      // Create default settings if not found
      return this.prisma.userSettings.create({
        data: {
          userId,
          theme: 'light',
          notificationsEnabled: true,
          language: 'en',
        },
      });
    }

    return settings;
  }

  async updateUserSettings(userId: string, settingsDto: UserSettingsDto) {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Check if settings exist
    const existingSettings = await this.prisma.userSettings.findUnique({
      where: { userId },
    });

    if (!existingSettings) {
      // Create settings if not found
      return this.prisma.userSettings.create({
        data: {
          userId,
          theme: settingsDto.theme || 'light',
          notificationsEnabled: settingsDto.notificationsEnabled ?? true,
          reminderTime: settingsDto.reminderTime,
          language: settingsDto.language || 'en',
        },
      });
    }

    // Update settings
    return this.prisma.userSettings.update({
      where: { userId },
      data: settingsDto,
    });
  }
}