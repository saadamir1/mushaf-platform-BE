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
  async createBookmark(userId: number, verseId: number, note?: string) {
    const existing = await this.bookmarkRepository.findOne({
      where: { userId, verseId },
    });

    if (existing) {
      throw new ConflictException('Bookmark already exists for this verse');
    }

    const bookmark = this.bookmarkRepository.create({
      userId,
      verseId,
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
    verseId: number,
    surahNumber?: number,
    pageNumber?: number,
  ) {
    let progress = await this.progressRepository.findOne({
      where: { userId },
    });

    if (!progress) {
      progress = this.progressRepository.create({
        userId,
        lastVerseId: verseId,
        lastSurahNumber: surahNumber,
        lastPageNumber: pageNumber,
        completionPercentage: 0,
      });
    } else {
      progress.lastVerseId = verseId;
      if (surahNumber) progress.lastSurahNumber = surahNumber;
      if (pageNumber) progress.lastPageNumber = pageNumber;
      // TODO: Calculate completion percentage based on total verses (6236)
      // progress.completionPercentage = Math.floor((verseId / 6236) * 100);
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
}