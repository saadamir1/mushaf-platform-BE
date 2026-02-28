import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuranPage } from '../entities/page.entity';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class PagesService {
  constructor(
    @InjectRepository(QuranPage)
    private pageRepository: Repository<QuranPage>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async findAll(page = 1, limit = 20) {
    const [data, total] = await this.pageRepository.findAndCount({
      order: { pageNumber: 'ASC' },
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

  async findByNumber(pageNumber: number) {
    const cacheKey = `page:${pageNumber}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const page = await this.pageRepository.findOne({
      where: { pageNumber },
    });

    if (!page) {
      throw new NotFoundException(`Page ${pageNumber} not found`);
    }

    await this.cacheManager.set(cacheKey, page);
    return page;
  }

  async getPageRange(start: number, end: number) {
    if (start > end) {
      throw new NotFoundException('Start page must be less than or equal to end page');
    }

    const pages = await this.pageRepository
      .createQueryBuilder('page')
      .where('page.pageNumber BETWEEN :start AND :end', { start, end })
      .orderBy('page.pageNumber', 'ASC')
      .getMany();

    if (!pages.length) {
      throw new NotFoundException(`No pages found in range ${start}-${end}`);
    }

    return pages;
  }

  // For future when Cloudinary images are uploaded
  async updatePageImage(pageNumber: number, imageUrl: string) {
    const page = (await this.findByNumber(pageNumber)) as QuranPage;
    page.imageUrl = imageUrl;
    return await this.pageRepository.save(page);
  }

  async findBySurahStart(surahNumber: number) {
    const page = await this.pageRepository.findOne({
      where: { surahNumberStart: surahNumber },
    });

    if (!page) {
      throw new NotFoundException(`No page found for Surah ${surahNumber}`);
    }

    return page;
  }

  async findByJuzStart(juzNumber: number) {
    const page = await this.pageRepository.findOne({
      where: { juzNumber },
    });

    if (!page) {
      throw new NotFoundException(`No page found for Juz ${juzNumber}`);
    }

    return page;
  }
}