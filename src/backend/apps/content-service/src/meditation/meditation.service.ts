import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@app/database';
import {
  CreateMeditationContentDto,
  UpdateMeditationContentDto,
  CreateMeditationSessionDto,
  UpdateMeditationSessionDto,
  MeditationQueryDto,
} from '@app/common';

@Injectable()
export class MeditationService {
  constructor(private readonly prisma: PrismaService) {}

  // Meditation Content Methods

  async getAllContent(queryDto: MeditationQueryDto) {
    const { category, level, duration, page = 1, limit = 10 } = queryDto;
    const skip = (page - 1) * limit;

    // Build filter
    const where: any = {};

    if (category) {
      where.category = category;
    }

    if (level) {
      where.level = level;
    }

    if (duration) {
      // Convert duration to minutes for comparison
      const durationMinutes = parseInt(duration);
      
      if (!isNaN(durationMinutes)) {
        // Find content with duration less than or equal to the specified duration
        where.duration = {
          lte: durationMinutes,
        };
      }
    }

    // Get content with pagination
    const [content, total] = await Promise.all([
      this.prisma.meditationContent.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.meditationContent.count({ where }),
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
    const content = await this.prisma.meditationContent.findUnique({
      where: { id },
    });

    if (!content) {
      throw new NotFoundException(`Meditation content with ID ${id} not found`);
    }

    return content;
  }

  async createContent(createDto: CreateMeditationContentDto) {
    return this.prisma.meditationContent.create({
      data: createDto,
    });
  }

  async updateContent(id: string, updateDto: UpdateMeditationContentDto) {
    try {
      return await this.prisma.meditationContent.update({
        where: { id },
        data: updateDto,
      });
    } catch (error) {
      throw new NotFoundException(`Meditation content with ID ${id} not found`);
    }
  }

  async deleteContent(id: string) {
    try {
      await this.prisma.meditationContent.delete({
        where: { id },
      });
      return { message: 'Meditation content deleted successfully' };
    } catch (error) {
      throw new NotFoundException(`Meditation content with ID ${id} not found`);
    }
  }

  // Meditation Session Methods

  async getUserSessions(userId: string) {
    return this.prisma.meditationSession.findMany({
      where: { userId },
      orderBy: {
        startTime: 'desc',
      },
      include: {
        backgroundImage: true,
        startSound: true,
        endSound: true,
        periodicChimeSound: true,
        config: {
          include: {
            backgroundImage: true,
            startSound: true,
            endSound: true,
            periodicChimeSound: true,
          },
        },
      },
    });
  }

  async getSessionById(id: string) {
    const session = await this.prisma.meditationSession.findUnique({
      where: { id },
      include: {
        backgroundImage: true,
        startSound: true,
        endSound: true,
        periodicChimeSound: true,
        config: {
          include: {
            backgroundImage: true,
            startSound: true,
            endSound: true,
            periodicChimeSound: true,
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException(`Meditation session with ID ${id} not found`);
    }

    return session;
  }

  async createSession(createDto: CreateMeditationSessionDto) {
    // If configId is provided, apply the config settings
    if (createDto.configId) {
      const config = await this.prisma.meditationConfig.findUnique({
        where: { id: createDto.configId },
      });
      
      if (config) {
        // Apply config settings if not explicitly provided in the DTO
        if (!createDto.backgroundImageId) {
          createDto.backgroundImageId = config.backgroundImageId;
        }
        if (!createDto.startSoundId) {
          createDto.startSoundId = config.startSoundId;
        }
        if (!createDto.endSoundId) {
          createDto.endSoundId = config.endSoundId;
        }
        if (createDto.periodicChimeEnabled === undefined) {
          createDto.periodicChimeEnabled = config.periodicChimeEnabled;
        }
        if (!createDto.periodicChimeInterval && config.periodicChimeEnabled) {
          createDto.periodicChimeInterval = config.periodicChimeInterval;
        }
        if (!createDto.periodicChimeSoundId && config.periodicChimeEnabled) {
          createDto.periodicChimeSoundId = config.periodicChimeSoundId;
        }
      }
    }
    
    return this.prisma.meditationSession.create({
      data: createDto,
      include: {
        backgroundImage: true,
        startSound: true,
        endSound: true,
        periodicChimeSound: true,
        config: {
          include: {
            backgroundImage: true,
            startSound: true,
            endSound: true,
            periodicChimeSound: true,
          },
        },
      },
    });
  }

  async updateSession(id: string, updateDto: UpdateMeditationSessionDto) {
    try {
      return await this.prisma.meditationSession.update({
        where: { id },
        data: updateDto,
        include: {
          backgroundImage: true,
          startSound: true,
          endSound: true,
          periodicChimeSound: true,
          config: {
            include: {
              backgroundImage: true,
              startSound: true,
              endSound: true,
              periodicChimeSound: true,
            },
          },
        },
      });
    } catch (error) {
      throw new NotFoundException(`Meditation session with ID ${id} not found`);
    }
  }

  async deleteSession(id: string) {
    try {
      await this.prisma.meditationSession.delete({
        where: { id },
      });
      return { message: 'Meditation session deleted successfully' };
    } catch (error) {
      throw new NotFoundException(`Meditation session with ID ${id} not found`);
    }
  }

  // Additional Methods

  async getCategories() {
    const contents = await this.prisma.meditationContent.findMany({
      select: {
        category: true,
      },
      distinct: ['category'],
    });

    return contents.map(content => content.category).filter(Boolean);
  }

  async getUserStats(userId: string) {
    // Get total meditation time
    const sessions = await this.prisma.meditationSession.findMany({
      where: {
        userId,
        completed: true,
      },
      select: {
        duration: true,
        startTime: true,
      },
    });

    const totalMinutes = sessions.reduce((total, session) => total + session.duration, 0);

    // Get streak (consecutive days)
    const sessionDates = sessions.map(session => {
      const date = new Date(session.startTime);
      return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    });

    // Remove duplicates (multiple sessions in one day count as one day)
    const uniqueDates = [...new Set(sessionDates)].sort();

    // Calculate streak
    let currentStreak = 0;
    let maxStreak = 0;

    // Check if there's a session today
    const today = new Date();
    const todayString = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    const hasSessionToday = uniqueDates.includes(todayString);

    if (uniqueDates.length > 0) {
      // Start with 1 if there's a session today, otherwise 0
      currentStreak = hasSessionToday ? 1 : 0;

      // If there's a session today, check for consecutive previous days
      if (hasSessionToday) {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        for (let i = 1; i < 1000; i++) { // Limit to 1000 days to prevent infinite loop
          const checkDate = new Date(today);
          checkDate.setDate(checkDate.getDate() - i);
          const checkDateString = `${checkDate.getFullYear()}-${checkDate.getMonth() + 1}-${checkDate.getDate()}`;

          if (uniqueDates.includes(checkDateString)) {
            currentStreak++;
          } else {
            break;
          }
        }
      }

      // Calculate max streak
      maxStreak = currentStreak;

      // Check for longer streaks in the past
      for (let i = 0; i < uniqueDates.length; i++) {
        let tempStreak = 1;
        const currentDate = new Date(uniqueDates[i].split('-'));

        for (let j = i + 1; j < uniqueDates.length; j++) {
          const nextDate = new Date(uniqueDates[j].split('-'));
          const diffTime = Math.abs(nextDate.getTime() - currentDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays === 1) {
            tempStreak++;
            currentDate.setDate(currentDate.getDate() + 1);
          } else {
            break;
          }
        }

        maxStreak = Math.max(maxStreak, tempStreak);
      }
    }

    return {
      totalSessions: sessions.length,
      totalMinutes,
      currentStreak,
      maxStreak,
      lastSession: sessions.length > 0 ? sessions[0].startTime : null,
    };
  }
}