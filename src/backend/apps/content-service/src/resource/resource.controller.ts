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
import { ResourceService } from './resource.service';
import {
  CreateSoundResourceDto,
  UpdateSoundResourceDto,
  CreateImageResourceDto,
  UpdateImageResourceDto,
  ResourceQueryDto,
} from '@app/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('resources')
@Controller('resources')
export class ResourceController {
  constructor(private readonly resourceService: ResourceService) {}

  // Sound Resource Endpoints

  @Get('sounds')
  @ApiOperation({ summary: 'Get all sound resources' })
  @ApiResponse({ status: 200, description: 'List of sound resources' })
  async getAllSounds(@Query() queryDto: ResourceQueryDto) {
    return this.resourceService.getAllSounds(queryDto);
  }

  @Get('sounds/:id')
  @ApiOperation({ summary: 'Get sound resource by ID' })
  @ApiResponse({ status: 200, description: 'Sound resource details' })
  @ApiResponse({ status: 404, description: 'Sound resource not found' })
  async getSoundById(@Param('id') id: string) {
    return this.resourceService.getSoundById(id);
  }

  @Post('sounds')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new sound resource' })
  @ApiResponse({ status: 201, description: 'Sound resource created successfully' })
  async createSound(
    @Request() req,
    @Body() createDto: CreateSoundResourceDto,
  ) {
    return this.resourceService.createSound(req.user.id, createDto);
  }

  @Put('sounds/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update sound resource' })
  @ApiResponse({ status: 200, description: 'Sound resource updated successfully' })
  @ApiResponse({ status: 404, description: 'Sound resource not found' })
  async updateSound(
    @Param('id') id: string,
    @Body() updateDto: UpdateSoundResourceDto,
  ) {
    return this.resourceService.updateSound(id, updateDto);
  }

  @Delete('sounds/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete sound resource' })
  @ApiResponse({ status: 200, description: 'Sound resource deleted successfully' })
  @ApiResponse({ status: 404, description: 'Sound resource not found' })
  async deleteSound(@Param('id') id: string) {
    return this.resourceService.deleteSound(id);
  }

  // Image Resource Endpoints

  @Get('images')
  @ApiOperation({ summary: 'Get all image resources' })
  @ApiResponse({ status: 200, description: 'List of image resources' })
  async getAllImages(@Query() queryDto: ResourceQueryDto) {
    return this.resourceService.getAllImages(queryDto);
  }

  @Get('images/:id')
  @ApiOperation({ summary: 'Get image resource by ID' })
  @ApiResponse({ status: 200, description: 'Image resource details' })
  @ApiResponse({ status: 404, description: 'Image resource not found' })
  async getImageById(@Param('id') id: string) {
    return this.resourceService.getImageById(id);
  }

  @Post('images')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new image resource' })
  @ApiResponse({ status: 201, description: 'Image resource created successfully' })
  async createImage(
    @Request() req,
    @Body() createDto: CreateImageResourceDto,
  ) {
    return this.resourceService.createImage(req.user.id, createDto);
  }

  @Put('images/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update image resource' })
  @ApiResponse({ status: 200, description: 'Image resource updated successfully' })
  @ApiResponse({ status: 404, description: 'Image resource not found' })
  async updateImage(
    @Param('id') id: string,
    @Body() updateDto: UpdateImageResourceDto,
  ) {
    return this.resourceService.updateImage(id, updateDto);
  }

  @Delete('images/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete image resource' })
  @ApiResponse({ status: 200, description: 'Image resource deleted successfully' })
  @ApiResponse({ status: 404, description: 'Image resource not found' })
  async deleteImage(@Param('id') id: string) {
    return this.resourceService.deleteImage(id);
  }
}