import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard, Public, Roles, RolesGuard } from '@app/auth';
import { CreateMeditationSessionDto, UpdateMeditationSessionDto, CreateMeditationContentDto, UpdateMeditationContentDto, MeditationSessionResponseDto, MeditationContentResponseDto, MeditationQueryDto } from '@app/common';
import { Role } from '@prisma/client';

@ApiTags('meditation')
@Controller('meditation')
export class MeditationController {
  constructor(
    @Inject('CONTENT_SERVICE') private readonly contentClient: ClientProxy,
  ) {}

  // Meditation Content Endpoints

  @Public()
  @Get('content')
  @ApiOperation({ summary: 'Get all meditation content with pagination and filtering' })
  @ApiResponse({ status: 200, description: 'Content retrieved successfully', type: [MeditationContentResponseDto] })
  async getAllMeditationContent(@Query() query: MeditationQueryDto): Promise<MeditationContentResponseDto[]> {
    return firstValueFrom(this.contentClient.send('meditation.content.get-all', query));
  }

  @Public()
  @Get('content/:id')
  @ApiOperation({ summary: 'Get meditation content by ID' })
  @ApiResponse({ status: 200, description: 'Content retrieved successfully', type: MeditationContentResponseDto })
  @ApiResponse({ status: 404, description: 'Content not found' })
  async getMeditationContentById(@Param('id') id: string): Promise<MeditationContentResponseDto> {
    return firstValueFrom(this.contentClient.send('meditation.content.get-by-id', id));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.CONTENT_MANAGER)
  @Post('content')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new meditation content (Admin/Content Manager only)' })
  @ApiResponse({ status: 201, description: 'Content created successfully', type: MeditationContentResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden resource' })
  async createMeditationContent(@Body() createContentDto: CreateMeditationContentDto): Promise<MeditationContentResponseDto> {
    return firstValueFrom(this.contentClient.send('meditation.content.create', createContentDto));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.CONTENT_MANAGER)
  @Patch('content/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update meditation content by ID (Admin/Content Manager only)' })
  @ApiResponse({ status: 200, description: 'Content updated successfully', type: MeditationContentResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden resource' })
  @ApiResponse({ status: 404, description: 'Content not found' })
  async updateMeditationContent(
    @Param('id') id: string,
    @Body() updateContentDto: UpdateMeditationContentDto,
  ): Promise<MeditationContentResponseDto> {
    return firstValueFrom(this.contentClient.send('meditation.content.update', { id, ...updateContentDto }));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.CONTENT_MANAGER)
  @Delete('content/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete meditation content by ID (Admin/Content Manager only)' })
  @ApiResponse({ status: 200, description: 'Content deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden resource' })
  @ApiResponse({ status: 404, description: 'Content not found' })
  async deleteMeditationContent(@Param('id') id: string): Promise<void> {
    return firstValueFrom(this.contentClient.send('meditation.content.delete', id));
  }

  // Meditation Session Endpoints

  @UseGuards(JwtAuthGuard)
  @Post('sessions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new meditation session' })
  @ApiResponse({ status: 201, description: 'Session created successfully', type: MeditationSessionResponseDto })
  async createMeditationSession(@Req() req, @Body() createSessionDto: CreateMeditationSessionDto): Promise<MeditationSessionResponseDto> {
    return firstValueFrom(this.contentClient.send('meditation.session.create', {
      userId: req.user.id,
      ...createSessionDto,
    }));
  }

  @UseGuards(JwtAuthGuard)
  @Get('sessions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all meditation sessions for current user' })
  @ApiResponse({ status: 200, description: 'Sessions retrieved successfully', type: [MeditationSessionResponseDto] })
  async getUserMeditationSessions(@Req() req, @Query('page') page = 1, @Query('limit') limit = 10): Promise<MeditationSessionResponseDto[]> {
    return firstValueFrom(this.contentClient.send('meditation.session.get-by-user', {
      userId: req.user.id,
      page,
      limit,
    }));
  }

  @UseGuards(JwtAuthGuard)
  @Get('sessions/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get meditation session by ID' })
  @ApiResponse({ status: 200, description: 'Session retrieved successfully', type: MeditationSessionResponseDto })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async getMeditationSessionById(@Req() req, @Param('id') id: string): Promise<MeditationSessionResponseDto> {
    return firstValueFrom(this.contentClient.send('meditation.session.get-by-id', {
      userId: req.user.id,
      sessionId: id,
    }));
  }

  @UseGuards(JwtAuthGuard)
  @Patch('sessions/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update meditation session by ID' })
  @ApiResponse({ status: 200, description: 'Session updated successfully', type: MeditationSessionResponseDto })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async updateMeditationSession(
    @Req() req,
    @Param('id') id: string,
    @Body() updateSessionDto: UpdateMeditationSessionDto,
  ): Promise<MeditationSessionResponseDto> {
    return firstValueFrom(this.contentClient.send('meditation.session.update', {
      userId: req.user.id,
      sessionId: id,
      ...updateSessionDto,
    }));
  }

  @UseGuards(JwtAuthGuard)
  @Delete('sessions/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete meditation session by ID' })
  @ApiResponse({ status: 200, description: 'Session deleted successfully' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async deleteMeditationSession(@Req() req, @Param('id') id: string): Promise<void> {
    return firstValueFrom(this.contentClient.send('meditation.session.delete', {
      userId: req.user.id,
      sessionId: id,
    }));
  }

  @UseGuards(JwtAuthGuard)
  @Get('stats')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get meditation statistics for current user' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getMeditationStats(@Req() req): Promise<any> {
    return firstValueFrom(this.contentClient.send('meditation.stats', req.user.id));
  }
}