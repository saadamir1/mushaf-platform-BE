import { 
  Controller, 
  Get, 
  Post, 
  Delete, 
  Patch, 
  Body, 
  Param, 
  Query, 
  ParseIntPipe, 
  DefaultValuePipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { BookmarksService } from './bookmarks.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { UpdateBookmarkNoteDto } from './dto/update-bookmark-note.dto';
import { UpdateReadingProgressDto } from './dto/update-reading-progress.dto';

@ApiTags('Bookmarks & Reading Progress')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('bookmarks')
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  // Bookmarks
  @Post()
  @ApiOperation({ summary: 'Create a bookmark' })
  async createBookmark(
    @Request() req,
    @Body() dto: CreateBookmarkDto,
  ) {
    return await this.bookmarksService.createBookmark(req.user.userId, dto.pageNumber, dto.note);
  }

  @Get()
  @ApiOperation({ summary: 'Get user bookmarks' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  async getUserBookmarks(
    @Request() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return await this.bookmarksService.getUserBookmarks(req.user.userId, page, limit);
  }

  @Get('page-numbers')
  @ApiOperation({ summary: 'Get all bookmarked page numbers for current user' })
  async getBookmarkedPageNumbers(@Request() req) {
    const pageNumbers = await this.bookmarksService.getBookmarkedPageNumbers(req.user.userId);
    return { pageNumbers };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a bookmark' })
  @ApiParam({ name: 'id', type: Number })
  async deleteBookmark(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.bookmarksService.deleteBookmark(req.user.userId, id);
  }

  @Patch(':id/note')
  @ApiOperation({ summary: 'Update bookmark note' })
  @ApiParam({ name: 'id', type: Number })
  async updateBookmarkNote(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBookmarkNoteDto,
  ) {
    return await this.bookmarksService.updateBookmarkNote(req.user.userId, id, dto.note);
  }

  // Reading Progress
  @Post('progress')
  @ApiOperation({ summary: 'Update reading progress' })
  async updateProgress(
    @Request() req,
    @Body() dto: UpdateReadingProgressDto,
  ) {
    return await this.bookmarksService.updateReadingProgress(
      req.user.userId,
      dto.pageNumber,
    );
  }

  @Get('progress')
  @ApiOperation({ summary: 'Get reading progress' })
  async getProgress(@Request() req) {
    return await this.bookmarksService.getReadingProgress(req.user.userId);
  }

  @Delete('progress')
  @ApiOperation({ summary: 'Reset reading progress' })
  async resetProgress(@Request() req) {
    return await this.bookmarksService.resetReadingProgress(req.user.userId);
  }
}
