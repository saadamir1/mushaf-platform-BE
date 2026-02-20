import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Verse } from '../entities/verse.entity';
import { Surah } from '../entities/surah.entity';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Verse)
    private verseRepository: Repository<Verse>,
    @InjectRepository(Surah)
    private surahRepository: Repository<Surah>,
  ) {}

  async searchVerses(query: string, limit = 50) {
    if (!query || query.trim().length < 2) {
      return {
        query,
        results: [],
        count: 0,
        message: 'Query must be at least 2 characters',
      };
    }

    // Sanitize input to prevent SQL injection
    const sanitizedQuery = query.replace(/[%_]/g, '\\$&');

    const verses = await this.verseRepository
      .createQueryBuilder('verse')
      .leftJoinAndSelect('verse.surah', 'surah')
      .where('verse.textArabic ILIKE :query', { query: `%${sanitizedQuery}%` })
      .orWhere('verse.textUrdu ILIKE :query', { query: `%${sanitizedQuery}%` })
      .orWhere('verse.tafseerUrdu ILIKE :query', { query: `%${sanitizedQuery}%` })
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

  async searchSurahs(query: string) {
    if (!query || query.trim().length < 2) {
      return {
        query,
        results: [],
        count: 0,
        message: 'Query must be at least 2 characters',
      };
    }

    // Sanitize input
    const sanitizedQuery = query.replace(/[%_]/g, '\\$&');

    const surahs = await this.surahRepository
      .createQueryBuilder('surah')
      .where('surah.nameArabic ILIKE :query', { query: `%${sanitizedQuery}%` })
      .orWhere('surah.nameEnglish ILIKE :query', { query: `%${sanitizedQuery}%` })
      .orWhere('surah.nameUrdu ILIKE :query', { query: `%${sanitizedQuery}%` })
      .orWhere('surah.descriptionUrdu ILIKE :query', { query: `%${sanitizedQuery}%` })
      .orderBy('surah.surahNumber', 'ASC')
      .getMany();

    return {
      query,
      results: surahs,
      count: surahs.length,
    };
  }

  async searchAll(query: string) {
    const [verseResults, surahResults] = await Promise.all([
      this.searchVerses(query, 20),
      this.searchSurahs(query),
    ]);

    return {
      query,
      surahs: surahResults,
      verses: verseResults,
      totalResults: surahResults.count + verseResults.count,
    };
  }
}