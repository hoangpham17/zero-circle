import { Controller, Get, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { UserSettingsDto } from '@app/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('settings')
@Controller('settings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get(':userId')
  @ApiOperation({ summary: 'Get user settings' })
  @ApiResponse({ status: 200, description: 'User settings' })
  @ApiResponse({ status: 404, description: 'Settings not found' })
  async getUserSettings(@Param('userId') userId: string) {
    return this.settingsService.getUserSettings(userId);
  }

  @Put(':userId')
  @ApiOperation({ summary: 'Update user settings' })
  @ApiResponse({ status: 200, description: 'Settings updated successfully' })
  @ApiResponse({ status: 404, description: 'Settings not found' })
  async updateUserSettings(
    @Param('userId') userId: string,
    @Body() settingsDto: UserSettingsDto,
  ) {
    return this.settingsService.updateUserSettings(userId, settingsDto);
  }
}