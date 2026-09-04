import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuranPage } from '../entities/page.entity';
import { Surah } from '../entities/surah.entity';
import { Juz } from '../entities/juz.entity';
import { TopicIndex } from '../entities/topic_index.entity';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { MappingService } from '../mapping/mapping.service';

@Injectable()
export class PagesService {
  constructor(
    @InjectRepository(QuranPage)
    private pageRepository: Repository<QuranPage>,
    @InjectRepository(Surah)
    private surahRepository: Repository<Surah>,
    @InjectRepository(Juz)
    private juzRepository: Repository<Juz>,
    @InjectRepository(TopicIndex)
    private topicRepository: Repository<TopicIndex>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private mappingService: MappingService,
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

  async updatePageImage(pageNumber: number, imageUrl: string) {
    const page = (await this.findByNumber(pageNumber)) as QuranPage;
    page.imageUrl = imageUrl;
    const saved = await this.pageRepository.save(page);
    await this.cacheManager.del(`page:${pageNumber}`);
    const mapping = await this.mappingService.remapAll(`update-image:${pageNumber}`);
    return { page: saved, mapping };
  }

  /** Create or replace a mushaf page image, then auto-remap Surah/Juz/pages. */
  async upsertMushafPage(pageNumber: number | null | undefined, imageUrl: string) {
    let num = pageNumber != null && pageNumber > 0 ? Math.floor(pageNumber) : 0;
    if (!num) {
      const agg = await this.pageRepository
        .createQueryBuilder('p')
        .select('MAX(p.pageNumber)', 'max')
        .getRawOne<{ max: string }>();
      num = (Number(agg?.max) || 0) + 1;
    }

    let page = await this.pageRepository.findOne({ where: { pageNumber: num } });
    if (!page) {
      page = this.pageRepository.create({
        pageNumber: num,
        imageUrl,
        startVerse: '',
        endVerse: '',
        juzNumber: null as unknown as number,
        surahNumberStart: null as unknown as number,
      });
    } else {
      page.imageUrl = imageUrl;
    }
    const saved = await this.pageRepository.save(page);
    await this.cacheManager.del(`page:${num}`);
    const mapping = await this.mappingService.remapAll(`upload-page:${num}`);
    return { page: saved, mapping };
  }

  async remapIndexes() {
    return this.mappingService.remapAll('api-remap');
  }

  async findBySurahStart(surahNumber: number) {
    const surah = await this.surahRepository.findOne({ where: { surahNumber } });
    if (surah?.startPageNumber) {
      return this.findByNumber(surah.startPageNumber);
    }

    const page = await this.pageRepository.findOne({
      where: { surahNumberStart: surahNumber },
    });
    if (!page) {
      throw new NotFoundException(`No page found for Surah ${surahNumber}`);
    }
    return page;
  }

  async findByJuzStart(juzNumber: number) {
    const juz = await this.juzRepository.findOne({ where: { juzNumber } });
    if (juz?.startPageNumber) {
      return this.findByNumber(juz.startPageNumber);
    }

    const page = await this.pageRepository.findOne({
      where: { juzNumber },
      order: { pageNumber: 'ASC' },
    });
    if (!page) {
      throw new NotFoundException(`No page found for Juz ${juzNumber}`);
    }
    return page;
  }

  /**
   * Scanned pages are images — text is NOT inside the PNG.
   * Mapping layers: Surah.startPageNumber + Juz index + Topic keywords + optional hotspots.
   */
  async getPageMapping(pageNumber: number) {
    const page = await this.pageRepository.findOne({ where: { pageNumber } });
    const surahs = await this.surahRepository.find({ order: { startPageNumber: 'ASC' } });
    const juzList = await this.juzRepository.find({ order: { juzNumber: 'ASC' } });
    const keywords = await this.topicRepository.find({
      where: { pageNumber },
      take: 12,
      order: { topicNameUrdu: 'ASC' },
    });

    const surah = this.resolveByStartPage(surahs, pageNumber);
    const juz =
      (page?.juzNumber && juzList.find((j) => j.juzNumber === page.juzNumber)) ||
      this.resolveByStartPage(juzList, pageNumber) ||
      this.estimateJuz(pageNumber);

    return {
      pageNumber,
      imageUrl: page?.imageUrl || null,
      startVerse: page?.startVerse || null,
      endVerse: page?.endVerse || null,
      mappingNote:
        'Page is a scanned image. Surah/Juz/keywords come from indexes, not OCR of the image.',
      surah: surah
        ? {
            surahNumber: surah.surahNumber,
            nameEnglish: surah.nameEnglish,
            nameArabic: surah.nameArabic,
            nameUrdu: surah.nameUrdu,
            startPageNumber: surah.startPageNumber,
            revelationType: surah.revelationType,
          }
        : null,
      juz: juz
        ? {
            juzNumber: juz.juzNumber,
            startPageNumber: juz.startPageNumber ?? null,
            startVerse: juz.startVerse ?? null,
            endVerse: juz.endVerse ?? null,
            estimated: !!(juz as { estimated?: boolean }).estimated,
          }
        : null,
      keywords: keywords.map((k) => ({
        id: k.id,
        label: k.topicNameUrdu,
        english: k.topicNameEnglish,
        category: k.category,
        pageNumber: k.pageNumber,
      })),
      progressPercent: Math.round((pageNumber / 1027) * 100),
    };
  }

  /** Fallback when Juz rows lack startPageNumber (common for custom 1027-page Mushaf). */
  private estimateJuz(pageNumber: number) {
    const size = Math.ceil(1027 / 30);
    const juzNumber = Math.min(30, Math.max(1, Math.ceil(pageNumber / size)));
    const startPageNumber = (juzNumber - 1) * size + 1;
    return {
      juzNumber,
      startPageNumber,
      startVerse: null,
      endVerse: null,
      estimated: true,
    };
  }

  private resolveByStartPage<T extends { startPageNumber?: number | null }>(
    items: T[],
    pageNumber: number,
  ): T | null {
    const sorted = items
      .filter((i) => i.startPageNumber != null)
      .sort((a, b) => (a.startPageNumber || 0) - (b.startPageNumber || 0));
    let match: T | null = sorted[0] || null;
    for (const item of sorted) {
      if ((item.startPageNumber || 0) <= pageNumber) match = item;
      else break;
    }
    return match;
  }
}
