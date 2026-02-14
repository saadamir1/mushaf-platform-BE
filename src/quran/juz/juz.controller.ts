import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { JuzService } from './juz.service';

@ApiTags('Quran - Juz')
@Controller('quran/juz')
export class JuzController {
  constructor(private readonly juzService: JuzService) {}

  @Get()
  @ApiOperation({ summary: 'Get all Juz (30 parts)' })
  async getAllJuz() {
    return await this.juzService.findAll();
  }

  @Get(':number')
  @ApiOperation({ summary: 'Get Juz by number' })
  @ApiParam({ name: 'number', type: Number, example: 1 })
  async getJuzByNumber(@Param('number', ParseIntPipe) number: number) {
    return await this.juzService.findByNumber(number);
  }

  @Get(':number/details')
  @ApiOperation({ summary: 'Get Juz with verse details' })
  @ApiParam({ name: 'number', type: Number, example: 1 })
  async getJuzWithVerses(@Param('number', ParseIntPipe) number: number) {
    return await this.juzService.getJuzWithVerses(number);
  }
}