import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@app/database';
import { UserService } from './user/user.service';
import * as bcrypt from 'bcrypt';
import {
  LoginDto,
  RegisterDto,
  TokenResponseDto,
  ChangePasswordDto,
  ResetPasswordDto,
  UserResponseDto
} from '@app/common';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {}

  async register(registerDto: RegisterDto): Promise<TokenResponseDto> {
    const { email, password } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Create new user
    const user = await this.userService.createUser(registerDto);

    // Generate tokens
    return this.generateTokens(user.id, user.email);
  }

  async login(loginDto: LoginDto): Promise<TokenResponseDto> {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    return this.generateTokens(user.id, user.email);
  }

  async refreshToken(refreshToken: string): Promise<TokenResponseDto> {
    try {
      // Verify refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      // Check if user exists
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Generate new tokens
      return this.generateTokens(user.id, user.email);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<{ message: string }> {
    const { currentPassword, newPassword } = changePasswordDto;

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Password changed successfully' };
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal that the user doesn't exist for security reasons
      return { message: 'If your email is registered, you will receive a password reset link' };
    }

    // Generate reset token
    const resetToken = this.jwtService.sign(
      { sub: user.id, email: user.email },
      {
        secret: this.configService.get<string>('JWT_RESET_SECRET'),
        expiresIn: '15m',
      },
    );

    // In a real application, send an email with the reset token
    // For now, just return a message
    console.log(`Reset token for ${email}: ${resetToken}`);

    return { message: 'If your email is registered, you will receive a password reset link' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    const { token, newPassword } = resetPasswordDto;

    try {
      // Verify reset token
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_RESET_SECRET'),
      });

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      await this.prisma.user.update({
        where: { id: payload.sub },
        data: { password: hashedPassword },
      });

      return { message: 'Password reset successfully' };
    } catch (error) {
      throw new BadRequestException('Invalid or expired token');
    }
  }

  async getProfile(userId: string): Promise<UserResponseDto> {
    return this.userService.findUserById(userId);
  }

  private async generateTokens(userId: string, email: string): Promise<TokenResponseDto> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email },
        {
          secret: this.configService.get<string>('JWT_SECRET'),
          expiresIn: this.configService.get<string>('JWT_EXPIRATION'),
        },
      ),
      this.jwtService.signAsync(
        { sub: userId, email },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION'),
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
      expiresIn: parseInt(this.configService.get<string>('JWT_EXPIRATION')),
    };
  }
}