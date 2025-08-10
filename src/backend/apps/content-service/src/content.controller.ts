import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ContentService } from './content.service';
import { ContentQueryDto } from '@app/common';

@ApiTags('content')
@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get('search')
  @ApiOperation({ summary: 'Search for content across all types' })
  @ApiResponse({ status: 200, description: 'Content search results' })
  async searchContent(@Query() queryDto: ContentQueryDto) {
    return this.contentService.searchContent(queryDto);
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured content' })
  @ApiResponse({ status: 200, description: 'Featured content' })
  async getFeaturedContent() {
    return this.contentService.getFeaturedContent();
  }

  @Get('recommended')
  @ApiOperation({ summary: 'Get recommended content based on user preferences' })
  @ApiResponse({ status: 200, description: 'Recommended content' })
  async getRecommendedContent(@Query('userId') userId: string) {
    return this.contentService.getRecommendedContent(userId);
  }
}