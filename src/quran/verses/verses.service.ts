import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Verse } from '../entities/verse.entity';

@Injectable()
export class VersesService {
  constructor(
    @InjectRepository(Verse)
    private verseRepository: Repository<Verse>,
  ) {}

  async findAll(page = 1, limit = 10) {
    const [data, total] = await this.verseRepository.findAndCount({
      order: { surahId: 'ASC', verseNumber: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['surah'],
    });

    return {
      data,
      total,
      page,
      limit,
      lastPage: Math.ceil(total / limit),
    };
  }

  async findBySurah(surahId: number, page = 1, limit = 20) {
    const [data, total] = await this.verseRepository.findAndCount({
      where: { surahId },
      order: { verseNumber: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['surah'],
    });

    if (!data.length) {
      throw new NotFoundException(`No verses found for Surah ${surahId}`);
    }

    return {
      data,
      total,
      page,
      limit,
      lastPage: Math.ceil(total / limit),
    };
  }

  async findById(id: number) {
    const verse = await this.verseRepository.findOne({
      where: { id },
      relations: ['surah'],
    });

    if (!verse) {
      throw new NotFoundException(`Verse with ID ${id} not found`);
    }

    return verse;
  }

  async findByPage(pageNumber: number) {
    const verses = await this.verseRepository.find({
      where: { pageNumber },
      order: { surahId: 'ASC', verseNumber: 'ASC' },
      relations: ['surah'],
    });

    if (!verses.length) {
      throw new NotFoundException(`No verses found for page ${pageNumber}`);
    }

    return verses;
  }

  async findByJuz(juzNumber: number, page = 1, limit = 50) {
    const [data, total] = await this.verseRepository.findAndCount({
      where: { juzNumber },
      order: { surahId: 'ASC', verseNumber: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['surah'],
    });

    if (!data.length) {
      throw new NotFoundException(`No verses found for Juz ${juzNumber}`);
    }

    return {
      data,
      total,
      page,
      limit,
      lastPage: Math.ceil(total / limit),
    };
  }

  async search(query: string, limit = 50) {
    if (!query || query.trim().length < 2) {
      throw new NotFoundException('Search query must be at least 2 characters');
    }

    const verses = await this.verseRepository
      .createQueryBuilder('verse')
      .leftJoinAndSelect('verse.surah', 'surah')
      .where('verse.textArabic LIKE :query', { query: `%${query}%` })
      .orWhere('verse.textUrdu LIKE :query', { query: `%${query}%` })
      .orWhere('verse.tafseerUrdu LIKE :query', { query: `%${query}%` })
      .orderBy('verse.surahId', 'ASC')
      .addOrderBy('verse.verseNumber', 'ASC')
      .limit(limit)
      .getMany();

    return {
      query,
      results: verses,
      count: verses.length,
    };
  }

  async getVerseRange(startId: number, endId: number) {
    const verses = await this.verseRepository
      .createQueryBuilder('verse')
      .leftJoinAndSelect('verse.surah', 'surah')
      .where('verse.id BETWEEN :startId AND :endId', { startId, endId })
      .orderBy('verse.surahId', 'ASC')
      .addOrderBy('verse.verseNumber', 'ASC')
      .getMany();

    if (!verses.length) {
      throw new NotFoundException(`No verses found in range ${startId}-${endId}`);
    }

    return verses;
  }
}