import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Surah } from '../entities/surah.entity';
import { Juz } from '../entities/juz.entity';
import { QuranPage } from '../entities/page.entity';
import {
  DEFAULT_ANCHORS,
  buildJuzSpans,
  buildSurahStarts,
  resolveSurahForPage,
} from './mapping.algorithm';

@Injectable()
export class MappingService {
  private readonly logger = new Logger(MappingService.name);

  constructor(
    @InjectRepository(Surah) private surahRepo: Repository<Surah>,
    @InjectRepository(Juz) private juzRepo: Repository<Juz>,
    @InjectRepository(QuranPage) private pageRepo: Repository<QuranPage>,
  ) {}

  /**
   * Auto-remap Surah starts, Juz spans, and page.surahNumberStart / juzNumber
   * from whatever pages exist in DB. Safe to call after every mushaf page upload.
   */
  async remapAll(reason = 'manual'): Promise<{
    contentStart: number;
    contentEnd: number;
    surahsUpdated: number;
    pagesUpdated: number;
    reason: string;
  }> {
    const surahs = await this.surahRepo.find({ order: { surahNumber: 'ASC' } });
    if (surahs.length < 114) {
      this.logger.warn('Remap skipped: need 114 surahs seeded first');
      return { contentStart: 0, contentEnd: 0, surahsUpdated: 0, pagesUpdated: 0, reason };
    }

    const agg = await this.pageRepo
      .createQueryBuilder('p')
      .select('MIN(p.pageNumber)', 'min')
      .addSelect('MAX(p.pageNumber)', 'max')
      .where('p.imageUrl IS NOT NULL')
      .andWhere("p.imageUrl != ''")
      .getRawOne<{ min: string; max: string }>();

    const minPage = Number(agg?.min) || 1;
    const maxPage = Number(agg?.max) || 1;

    const knownStart = DEFAULT_ANCHORS[1] || 37;
    const knownEnd = DEFAULT_ANCHORS[114] || 1021;
    const contentStart =
      minPage <= knownStart && maxPage >= knownStart ? knownStart : Math.max(minPage, knownStart);
    // If DB includes many pages after the known Quran end (back matter), keep knownEnd.
    // If admin uploads a few pages past knownEnd, extend the map.
    const trailing = maxPage - knownEnd;
    const contentEnd = trailing >= 6 ? knownEnd : Math.max(knownEnd, Math.min(maxPage, knownEnd + 50));

    const anchors = { ...DEFAULT_ANCHORS };
    if (contentEnd > (DEFAULT_ANCHORS[114] || 0)) {
      anchors[114] = contentEnd;
    }
    for (const sn of Object.keys(anchors).map(Number)) {
      if (anchors[sn] < contentStart || anchors[sn] > contentEnd) delete anchors[sn];
    }
    anchors[1] = contentStart;
    anchors[114] = contentEnd;

    const { starts } = buildSurahStarts(
      surahs.map((s) => ({ surahNumber: s.surahNumber, versesCount: s.versesCount })),
      { contentStart, contentEnd, anchors },
    );

    let surahsUpdated = 0;
    for (const s of surahs) {
      const next = starts[s.surahNumber];
      if (s.startPageNumber !== next) {
        s.startPageNumber = next;
        surahsUpdated++;
      } else if (s.startPageNumber == null) {
        s.startPageNumber = next;
        surahsUpdated++;
      }
    }
    await this.surahRepo.save(surahs);

    const juzSpans = buildJuzSpans(contentStart, contentEnd);
    const juzRows: Juz[] = [];
    for (const span of juzSpans) {
      let row = await this.juzRepo.findOne({ where: { juzNumber: span.juzNumber } });
      if (!row) {
        row = this.juzRepo.create({
          juzNumber: span.juzNumber,
          startVerse: '',
          endVerse: '',
          startPageNumber: span.startPageNumber,
        });
      } else {
        row.startPageNumber = span.startPageNumber;
      }
      juzRows.push(row);
    }
    await this.juzRepo.save(juzRows);

    const pages = await this.pageRepo.find({ order: { pageNumber: 'ASC' } });
    let pagesUpdated = 0;
    for (const p of pages) {
      const n = p.pageNumber;
      let surah = 114;
      let juz = 30;
      if (n >= contentStart && n <= contentEnd) {
        surah = resolveSurahForPage(starts, n);
        const j = [...juzSpans].reverse().find((x) => x.startPageNumber <= n);
        juz = j?.juzNumber || 30;
      } else if (n < contentStart) {
        surah = 1;
        juz = 1;
      }
      if (p.surahNumberStart !== surah || p.juzNumber !== juz) {
        p.surahNumberStart = surah;
        p.juzNumber = juz;
        pagesUpdated++;
      }
    }
    if (pagesUpdated) await this.pageRepo.save(pages);

    this.logger.log(
      `Remap (${reason}): content ${contentStart}-${contentEnd}, surahs ${surahsUpdated}, pages ${pagesUpdated}`,
    );

    return { contentStart, contentEnd, surahsUpdated, pagesUpdated, reason };
  }
}
