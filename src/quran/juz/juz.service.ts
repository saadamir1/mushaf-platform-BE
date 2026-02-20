import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Juz } from '../entities/juz.entity';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class JuzService {
  constructor(
    @InjectRepository(Juz)
    private juzRepository: Repository<Juz>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async findAll() {
    const cacheKey = 'juz:all';
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const juz = await this.juzRepository.find({
      order: { juzNumber: 'ASC' },
    });
    await this.cacheManager.set(cacheKey, juz);
    return juz;
  }

  async findByNumber(juzNumber: number) {
    const cacheKey = `juz:${juzNumber}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const juz = await this.juzRepository.findOne({
      where: { juzNumber },
    });

    if (!juz) {
      throw new NotFoundException(`Juz ${juzNumber} not found`);
    }

    await this.cacheManager.set(cacheKey, juz);
    return juz;
  }

  async getJuzWithVerses(juzNumber: number) {
    // This will be enhanced when you have the verses service integrated
    const juz = await this.findByNumber(juzNumber);
    
    return {
      juz,
      // In future: fetch verses using juz.startVerseId and juz.endVerseId
      // verses: await this.versesService.getVerseRange(juz.startVerseId, juz.endVerseId)
    };
  }
}