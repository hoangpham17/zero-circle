import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@app/database';
import {
  CreateBuddhistContentDto,
  UpdateBuddhistContentDto,
  CreateFavoriteDto,
  CreateProgressDto,
  UpdateProgressDto,
  ContentQueryDto,
} from '@app/common';
import { ContentType } from '@prisma/client';

@Injectable()
export class BuddhistContentService {
  constructor(private readonly prisma: PrismaService) {}

  // Buddhist Content Methods

  async getAllContent(queryDto: ContentQueryDto) {
    const { query, category, page = 1, limit = 10 } = queryDto;
    const skip = (page - 1) * limit;

    // Build filter
    const where: any = {};

    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = category;
    }

    // Get content with pagination
    const [content, total] = await Promise.all([
      this.prisma.buddhistContent.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.buddhistContent.count({ where }),
    ]);

    return {
      data: content,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getContentById(id: string) {
    const content = await this.prisma.buddhistContent.findUnique({
      where: { id },
    });

    if (!content) {
      throw new NotFoundException(`Buddhist content with ID ${id} not found`);
    }

    return content;
  }

  async createContent(createDto: CreateBuddhistContentDto) {
    return this.prisma.buddhistContent.create({
      data: createDto,
    });
  }

  async updateContent(id: string, updateDto: UpdateBuddhistContentDto) {
    try {
      return await this.prisma.buddhistContent.update({
        where: { id },
        data: updateDto,
      });
    } catch (error) {
      throw new NotFoundException(`Buddhist content with ID ${id} not found`);
    }
  }

  async deleteContent(id: string) {
    try {
      await this.prisma.buddhistContent.delete({
        where: { id },
      });
      return { message: 'Buddhist content deleted successfully' };
    } catch (error) {
      throw new NotFoundException(`Buddhist content with ID ${id} not found`);
    }
  }

  // Favorites Methods

  async getUserFavorites(userId: string) {
    const favorites = await this.prisma.favorite.findMany({
      where: {
        userId,
        contentType: ContentType.BUDDHIST_TEACHING,
      },
      include: {
        buddhistContent: true,
      },
    });

    return favorites.map(favorite => ({
      id: favorite.id,
      contentId: favorite.contentId,
      userId: favorite.userId,
      createdAt: favorite.createdAt,
      content: favorite.buddhistContent,
    }));
  }

  async addToFavorites(createDto: CreateFavoriteDto) {
    const { userId, contentId, contentType } = createDto;

    // Check if content exists
    const content = await this.prisma.buddhistContent.findUnique({
      where: { id: contentId },
    });

    if (!content) {
      throw new NotFoundException(`Buddhist content with ID ${contentId} not found`);
    }

    // Check if already favorited
    const existingFavorite = await this.prisma.favorite.findFirst({
      where: {
        userId,
        contentId,
        contentType,
      },
    });

    if (existingFavorite) {
      throw new ConflictException('Content is already in favorites');
    }

    // Add to favorites
    return this.prisma.favorite.create({
      data: createDto,
      include: {
        buddhistContent: true,
      },
    });
  }

  async removeFromFavorites(id: string) {
    try {
      await this.prisma.favorite.delete({
        where: { id },
      });
      return { message: 'Content removed from favorites' };
    } catch (error) {
      throw new NotFoundException(`Favorite with ID ${id} not found`);
    }
  }

  // Progress Methods

  async getUserProgress(userId: string) {
    return this.prisma.progress.findMany({
      where: {
        userId,
        contentType: ContentType.BUDDHIST_TEACHING,
      },
      include: {
        buddhistContent: true,
      },
    });
  }

  async createProgress(createDto: CreateProgressDto) {
    const { userId, contentId, contentType, position } = createDto;

    // Check if content exists
    const content = await this.prisma.buddhistContent.findUnique({
      where: { id: contentId },
    });

    if (!content) {
      throw new NotFoundException(`Buddhist content with ID ${contentId} not found`);
    }

    // Check if progress already exists
    const existingProgress = await this.prisma.progress.findFirst({
      where: {
        userId,
        contentId,
        contentType,
      },
    });

    // If progress exists, update it
    if (existingProgress) {
      return this.prisma.progress.update({
        where: { id: existingProgress.id },
        data: { position, completed: createDto.completed },
        include: {
          buddhistContent: true,
        },
      });
    }

    // Create new progress
    return this.prisma.progress.create({
      data: createDto,
      include: {
        buddhistContent: true,
      },
    });
  }

  async updateProgress(id: string, updateDto: UpdateProgressDto) {
    try {
      return await this.prisma.progress.update({
        where: { id },
        data: updateDto,
        include: {
          buddhistContent: true,
        },
      });
    } catch (error) {
      throw new NotFoundException(`Progress with ID ${id} not found`);
    }
  }

  // Additional Methods

  async getCategories() {
    const contents = await this.prisma.buddhistContent.findMany({
      select: {
        category: true,
      },
      distinct: ['category'],
    });

    return contents.map(content => content.category).filter(Boolean);
  }

  async getRelatedContent(id: string) {
    // Get the content to find related items
    const content = await this.prisma.buddhistContent.findUnique({
      where: { id },
    });

    if (!content) {
      throw new NotFoundException(`Buddhist content with ID ${id} not found`);
    }

    // Find related content based on category
    return this.prisma.buddhistContent.findMany({
      where: {
        category: content.category,
        id: { not: id }, // Exclude the current content
      },
      take: 5,
    });
  }
}