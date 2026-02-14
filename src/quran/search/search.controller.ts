import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { SearchService } from './search.service';

@ApiTags('Quran - Search')
@Controller('quran/search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('verses')
  @ApiOperation({ summary: 'Search in verses' })
  @ApiQuery({ name: 'q', required: true, type: String, example: 'رحم' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 50 })
  async searchVerses(
    @Query('q') query: string,
    @Query('limit') limit?: number,
  ) {
    return await this.searchService.searchVerses(query, limit);
  }

  @Get('surahs')
  @ApiOperation({ summary: 'Search in surahs' })
  @ApiQuery({ name: 'q', required: true, type: String, example: 'فاتحہ' })
  async searchSurahs(@Query('q') query: string) {
    return await this.searchService.searchSurahs(query);
  }

  @Get()
  @ApiOperation({ summary: 'Search everywhere (surahs + verses)' })
  @ApiQuery({ name: 'q', required: true, type: String, example: 'اللہ' })
  async searchAll(@Query('q') query: string) {
    return await this.searchService.searchAll(query);
  }
}