import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@app/database';
import { UpdateUserDto } from '@app/common';
import { Role } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllUsers(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          bio: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          settings: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.user.count(),
    ]);

    return {
      data: users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        bio: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        settings: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Only allow role updates for admin users
    if (updateUserDto.role && existingUser.role !== Role.ADMIN) {
      throw new ForbiddenException('Only admin users can update roles');
    }

    // Update user
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        bio: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        settings: true,
      },
    });

    return updatedUser;
  }

  async deleteUser(id: string) {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Delete user
    await this.prisma.user.delete({
      where: { id },
    });

    return { message: 'User deleted successfully' };
  }

  async findUserByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        bio: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        settings: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    return user;
  }

  async getUserStats(id: string) {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Get meditation sessions
    const meditationSessions = await this.prisma.meditationSession.findMany({
      where: {
        userId: id,
        completed: true,
      },
    });

    // Get favorites
    const favorites = await this.prisma.favorite.count({
      where: {
        userId: id,
      },
    });

    // Get progress
    const progress = await this.prisma.progress.count({
      where: {
        userId: id,
        completed: true,
      },
    });

    // Calculate total meditation time
    const totalMeditationMinutes = meditationSessions.reduce(
      (total, session) => total + session.duration,
      0,
    );

    // Calculate streak (consecutive days)
    const sessionDates = meditationSessions.map(session => {
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
      totalSessions: meditationSessions.length,
      totalMeditationMinutes,
      currentStreak,
      maxStreak,
      favorites,
      completedContent: progress,
      lastActive: meditationSessions.length > 0 ? meditationSessions[0].startTime : user.createdAt,
    };
  }
}