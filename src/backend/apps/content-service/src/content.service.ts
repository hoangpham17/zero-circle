import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/database';
import { ContentQueryDto } from '@app/common';
import { ContentType } from '@prisma/client';

@Injectable()
export class ContentService {
  constructor(private readonly prisma: PrismaService) {}

  async searchContent(queryDto: ContentQueryDto) {
    const { query, type, category, level, page = 1, limit = 10 } = queryDto;
    const skip = (page - 1) * limit;

    // Base filter
    const filter: any = {};
    
    // Add type filter if provided
    if (type) {
      filter.type = type;
    }
    
    // Add category filter if provided
    if (category) {
      filter.category = category;
    }
    
    // Add level filter if provided
    if (level) {
      filter.level = level;
    }

    // Search in both meditation content and buddhist content
    const [meditationContent, buddhistContent, totalMeditation, totalBuddhist] = await Promise.all([
      // Search meditation content
      this.prisma.meditationContent.findMany({
        where: {
          ...filter,
          OR: query
            ? [
                { title: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
              ]
            : undefined,
        },
        skip,
        take: limit,
      }),
      
      // Search buddhist content
      this.prisma.buddhistContent.findMany({
        where: {
          ...filter,
          OR: query
            ? [
                { title: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
              ]
            : undefined,
        },
        skip,
        take: limit,
      }),
      
      // Count total meditation content
      this.prisma.meditationContent.count({
        where: {
          ...filter,
          OR: query
            ? [
                { title: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
              ]
            : undefined,
        },
      }),
      
      // Count total buddhist content
      this.prisma.buddhistContent.count({
        where: {
          ...filter,
          OR: query
            ? [
                { title: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
              ]
            : undefined,
        },
      }),
    ]);

    // Format meditation content
    const formattedMeditationContent = meditationContent.map(content => ({
      ...content,
      type: ContentType.MEDITATION,
    }));

    // Format buddhist content
    const formattedBuddhistContent = buddhistContent.map(content => ({
      ...content,
      type: ContentType.BUDDHIST_TEACHING,
    }));

    // Combine results
    const results = [...formattedMeditationContent, ...formattedBuddhistContent];

    return {
      data: results,
      pagination: {
        total: totalMeditation + totalBuddhist,
        page,
        limit,
        totalPages: Math.ceil((totalMeditation + totalBuddhist) / limit),
      },
    };
  }

  async getFeaturedContent() {
    // Get featured meditation content
    const featuredMeditation = await this.prisma.meditationContent.findMany({
      where: {
        featured: true,
      },
      take: 5,
    });

    // Get featured buddhist content
    const featuredBuddhist = await this.prisma.buddhistContent.findMany({
      where: {
        featured: true,
      },
      take: 5,
    });

    // Format meditation content
    const formattedMeditationContent = featuredMeditation.map(content => ({
      ...content,
      type: ContentType.MEDITATION,
    }));

    // Format buddhist content
    const formattedBuddhistContent = featuredBuddhist.map(content => ({
      ...content,
      type: ContentType.BUDDHIST_TEACHING,
    }));

    // Combine results
    return [...formattedMeditationContent, ...formattedBuddhistContent];
  }

  async getRecommendedContent(userId: string) {
    if (!userId) {
      // If no user ID provided, return popular content
      return this.getPopularContent();
    }

    // Get user's completed meditation sessions
    const userSessions = await this.prisma.meditationSession.findMany({
      where: {
        userId,
        completed: true,
      },
      include: {
        content: true,
      },
    });

    // Get user's favorites
    const userFavorites = await this.prisma.favorite.findMany({
      where: {
        userId,
      },
    });

    // Extract categories and levels from user's history
    const categories = new Set<string>();
    const levels = new Set<string>();

    userSessions.forEach(session => {
      if (session.content?.category) {
        categories.add(session.content.category);
      }
      if (session.content?.level) {
        levels.add(session.content.level);
      }
    });

    // If user has no history, return popular content
    if (categories.size === 0 && levels.size === 0) {
      return this.getPopularContent();
    }

    // Get recommended meditation content based on user's preferences
    const recommendedMeditation = await this.prisma.meditationContent.findMany({
      where: {
        OR: [
          { category: { in: Array.from(categories) } },
          { level: { in: Array.from(levels) } },
        ],
        // Exclude content the user has already completed
        id: {
          notIn: userSessions.map(session => session.contentId).filter(Boolean),
        },
      },
      take: 5,
    });

    // Get recommended buddhist content based on user's preferences
    const recommendedBuddhist = await this.prisma.buddhistContent.findMany({
      where: {
        OR: [
          { category: { in: Array.from(categories) } },
        ],
        // Exclude content the user has already favorited
        id: {
          notIn: userFavorites
            .filter(fav => fav.contentType === ContentType.BUDDHIST_TEACHING)
            .map(fav => fav.contentId),
        },
      },
      take: 5,
    });

    // Format meditation content
    const formattedMeditationContent = recommendedMeditation.map(content => ({
      ...content,
      type: ContentType.MEDITATION,
    }));

    // Format buddhist content
    const formattedBuddhistContent = recommendedBuddhist.map(content => ({
      ...content,
      type: ContentType.BUDDHIST_TEACHING,
    }));

    // Combine results
    return [...formattedMeditationContent, ...formattedBuddhistContent];
  }

  private async getPopularContent() {
    // Get popular meditation content (based on session count)
    const popularMeditation = await this.prisma.meditationContent.findMany({
      orderBy: {
        sessions: {
          _count: 'desc',
        },
      },
      take: 5,
    });

    // Get popular buddhist content (based on favorites count)
    const popularBuddhist = await this.prisma.buddhistContent.findMany({
      orderBy: {
        favorites: {
          _count: 'desc',
        },
      },
      take: 5,
    });

    // Format meditation content
    const formattedMeditationContent = popularMeditation.map(content => ({
      ...content,
      type: ContentType.MEDITATION,
    }));

    // Format buddhist content
    const formattedBuddhistContent = popularBuddhist.map(content => ({
      ...content,
      type: ContentType.BUDDHIST_TEACHING,
    }));

    // Combine results
    return [...formattedMeditationContent, ...formattedBuddhistContent];
  }
}