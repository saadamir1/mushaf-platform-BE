import { Controller, Get, Query, Param, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';
import { PagesService } from './pages.service';

@ApiTags('Quran - Pages')
@Controller('quran/pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all Quran pages with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  async getAllPages(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return await this.pagesService.findAll(page, limit);
  }

  @Get('range')
  @ApiOperation({ summary: 'Get pages in a range' })
  @ApiQuery({ name: 'start', required: true, type: Number, example: 1 })
  @ApiQuery({ name: 'end', required: true, type: Number, example: 10 })
  async getPageRange(
    @Query('start', ParseIntPipe) start: number,
    @Query('end', ParseIntPipe) end: number,
  ) {
    return await this.pagesService.getPageRange(start, end);
  }

  @Get(':number')
  @ApiOperation({ summary: 'Get page by number' })
  @ApiParam({ name: 'number', type: Number, example: 1 })
  async getPageByNumber(@Param('number', ParseIntPipe) number: number) {
    return await this.pagesService.findByNumber(number);
  }
}