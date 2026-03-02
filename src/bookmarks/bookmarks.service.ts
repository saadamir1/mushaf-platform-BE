import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bookmark } from './entities/bookmark.entity';
import { ReadingProgress } from './entities/reading-progress.entity';

@Injectable()
export class BookmarksService {
  constructor(
    @InjectRepository(Bookmark)
    private bookmarkRepository: Repository<Bookmark>,
    @InjectRepository(ReadingProgress)
    private progressRepository: Repository<ReadingProgress>,
  ) {}

  // Bookmarks
  async createBookmark(userId: number, pageNumber: number, note?: string) {
    const existing = await this.bookmarkRepository.findOne({
      where: { userId, pageNumber },
    });

    if (existing) {
      throw new ConflictException('Bookmark already exists for this page');
    }

    const bookmark = this.bookmarkRepository.create({
      userId,
      pageNumber,
      note,
    });

    return await this.bookmarkRepository.save(bookmark);
  }

  async getUserBookmarks(userId: number, page = 1, limit = 20) {
    const [data, total] = await this.bookmarkRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      lastPage: Math.ceil(total / limit),
    };
  }

  async getBookmarkedPageNumbers(userId: number) {
    const bookmarks = await this.bookmarkRepository.find({
      where: { userId },
      select: ['pageNumber'],
    });
    return bookmarks.map(b => b.pageNumber);
  }

  async deleteBookmark(userId: number, bookmarkId: number) {
    const bookmark = await this.bookmarkRepository.findOne({
      where: { id: bookmarkId, userId },
    });

    if (!bookmark) {
      throw new NotFoundException('Bookmark not found');
    }

    await this.bookmarkRepository.remove(bookmark);
    return { message: 'Bookmark deleted successfully' };
  }

  async updateBookmarkNote(userId: number, bookmarkId: number, note: string) {
    const bookmark = await this.bookmarkRepository.findOne({
      where: { id: bookmarkId, userId },
    });

    if (!bookmark) {
      throw new NotFoundException('Bookmark not found');
    }

    bookmark.note = note;
    return await this.bookmarkRepository.save(bookmark);
  }

  // Reading Progress
  async updateReadingProgress(
    userId: number,
    pageNumber: number,
  ) {
    let progress = await this.progressRepository.findOne({
      where: { userId },
    });

    // Calculate completion percentage (total pages in Mushaf = 1027)
    const TOTAL_PAGES = 1027;
    const completionPercentage = Math.min(Math.floor((pageNumber / TOTAL_PAGES) * 100), 100);

    if (!progress) {
      progress = this.progressRepository.create({
        userId,
        lastPageNumber: pageNumber,
        completionPercentage,
      });
    } else {
      progress.lastPageNumber = pageNumber;
      progress.completionPercentage = completionPercentage;
    }

    return await this.progressRepository.save(progress);
  }

  async getReadingProgress(userId: number) {
    const progress = await this.progressRepository.findOne({
      where: { userId },
    });

    if (!progress) {
      throw new NotFoundException('No reading progress found');
    }

    return progress;
  }

  async resetReadingProgress(userId: number) {
    const progress = await this.progressRepository.findOne({
      where: { userId },
    });

    if (progress) {
      await this.progressRepository.remove(progress);
    }

    return { message: 'Reading progress reset successfully' };
  }

  // Delete all user data (for account deletion)
  async deleteAllUserData(userId: number) {
    // Delete all bookmarks
    await this.bookmarkRepository.delete({ userId });
    
    // Delete reading progress
    await this.progressRepository.delete({ userId });
    
    return { message: 'All user data deleted successfully' };
  }
}
