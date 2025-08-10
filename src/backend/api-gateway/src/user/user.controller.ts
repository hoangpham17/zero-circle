import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard, Roles, RolesGuard } from '@app/auth';
import { UpdateUserDto, UserResponseDto, UserSettingsDto } from '@app/common';
import { Role } from '@prisma/client';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserController {
  constructor(
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
  ) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully', type: UserResponseDto })
  async getProfile(@Req() req): Promise<UserResponseDto> {
    return firstValueFrom(this.userClient.send('user.get-by-id', req.user.id));
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'User profile updated successfully', type: UserResponseDto })
  async updateProfile(@Req() req, @Body() updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    return firstValueFrom(this.userClient.send('user.update', { id: req.user.id, ...updateUserDto }));
  }

  @Get('me/settings')
  @ApiOperation({ summary: 'Get current user settings' })
  @ApiResponse({ status: 200, description: 'User settings retrieved successfully' })
  async getUserSettings(@Req() req): Promise<any> {
    return firstValueFrom(this.userClient.send('user.get-settings', req.user.id));
  }

  @Patch('me/settings')
  @ApiOperation({ summary: 'Update current user settings' })
  @ApiResponse({ status: 200, description: 'User settings updated successfully' })
  async updateUserSettings(@Req() req, @Body() userSettingsDto: UserSettingsDto): Promise<any> {
    return firstValueFrom(this.userClient.send('user.update-settings', { userId: req.user.id, ...userSettingsDto }));
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Get()
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully', type: [UserResponseDto] })
  @ApiResponse({ status: 403, description: 'Forbidden resource' })
  async getAllUsers(@Query('page') page = 1, @Query('limit') limit = 10): Promise<UserResponseDto[]> {
    return firstValueFrom(this.userClient.send('user.get-all', { page, limit }));
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully', type: UserResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden resource' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserById(@Param('id') id: string): Promise<UserResponseDto> {
    return firstValueFrom(this.userClient.send('user.get-by-id', id));
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Update user by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'User updated successfully', type: UserResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden resource' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    return firstValueFrom(this.userClient.send('user.update', { id, ...updateUserDto }));
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete user by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden resource' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deleteUser(@Param('id') id: string): Promise<void> {
    return firstValueFrom(this.userClient.send('user.delete', id));
  }
}