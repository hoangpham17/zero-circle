import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { MeditationConfigService } from './meditation-config.service';
import {
  CreateMeditationConfigDto,
  UpdateMeditationConfigDto,
  MeditationConfigQueryDto,
} from '@app/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('meditation-config')
@Controller('meditation-config')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MeditationConfigController {
  constructor(private readonly meditationConfigService: MeditationConfigService) {}

  @Get()
  @ApiOperation({ summary: 'Get all meditation configs for a user' })
  @ApiResponse({ status: 200, description: 'List of meditation configs' })
  async getUserConfigs(
    @Request() req,
    @Query() queryDto: MeditationConfigQueryDto,
  ) {
    return this.meditationConfigService.getUserConfigs(req.user.id, queryDto);
  }

  @Get('default')
  @ApiOperation({ summary: 'Get default meditation config for a user' })
  @ApiResponse({ status: 200, description: 'Default meditation config' })
  async getDefaultConfig(@Request() req) {
    return this.meditationConfigService.getDefaultConfig(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get meditation config by ID' })
  @ApiResponse({ status: 200, description: 'Meditation config details' })
  @ApiResponse({ status: 404, description: 'Config not found' })
  async getConfigById(@Param('id') id: string) {
    return this.meditationConfigService.getConfigById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new meditation config' })
  @ApiResponse({ status: 201, description: 'Config created successfully' })
  async createConfig(
    @Request() req,
    @Body() createDto: CreateMeditationConfigDto,
  ) {
    return this.meditationConfigService.createConfig(req.user.id, createDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update meditation config' })
  @ApiResponse({ status: 200, description: 'Config updated successfully' })
  @ApiResponse({ status: 404, description: 'Config not found' })
  async updateConfig(
    @Request() req,
    @Param('id') id: string,
    @Body() updateDto: UpdateMeditationConfigDto,
  ) {
    return this.meditationConfigService.updateConfig(id, req.user.id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete meditation config' })
  @ApiResponse({ status: 200, description: 'Config deleted successfully' })
  @ApiResponse({ status: 404, description: 'Config not found' })
  async deleteConfig(@Param('id') id: string) {
    return this.meditationConfigService.deleteConfig(id);
  }
}