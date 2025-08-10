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
import { BuddhistContentService } from './buddhist-content.service';
import {
  CreateBuddhistContentDto,
  UpdateBuddhistContentDto,
  CreateFavoriteDto,
  CreateProgressDto,
  UpdateProgressDto,
  ContentQueryDto,
} from '@app/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('buddhist-content')
@Controller('buddhist-content')
export class BuddhistContentController {
  constructor(private readonly buddhistContentService: BuddhistContentService) {}

  // Buddhist Content Endpoints

  @Get()
  @ApiOperation({ summary: 'Get all Buddhist content' })
  @ApiResponse({ status: 200, description: 'List of Buddhist content' })
  async getAllContent(@Query() queryDto: ContentQueryDto) {
    return this.buddhistContentService.getAllContent(queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Buddhist content by ID' })
  @ApiResponse({ status: 200, description: 'Buddhist content details' })
  @ApiResponse({ status: 404, description: 'Content not found' })
  async getContentById(@Param('id') id: string) {
    return this.buddhistContentService.getContentById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new Buddhist content' })
  @ApiResponse({ status: 201, description: 'Content created successfully' })
  async createContent(@Body() createDto: CreateBuddhistContentDto) {
    return this.buddhistContentService.createContent(createDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update Buddhist content' })
  @ApiResponse({ status: 200, description: 'Content updated successfully' })
  @ApiResponse({ status: 404, description: 'Content not found' })
  async updateContent(
    @Param('id') id: string,
    @Body() updateDto: UpdateBuddhistContentDto,
  ) {
    return this.buddhistContentService.updateContent(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete Buddhist content' })
  @ApiResponse({ status: 200, description: 'Content deleted successfully' })
  @ApiResponse({ status: 404, description: 'Content not found' })
  async deleteContent(@Param('id') id: string) {
    return this.buddhistContentService.deleteContent(id);
  }

  // Favorites Endpoints

  @Get('favorites/user/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all favorites for a user' })
  @ApiResponse({ status: 200, description: 'List of favorites' })
  async getUserFavorites(@Param('userId') userId: string) {
    return this.buddhistContentService.getUserFavorites(userId);
  }

  @Post('favorites')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add content to favorites' })
  @ApiResponse({ status: 201, description: 'Content added to favorites' })
  async addToFavorites(@Body() createDto: CreateFavoriteDto) {
    return this.buddhistContentService.addToFavorites(createDto);
  }

  @Delete('favorites/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove content from favorites' })
  @ApiResponse({ status: 200, description: 'Content removed from favorites' })
  @ApiResponse({ status: 404, description: 'Favorite not found' })
  async removeFromFavorites(@Param('id') id: string) {
    return this.buddhistContentService.removeFromFavorites(id);
  }

  // Progress Endpoints

  @Get('progress/user/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all progress for a user' })
  @ApiResponse({ status: 200, description: 'List of progress' })
  async getUserProgress(@Param('userId') userId: string) {
    return this.buddhistContentService.getUserProgress(userId);
  }

  @Post('progress')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create progress for content' })
  @ApiResponse({ status: 201, description: 'Progress created' })
  async createProgress(@Body() createDto: CreateProgressDto) {
    return this.buddhistContentService.createProgress(createDto);
  }

  @Put('progress/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update progress for content' })
  @ApiResponse({ status: 200, description: 'Progress updated' })
  @ApiResponse({ status: 404, description: 'Progress not found' })
  async updateProgress(
    @Param('id') id: string,
    @Body() updateDto: UpdateProgressDto,
  ) {
    return this.buddhistContentService.updateProgress(id, updateDto);
  }

  // Additional Endpoints

  @Get('categories')
  @ApiOperation({ summary: 'Get all Buddhist content categories' })
  @ApiResponse({ status: 200, description: 'List of categories' })
  async getCategories() {
    return this.buddhistContentService.getCategories();
  }

  @Get('related/:id')
  @ApiOperation({ summary: 'Get related Buddhist content' })
  @ApiResponse({ status: 200, description: 'List of related content' })
  @ApiResponse({ status: 404, description: 'Content not found' })
  async getRelatedContent(@Param('id') id: string) {
    return this.buddhistContentService.getRelatedContent(id);
  }
}