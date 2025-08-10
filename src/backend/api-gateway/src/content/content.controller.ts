import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard, Public, Roles, RolesGuard } from '@app/auth';
import { CreateBuddhistContentDto, UpdateBuddhistContentDto, BuddhistContentResponseDto, ContentQueryDto, CreateFavoriteDto, CreateProgressDto, UpdateProgressDto } from '@app/common';
import { Role } from '@prisma/client';

@ApiTags('buddhist-content')
@Controller('buddhist-content')
export class ContentController {
  constructor(
    @Inject('CONTENT_SERVICE') private readonly contentClient: ClientProxy,
  ) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all Buddhist content with pagination and filtering' })
  @ApiResponse({ status: 200, description: 'Content retrieved successfully', type: [BuddhistContentResponseDto] })
  async getAllContent(@Query() query: ContentQueryDto): Promise<BuddhistContentResponseDto[]> {
    return firstValueFrom(this.contentClient.send('buddhist-content.get-all', query));
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get Buddhist content by ID' })
  @ApiResponse({ status: 200, description: 'Content retrieved successfully', type: BuddhistContentResponseDto })
  @ApiResponse({ status: 404, description: 'Content not found' })
  async getContentById(@Param('id') id: string): Promise<BuddhistContentResponseDto> {
    return firstValueFrom(this.contentClient.send('buddhist-content.get-by-id', id));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.CONTENT_MANAGER)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new Buddhist content (Admin/Content Manager only)' })
  @ApiResponse({ status: 201, description: 'Content created successfully', type: BuddhistContentResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden resource' })
  async createContent(@Body() createContentDto: CreateBuddhistContentDto): Promise<BuddhistContentResponseDto> {
    return firstValueFrom(this.contentClient.send('buddhist-content.create', createContentDto));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.CONTENT_MANAGER)
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update Buddhist content by ID (Admin/Content Manager only)' })
  @ApiResponse({ status: 200, description: 'Content updated successfully', type: BuddhistContentResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden resource' })
  @ApiResponse({ status: 404, description: 'Content not found' })
  async updateContent(
    @Param('id') id: string,
    @Body() updateContentDto: UpdateBuddhistContentDto,
  ): Promise<BuddhistContentResponseDto> {
    return firstValueFrom(this.contentClient.send('buddhist-content.update', { id, ...updateContentDto }));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.CONTENT_MANAGER)
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete Buddhist content by ID (Admin/Content Manager only)' })
  @ApiResponse({ status: 200, description: 'Content deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden resource' })
  @ApiResponse({ status: 404, description: 'Content not found' })
  async deleteContent(@Param('id') id: string): Promise<void> {
    return firstValueFrom(this.contentClient.send('buddhist-content.delete', id));
  }

  @UseGuards(JwtAuthGuard)
  @Post('favorites')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add content to favorites' })
  @ApiResponse({ status: 201, description: 'Content added to favorites successfully' })
  async addToFavorites(@Req() req, @Body() createFavoriteDto: CreateFavoriteDto): Promise<any> {
    return firstValueFrom(this.contentClient.send('buddhist-content.add-favorite', {
      userId: req.user.id,
      ...createFavoriteDto,
    }));
  }

  @UseGuards(JwtAuthGuard)
  @Delete('favorites/:contentId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove content from favorites' })
  @ApiResponse({ status: 200, description: 'Content removed from favorites successfully' })
  async removeFromFavorites(@Req() req, @Param('contentId') contentId: string): Promise<void> {
    return firstValueFrom(this.contentClient.send('buddhist-content.remove-favorite', {
      userId: req.user.id,
      contentId,
    }));
  }

  @UseGuards(JwtAuthGuard)
  @Get('favorites')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user favorites' })
  @ApiResponse({ status: 200, description: 'Favorites retrieved successfully', type: [BuddhistContentResponseDto] })
  async getUserFavorites(@Req() req): Promise<BuddhistContentResponseDto[]> {
    return firstValueFrom(this.contentClient.send('buddhist-content.get-favorites', req.user.id));
  }

  @UseGuards(JwtAuthGuard)
  @Post('progress')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create or update content progress' })
  @ApiResponse({ status: 201, description: 'Progress created successfully' })
  async createProgress(@Req() req, @Body() createProgressDto: CreateProgressDto): Promise<any> {
    return firstValueFrom(this.contentClient.send('buddhist-content.create-progress', {
      userId: req.user.id,
      ...createProgressDto,
    }));
  }

  @UseGuards(JwtAuthGuard)
  @Patch('progress/:contentId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update content progress' })
  @ApiResponse({ status: 200, description: 'Progress updated successfully' })
  async updateProgress(
    @Req() req,
    @Param('contentId') contentId: string,
    @Body() updateProgressDto: UpdateProgressDto,
  ): Promise<any> {
    return firstValueFrom(this.contentClient.send('buddhist-content.update-progress', {
      userId: req.user.id,
      contentId,
      ...updateProgressDto,
    }));
  }

  @UseGuards(JwtAuthGuard)
  @Get('progress')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user progress for all content' })
  @ApiResponse({ status: 200, description: 'Progress retrieved successfully' })
  async getUserProgress(@Req() req): Promise<any[]> {
    return firstValueFrom(this.contentClient.send('buddhist-content.get-progress', req.user.id));
  }
}