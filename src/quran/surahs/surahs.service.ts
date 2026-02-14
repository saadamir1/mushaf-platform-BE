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

  async findByNumberWithVerses(surahNumber: number) {
    return await this.surahRepository.findOne({
      where: { surahNumber },
      relations: ['verses'],
    });
  }
}