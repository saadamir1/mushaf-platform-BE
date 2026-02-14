import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuranPage } from '../entities/page.entity';

@Injectable()
export class PagesService {
  constructor(
    @InjectRepository(QuranPage)
    private pageRepository: Repository<QuranPage>,
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
    const page = await this.pageRepository.findOne({
      where: { pageNumber },
    });

    if (!page) {
      throw new NotFoundException(`Page ${pageNumber} not found`);
    }

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
    const page = await this.findByNumber(pageNumber);
    page.imageUrl = imageUrl;
    return await this.pageRepository.save(page);
  }
}