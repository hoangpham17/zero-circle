import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@app/database';
import {
  CreateMeditationConfigDto,
  UpdateMeditationConfigDto,
  MeditationConfigQueryDto,
} from '@app/common';

@Injectable()
export class MeditationConfigService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserConfigs(userId: string, queryDto: MeditationConfigQueryDto) {
    const { isDefault, search, page = 1, limit = 10 } = queryDto;
    const skip = (page - 1) * limit;

    // Build filter
    const where: any = { userId };

    if (isDefault !== undefined) {
      where.isDefault = isDefault;
    }

    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive',
      };
    }

    // Get configs with pagination
    const [configs, total] = await Promise.all([
      this.prisma.meditationConfig.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          backgroundImage: true,
          startSound: true,
          endSound: true,
          periodicChimeSound: true,
        },
      }),
      this.prisma.meditationConfig.count({ where }),
    ]);

    return {
      data: configs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getConfigById(id: string) {
    const config = await this.prisma.meditationConfig.findUnique({
      where: { id },
      include: {
        backgroundImage: true,
        startSound: true,
        endSound: true,
        periodicChimeSound: true,
      },
    });

    if (!config) {
      throw new NotFoundException(`Meditation config with ID ${id} not found`);
    }

    return config;
  }

  async createConfig(userId: string, createDto: CreateMeditationConfigDto) {
    // If this is set as default, unset any existing default configs for this user
    if (createDto.isDefault) {
      await this.prisma.meditationConfig.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.meditationConfig.create({
      data: {
        ...createDto,
        userId,
      },
      include: {
        backgroundImage: true,
        startSound: true,
        endSound: true,
        periodicChimeSound: true,
      },
    });
  }

  async updateConfig(id: string, userId: string, updateDto: UpdateMeditationConfigDto) {
    // If this is set as default, unset any existing default configs for this user
    if (updateDto.isDefault) {
      await this.prisma.meditationConfig.updateMany({
        where: { userId, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    try {
      return await this.prisma.meditationConfig.update({
        where: { id },
        data: updateDto,
        include: {
          backgroundImage: true,
          startSound: true,
          endSound: true,
          periodicChimeSound: true,
        },
      });
    } catch (error) {
      throw new NotFoundException(`Meditation config with ID ${id} not found`);
    }
  }

  async deleteConfig(id: string) {
    try {
      await this.prisma.meditationConfig.delete({
        where: { id },
      });
      return { message: 'Meditation config deleted successfully' };
    } catch (error) {
      throw new NotFoundException(`Meditation config with ID ${id} not found`);
    }
  }

  async getDefaultConfig(userId: string) {
    const defaultConfig = await this.prisma.meditationConfig.findFirst({
      where: { userId, isDefault: true },
      include: {
        backgroundImage: true,
        startSound: true,
        endSound: true,
        periodicChimeSound: true,
      },
    });

    if (!defaultConfig) {
      // If no default config exists, get the most recently created one
      const latestConfig = await this.prisma.meditationConfig.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
          backgroundImage: true,
          startSound: true,
          endSound: true,
          periodicChimeSound: true,
        },
      });

      return latestConfig;
    }

    return defaultConfig;
  }
}