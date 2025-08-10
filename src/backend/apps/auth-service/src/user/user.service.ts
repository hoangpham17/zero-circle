import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@app/database';
import { RegisterDto, UserResponseDto, UpdateUserDto } from '@app/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(registerDto: RegisterDto): Promise<UserResponseDto> {
    const { email, password, name, avatar, bio } = registerDto;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || email.split('@')[0], // Use part of email as name if not provided
        avatar,
        bio,
        settings: {
          create: {
            theme: 'light',
            notificationsEnabled: true,
            language: 'en',
          },
        },
      },
      include: {
        settings: true,
      },
    });

    return this.mapToUserResponse(user);
  }

  async findUserById(id: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        settings: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.mapToUserResponse(user);
  }

  async findUserByEmail(email: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        settings: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    return this.mapToUserResponse(user);
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      include: {
        settings: true,
      },
    });

    return this.mapToUserResponse(user);
  }

  private mapToUserResponse(user: any): UserResponseDto {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}