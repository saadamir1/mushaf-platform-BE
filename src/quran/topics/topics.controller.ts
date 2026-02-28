import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { TopicsService } from './topics.service';

@ApiTags('Quran - Topics')
@Controller('topics')
export class TopicsController {
  constructor(private readonly topicsService: TopicsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all topics' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  async getAllTopics(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return await this.topicsService.findAll(page, limit);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search topics by name' })
  @ApiQuery({ name: 'q', required: true, type: String, example: 'توحید' })
  async searchTopics(@Query('q') query: string) {
    return await this.topicsService.searchTopics(query);
  }

  @Get('category/:category')
  @ApiOperation({ summary: 'Get topics by category' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  async getTopicsByCategory(
    @Param('category') category: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return await this.topicsService.getTopicsByCategory(category, page, limit);
  }
}