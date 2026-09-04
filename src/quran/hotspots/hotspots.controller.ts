import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { HotspotsService } from './hotspots.service';

@ApiTags('Quran - Hotspots')
@Controller('quran/hotspots')
export class HotspotsController {
  constructor(private readonly hotspotsService: HotspotsService) {}

  @Get('page/:pageNumber')
  @ApiOperation({ summary: 'Get interactive hotspots for a Mushaf page' })
  @ApiParam({ name: 'pageNumber', type: Number })
  findByPage(@Param('pageNumber', ParseIntPipe) pageNumber: number) {
    return this.hotspotsService.findByPage(pageNumber);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get hotspot by id' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.hotspotsService.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create hotspot (admin)' })
  create(@Body() body: Partial<{ pageNumber: number; x: number; y: number; width: number; height: number; label: string; topicIndexId: number; linkType: string }>) {
    return this.hotspotsService.create(body);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete hotspot (admin)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.hotspotsService.remove(id);
  }
}
