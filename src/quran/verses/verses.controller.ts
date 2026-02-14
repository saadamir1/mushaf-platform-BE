import { Controller, Get, Query, Param, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';
import { VersesService } from './verses.service';

@ApiTags('Quran - Verses')
@Controller('quran/verses')
export class VersesController {
  constructor(private readonly versesService: VersesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all verses with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  async getAllVerses(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return await this.versesService.findAll(page, limit);
  }

  @Get('surah/:surahId')
  @ApiOperation({ summary: 'Get verses by Surah ID' })
  @ApiParam({ name: 'surahId', type: Number, example: 1 })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  async getVersesBySurah(
    @Param('surahId', ParseIntPipe) surahId: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return await this.versesService.findBySurah(surahId, page, limit);
  }

  @Get('page/:pageNumber')
  @ApiOperation({ summary: 'Get verses by page number' })
  @ApiParam({ name: 'pageNumber', type: Number, example: 1 })
  async getVersesByPage(@Param('pageNumber', ParseIntPipe) pageNumber: number) {
    return await this.versesService.findByPage(pageNumber);
  }

  @Get('juz/:juzNumber')
  @ApiOperation({ summary: 'Get verses by Juz number' })
  @ApiParam({ name: 'juzNumber', type: Number, example: 1 })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 50 })
  async getVersesByJuz(
    @Param('juzNumber', ParseIntPipe) juzNumber: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    return await this.versesService.findByJuz(juzNumber, page, limit);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search verses by keyword' })
  @ApiQuery({ name: 'q', required: true, type: String, example: 'رحم' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 50 })
  async searchVerses(
    @Query('q') query: string,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    return await this.versesService.search(query, limit);
  }

  @Get('range')
  @ApiOperation({ summary: 'Get verses in a range' })
  @ApiQuery({ name: 'start', required: true, type: Number, example: 1 })
  @ApiQuery({ name: 'end', required: true, type: Number, example: 10 })
  async getVerseRange(
    @Query('start', ParseIntPipe) start: number,
    @Query('end', ParseIntPipe) end: number,
  ) {
    return await this.versesService.getVerseRange(start, end);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single verse by ID' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  async getVerseById(@Param('id', ParseIntPipe) id: number) {
    return await this.versesService.findById(id);
  }
}