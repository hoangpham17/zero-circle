import { Controller, Post, Body, UseGuards, Get, Req, Patch, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard, Public, Roles, RolesGuard } from '@app/auth';
import { LoginDto, RegisterDto, TokenResponseDto, RefreshTokenDto, ChangePasswordDto, ForgotPasswordDto, ResetPasswordDto } from '@app/common';
import { Role } from '@prisma/client';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully', type: TokenResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  async register(@Body() registerDto: RegisterDto): Promise<TokenResponseDto> {
    return firstValueFrom(this.authClient.send('auth.register', registerDto));
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'User logged in successfully', type: TokenResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async login(@Body() loginDto: LoginDto): Promise<TokenResponseDto> {
    return firstValueFrom(this.authClient.send('auth.login', loginDto));
  }

  @Public()
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully', type: TokenResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto): Promise<TokenResponseDto> {
    return firstValueFrom(this.authClient.send('auth.refresh-token', refreshTokenDto));
  }

  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async changePassword(@Req() req, @Body() changePasswordDto: ChangePasswordDto): Promise<void> {
    return firstValueFrom(this.authClient.send('auth.change-password', { userId: req.user.id, ...changePasswordDto }));
  }

  @Public()
  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({ status: 200, description: 'Password reset email sent' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto): Promise<void> {
    return firstValueFrom(this.authClient.send('auth.forgot-password', forgotPasswordDto));
  }

  @Public()
  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 401, description: 'Invalid or expired reset token' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<void> {
    return firstValueFrom(this.authClient.send('auth.reset-password', resetPasswordDto));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin only endpoint' })
  @ApiResponse({ status: 200, description: 'Admin access granted' })
  @ApiResponse({ status: 403, description: 'Forbidden resource' })
  async adminOnly(): Promise<{ message: string }> {
    return { message: 'Admin access granted' };
  }
}