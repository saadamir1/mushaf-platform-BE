import { Controller, Get, Param, ParseIntPipe, Query, DefaultValuePipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { SurahsService } from './surahs.service';

@ApiTags('Quran - Surahs')
@Controller('/quran/surahs')
export class SurahsController {
  constructor(private readonly surahsService: SurahsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all Surahs' })
  async getAllSurahs() {
    return await this.surahsService.findAll();
  }

  @Get(':number')
  @ApiOperation({ summary: 'Get Surah by number' })
  async getSurahByNumber(@Param('number', ParseIntPipe) number: number) {
    return await this.surahsService.findByNumber(number);
  }

  @Get(':number/verses')
  @ApiOperation({ summary: 'Get Surah with verses (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 50 })
  async getSurahWithVerses(
    @Param('number', ParseIntPipe) number: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    return await this.surahsService.findByNumberWithVerses(number, page, limit);
  }
}