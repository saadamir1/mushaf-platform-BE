import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Surah } from '../entities/surah.entity';

@Injectable()
export class SurahsService {
  constructor(
    @InjectRepository(Surah)
    private surahRepository: Repository<Surah>,
  ) {}

  async findAll() {
    return await this.surahRepository.find({
      order: { surahNumber: 'ASC' },
    });
  }

  async findByNumber(surahNumber: number) {
    return await this.surahRepository.findOne({
      where: { surahNumber },
    });
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