import { Controller, Get, Query, Param, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { InsightsService } from './insights.service';

@ApiTags('Quran - Insights')
@Controller('quran/insights')
export class InsightsController {
  constructor(private readonly insightsService: InsightsService) {}

  @Get('daily')
  @ApiOperation({ summary: 'Deterministic daily Surah focus' })
  daily() {
    return this.insightsService.dailyFocus();
  }

  @Get('page/:pageNumber')
  @ApiOperation({ summary: 'Rich page context: surah, juz, topics, progress' })
  pageContext(@Param('pageNumber', ParseIntPipe) pageNumber: number) {
    return this.insightsService.pageContext(pageNumber);
  }

  @Get('khatm')
  @ApiOperation({ summary: 'Algorithmic khatm (completion) plan' })
  @ApiQuery({ name: 'from', required: false, type: Number })
  @ApiQuery({ name: 'days', required: false, type: Number })
  khatm(
    @Query('from', new DefaultValuePipe(1), ParseIntPipe) from: number,
    @Query('days', new DefaultValuePipe(30), ParseIntPipe) days: number,
  ) {
    return this.insightsService.khatmPlan(from, days);
  }

  @Get('suggest')
  @ApiOperation({ summary: 'Smart next-step suggestions from current page' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  suggest(@Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number) {
    return this.insightsService.smartSuggest(page);
  }
}
