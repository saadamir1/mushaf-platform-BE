import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'Get Surah with verses' })
  async getSurahWithVerses(@Param('number', ParseIntPipe) number: number) {
    return await this.surahsService.findByNumberWithVerses(number);
  }
}