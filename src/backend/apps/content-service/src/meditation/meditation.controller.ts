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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MeditationService } from './meditation.service';
import {
  CreateMeditationContentDto,
  UpdateMeditationContentDto,
  CreateMeditationSessionDto,
  UpdateMeditationSessionDto,
  MeditationQueryDto,
} from '@app/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('meditation')
@Controller('meditation')
export class MeditationController {
  constructor(private readonly meditationService: MeditationService) {}

  // Meditation Content Endpoints

  @Get('content')
  @ApiOperation({ summary: 'Get all meditation content' })
  @ApiResponse({ status: 200, description: 'List of meditation content' })
  async getAllContent(@Query() queryDto: MeditationQueryDto) {
    return this.meditationService.getAllContent(queryDto);
  }

  @Get('content/:id')
  @ApiOperation({ summary: 'Get meditation content by ID' })
  @ApiResponse({ status: 200, description: 'Meditation content details' })
  @ApiResponse({ status: 404, description: 'Content not found' })
  async getContentById(@Param('id') id: string) {
    return this.meditationService.getContentById(id);
  }

  @Post('content')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new meditation content' })
  @ApiResponse({ status: 201, description: 'Content created successfully' })
  async createContent(@Body() createDto: CreateMeditationContentDto) {
    return this.meditationService.createContent(createDto);
  }

  @Put('content/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update meditation content' })
  @ApiResponse({ status: 200, description: 'Content updated successfully' })
  @ApiResponse({ status: 404, description: 'Content not found' })
  async updateContent(
    @Param('id') id: string,
    @Body() updateDto: UpdateMeditationContentDto,
  ) {
    return this.meditationService.updateContent(id, updateDto);
  }

  @Delete('content/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete meditation content' })
  @ApiResponse({ status: 200, description: 'Content deleted successfully' })
  @ApiResponse({ status: 404, description: 'Content not found' })
  async deleteContent(@Param('id') id: string) {
    return this.meditationService.deleteContent(id);
  }

  // Meditation Session Endpoints

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all meditation sessions for a user' })
  @ApiResponse({ status: 200, description: 'List of meditation sessions' })
  async getUserSessions(@Query('userId') userId: string) {
    return this.meditationService.getUserSessions(userId);
  }

  @Get('sessions/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get meditation session by ID' })
  @ApiResponse({ status: 200, description: 'Meditation session details' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async getSessionById(@Param('id') id: string) {
    return this.meditationService.getSessionById(id);
  }

  @Post('sessions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new meditation session' })
  @ApiResponse({ status: 201, description: 'Session created successfully' })
  async createSession(@Body() createDto: CreateMeditationSessionDto) {
    return this.meditationService.createSession(createDto);
  }

  @Put('sessions/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update meditation session' })
  @ApiResponse({ status: 200, description: 'Session updated successfully' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async updateSession(
    @Param('id') id: string,
    @Body() updateDto: UpdateMeditationSessionDto,
  ) {
    return this.meditationService.updateSession(id, updateDto);
  }

  @Delete('sessions/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete meditation session' })
  @ApiResponse({ status: 200, description: 'Session deleted successfully' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async deleteSession(@Param('id') id: string) {
    return this.meditationService.deleteSession(id);
  }

  // Additional Endpoints

  @Get('categories')
  @ApiOperation({ summary: 'Get all meditation categories' })
  @ApiResponse({ status: 200, description: 'List of meditation categories' })
  async getCategories() {
    return this.meditationService.getCategories();
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get meditation statistics for a user' })
  @ApiResponse({ status: 200, description: 'Meditation statistics' })
  async getUserStats(@Query('userId') userId: string) {
    return this.meditationService.getUserStats(userId);
  }
}