import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Surah } from '../entities/surah.entity';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class SurahsService {
  constructor(
    @InjectRepository(Surah)
    private surahRepository: Repository<Surah>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async findAll() {
    const cacheKey = 'surahs:all';
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const surahs = await this.surahRepository.find({
      order: { surahNumber: 'ASC' },
    });
    await this.cacheManager.set(cacheKey, surahs);
    return surahs;
  }

  async findByNumber(surahNumber: number) {
    const cacheKey = `surah:${surahNumber}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const surah = await this.surahRepository.findOne({
      where: { surahNumber },
    });
    if (surah) await this.cacheManager.set(cacheKey, surah);
    return surah;
  }

  async findByNumberWithVerses(surahNumber: number, page = 1, limit = 50) {
    const surah = await this.surahRepository.findOne({
      where: { surahNumber },
    });

    if (!surah) return null;

    const [verses, total] = await this.surahRepository
      .createQueryBuilder('surah')
      .leftJoinAndSelect('surah.verses', 'verse')
      .where('surah.surahNumber = :surahNumber', { surahNumber })
      .orderBy('verse.verseNumber', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      ...surah,
      verses: verses[0]?.verses || [],
      pagination: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit),
      },
    };
  }
}