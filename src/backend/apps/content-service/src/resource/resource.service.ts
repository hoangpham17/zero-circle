import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@app/database';
import {
  CreateSoundResourceDto,
  UpdateSoundResourceDto,
  CreateImageResourceDto,
  UpdateImageResourceDto,
  ResourceQueryDto,
} from '@app/common';

@Injectable()
export class ResourceService {
  constructor(private readonly prisma: PrismaService) {}

  // Sound Resource Methods

  async getAllSounds(queryDto: ResourceQueryDto) {
    const { isSystem, userId, search, page = 1, limit = 10 } = queryDto;
    const skip = (page - 1) * limit;

    // Build filter
    const where: any = {};

    if (isSystem !== undefined) {
      where.isSystem = isSystem;
    }

    if (userId) {
      where.userId = userId;
    }

    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive',
      };
    }

    // Get sounds with pagination
    const [sounds, total] = await Promise.all([
      this.prisma.soundResource.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.soundResource.count({ where }),
    ]);

    return {
      data: sounds,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getSoundById(id: string) {
    const sound = await this.prisma.soundResource.findUnique({
      where: { id },
    });

    if (!sound) {
      throw new NotFoundException(`Sound resource with ID ${id} not found`);
    }

    return sound;
  }

  async createSound(userId: string, createDto: CreateSoundResourceDto) {
    return this.prisma.soundResource.create({
      data: {
        ...createDto,
        userId,
      },
    });
  }

  async updateSound(id: string, updateDto: UpdateSoundResourceDto) {
    try {
      return await this.prisma.soundResource.update({
        where: { id },
        data: updateDto,
      });
    } catch (error) {
      throw new NotFoundException(`Sound resource with ID ${id} not found`);
    }
  }

  async deleteSound(id: string) {
    try {
      await this.prisma.soundResource.delete({
        where: { id },
      });
      return { message: 'Sound resource deleted successfully' };
    } catch (error) {
      throw new NotFoundException(`Sound resource with ID ${id} not found`);
    }
  }

  // Image Resource Methods

  async getAllImages(queryDto: ResourceQueryDto) {
    const { isSystem, userId, search, page = 1, limit = 10 } = queryDto;
    const skip = (page - 1) * limit;

    // Build filter
    const where: any = {};

    if (isSystem !== undefined) {
      where.isSystem = isSystem;
    }

    if (userId) {
      where.userId = userId;
    }

    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive',
      };
    }

    // Get images with pagination
    const [images, total] = await Promise.all([
      this.prisma.imageResource.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.imageResource.count({ where }),
    ]);

    return {
      data: images,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getImageById(id: string) {
    const image = await this.prisma.imageResource.findUnique({
      where: { id },
    });

    if (!image) {
      throw new NotFoundException(`Image resource with ID ${id} not found`);
    }

    return image;
  }

  async createImage(userId: string, createDto: CreateImageResourceDto) {
    return this.prisma.imageResource.create({
      data: {
        ...createDto,
        userId,
      },
    });
  }

  async updateImage(id: string, updateDto: UpdateImageResourceDto) {
    try {
      return await this.prisma.imageResource.update({
        where: { id },
        data: updateDto,
      });
    } catch (error) {
      throw new NotFoundException(`Image resource with ID ${id} not found`);
    }
  }

  async deleteImage(id: string) {
    try {
      await this.prisma.imageResource.delete({
        where: { id },
      });
      return { message: 'Image resource deleted successfully' };
    } catch (error) {
      throw new NotFoundException(`Image resource with ID ${id} not found`);
    }
  }
}