import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TopicIndex } from '../entities/topic_index.entity';
import { QuranPage } from '../entities/page.entity';
import { Surah } from '../entities/surah.entity';
import { Juz } from '../entities/juz.entity';

const TOTAL_PAGES = 1027;

@Injectable()
export class InsightsService {
  constructor(
    @InjectRepository(TopicIndex) private topicRepo: Repository<TopicIndex>,
    @InjectRepository(QuranPage) private pageRepo: Repository<QuranPage>,
    @InjectRepository(Surah) private surahRepo: Repository<Surah>,
    @InjectRepository(Juz) private juzRepo: Repository<Juz>,
  ) {}

  /** Deterministic "ayah of the day" from date seed (no external AI needed). */
  async dailyFocus() {
    const day = Math.floor(Date.now() / 86400000);
    const surahs = await this.surahRepo.find({ order: { surahNumber: 'ASC' } });
    if (!surahs.length) {
      return { pageNumber: 1, title: 'Start your Mushaf journey', message: 'Open page 1 to begin.' };
    }
    const surah = surahs[day % surahs.length];
    const pageNumber = surah.startPageNumber || 1;
    return {
      pageNumber,
      surahNumber: surah.surahNumber,
      nameEnglish: surah.nameEnglish,
      nameArabic: surah.nameArabic,
      nameUrdu: surah.nameUrdu,
      title: 'Today’s focus',
      message: `Reflect on Surah ${surah.nameEnglish} today.`,
      dateKey: new Date().toISOString().slice(0, 10),
    };
  }

  async pageContext(pageNumber: number) {
    const page = await this.pageRepo.findOne({ where: { pageNumber } });
    const surahs = await this.surahRepo.find({ order: { startPageNumber: 'ASC' } });
    const juzList = await this.juzRepo.find({ order: { juzNumber: 'ASC' } });

    const surah = this.resolveSurah(surahs, pageNumber);
    const juz = this.resolveJuz(juzList, pageNumber, page?.juzNumber);
    const topics = await this.topicRepo.find({
      where: { pageNumber },
      take: 8,
      order: { topicNameUrdu: 'ASC' },
    });

    const nearbyTopics = await this.topicRepo
      .createQueryBuilder('t')
      .where('t.pageNumber BETWEEN :a AND :b', {
        a: Math.max(1, pageNumber - 5),
        b: Math.min(TOTAL_PAGES, pageNumber + 5),
      })
      .orderBy('t.pageNumber', 'ASC')
      .take(6)
      .getMany();
    nearbyTopics.sort(
      (a, b) => Math.abs(a.pageNumber - pageNumber) - Math.abs(b.pageNumber - pageNumber),
    );

    return {
      pageNumber,
      page,
      surah,
      juz,
      topicsOnPage: topics,
      nearbyTopics,
      progressPercent: Math.round((pageNumber / TOTAL_PAGES) * 100),
      remainingPages: TOTAL_PAGES - pageNumber,
      nextSurahPage: this.nextSurahStart(surahs, pageNumber),
      prevSurahPage: this.prevSurahStart(surahs, pageNumber),
    };
  }

  /** Algorithmic khatm planner: split remaining pages across N days. */
  khatmPlan(fromPage = 1, days = 30) {
    const start = Math.max(1, Math.min(TOTAL_PAGES, fromPage));
    const remaining = TOTAL_PAGES - start + 1;
    const d = Math.max(1, Math.min(365, days));
    const perDay = Math.ceil(remaining / d);
    const schedule: { day: number; from: number; to: number; pages: number }[] = [];
    let cursor = start;
    for (let i = 1; i <= d && cursor <= TOTAL_PAGES; i++) {
      const end = Math.min(TOTAL_PAGES, cursor + perDay - 1);
      schedule.push({ day: i, from: cursor, to: end, pages: end - cursor + 1 });
      cursor = end + 1;
    }
    return { fromPage: start, days: d, pagesPerDay: perDay, remaining, schedule };
  }

  async smartSuggest(currentPage = 1) {
    const ctx = await this.pageContext(currentPage);
    const focus = await this.dailyFocus();
    const plan = this.khatmPlan(currentPage, 30);
    return {
      continueAt: currentPage,
      nextPage: Math.min(TOTAL_PAGES, currentPage + 1),
      jumpToSurahStart: ctx.surah?.startPageNumber || currentPage,
      dailyFocus: focus,
      relatedTopics: ctx.nearbyTopics.slice(0, 4),
      khatmHint: {
        pagesPerDay: plan.pagesPerDay,
        todayTarget: plan.schedule[0] || null,
      },
      context: {
        surah: ctx.surah,
        juz: ctx.juz,
        progressPercent: ctx.progressPercent,
      },
    };
  }

  private resolveSurah(surahs: Surah[], pageNumber: number) {
    const sorted = surahs
      .filter((s) => s.startPageNumber != null)
      .sort((a, b) => (a.startPageNumber || 0) - (b.startPageNumber || 0));
    let match = sorted[0] || null;
    for (const s of sorted) {
      if ((s.startPageNumber || 0) <= pageNumber) match = s;
      else break;
    }
    return match;
  }

  private resolveJuz(juzList: Juz[], pageNumber: number, pageJuz?: number | null) {
    if (pageJuz) {
      return juzList.find((j) => j.juzNumber === pageJuz) || null;
    }
    const sorted = juzList
      .filter((j) => j.startPageNumber != null)
      .sort((a, b) => (a.startPageNumber || 0) - (b.startPageNumber || 0));
    let match = sorted[0] || null;
    for (const j of sorted) {
      if ((j.startPageNumber || 0) <= pageNumber) match = j;
      else break;
    }
    return match;
  }

  private nextSurahStart(surahs: Surah[], pageNumber: number) {
    const next = surahs
      .filter((s) => (s.startPageNumber || 0) > pageNumber)
      .sort((a, b) => (a.startPageNumber || 0) - (b.startPageNumber || 0))[0];
    return next?.startPageNumber ?? null;
  }

  private prevSurahStart(surahs: Surah[], pageNumber: number) {
    const prev = surahs
      .filter((s) => (s.startPageNumber || 0) < pageNumber)
      .sort((a, b) => (b.startPageNumber || 0) - (a.startPageNumber || 0))[0];
    return prev?.startPageNumber ?? null;
  }
}
