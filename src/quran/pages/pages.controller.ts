import { Controller, Get, Query, Param, ParseIntPipe, DefaultValuePipe, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PagesService } from './pages.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Quran - Pages')
@Controller('quran/pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Post('remap')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Rebuild Surah/Juz/page map from uploaded pages (admin)' })
  async remap() {
    return await this.pagesService.remapIndexes();
  }

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

  @Get('surah/:surahNumber')
  @ApiOperation({ summary: 'Get first page for a Surah' })
  @ApiParam({ name: 'surahNumber', type: Number, example: 1 })
  async getPageBySurah(@Param('surahNumber', ParseIntPipe) surahNumber: number) {
    return await this.pagesService.findBySurahStart(surahNumber);
  }

  @Get('juz/:juzNumber')
  @ApiOperation({ summary: 'Get first page for a Juz' })
  @ApiParam({ name: 'juzNumber', type: Number, example: 1 })
  async getPageByJuz(@Param('juzNumber', ParseIntPipe) juzNumber: number) {
    return await this.pagesService.findByJuzStart(juzNumber);
  }

  @Get('map/:pageNumber')
  @ApiOperation({ summary: 'Page mapping metadata (surah/juz resolved)' })
  @ApiParam({ name: 'pageNumber', type: Number })
  async getPageMap(@Param('pageNumber', ParseIntPipe) pageNumber: number) {
    return await this.pagesService.getPageMapping(pageNumber);
  }

  @Get(':number')
  @ApiOperation({ summary: 'Get page by number' })
  @ApiParam({ name: 'number', type: Number, example: 1 })
  async getPageByNumber(@Param('number', ParseIntPipe) number: number) {
    return await this.pagesService.findByNumber(number);
  }
}
