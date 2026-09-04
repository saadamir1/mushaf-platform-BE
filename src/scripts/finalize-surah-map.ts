/**
 * Professional Surah↔page map for Quran Aziz (Urdu interlinear, ~1027 Cloudinary files).
 *
 * Methods evaluated:
 *  1) Full-page OCR (Tesseract) — fails on calligraphy / interlinear → rejected
 *  2) Green title-banner CV peaks alone — false positives mid-ayah → advisory only
 *  3) Madani 604 + offset — wrong edition layout → rejected
 *  4) Visual anchors (verified page crops) + piecewise verse-weighted fill — SELECTED
 *  5) CSV import (map:import) — for future human corrections
 *
 * Verified FILE page anchors (Cloudinary page_NNNN):
 *  S1  Al-Fatihah → 37
 *  S2  Al-Baqarah → 38
 *  S3  Al-Imran   → 115
 *  S4  An-Nisa    → 159   (Imran ends ~158)
 *  S40 Ghafir     → 800
 *  S86 At-Tariq   → 1000
 *  S112 Al-Ikhlas → 1020
 *  S114 An-Nas    → 1021
 * Content end → 1021 (1022+ back matter / blanks)
 */
import * as fs from 'fs';
import * as path from 'path';

const CACHE = path.join('d:', 'MYAPPS', 'personal', '.cache', 'mushaf-ocr');
const FE_DATA = path.join('d:', 'MYAPPS', 'personal', 'mushaf-platform-FE', 'src', 'data');
const FE_SURAHS = path.join(FE_DATA, 'surahs.json');
const FE_JUZ = path.join(FE_DATA, 'juz.json');
const FE_PAGES = path.join(FE_DATA, 'pages.json');

const QURAN_START = 37;
const QURAN_END = 1021;

/** surahNumber → verified file page */
const ANCHORS: Record<number, number> = {
  1: 37,
  2: 38,
  3: 115,
  4: 159,
  40: 800,
  86: 1000,
  112: 1020,
  114: 1021,
};

function allocatePages(verseCounts: number[], totalPages: number): number[] {
  const n = verseCounts.length;
  if (n === 0) return [];
  if (totalPages <= 0) return verseCounts.map(() => 0);
  // Allow 0-page surahs only when pages are fewer than surahs (shared pages)
  const totalVerses = verseCounts.reduce((a, b) => a + b, 0) || n;
  if (totalPages >= n) {
    const raw = verseCounts.map((v) => (v / totalVerses) * totalPages);
    const floors = raw.map((x) => Math.max(1, Math.floor(x)));
    let sum = floors.reduce((a, b) => a + b, 0);
    while (sum > totalPages) {
      let best = -1;
      let bestVal = 1;
      for (let i = 0; i < n; i++) {
        if (floors[i] > bestVal) {
          bestVal = floors[i];
          best = i;
        }
      }
      if (best < 0) break;
      floors[best]--;
      sum--;
    }
    const fracs = raw
      .map((x, i) => ({ i, frac: x - Math.floor(x) }))
      .sort((a, b) => b.frac - a.frac);
    let left = totalPages - sum;
    for (const { i } of fracs) {
      if (left <= 0) break;
      floors[i]++;
      left--;
    }
    while (left > 0) {
      floors[n - 1]++;
      left--;
    }
    return floors;
  }
  // Fewer pages than surahs: pack by verse weight; many get 0 (share predecessor page)
  const raw = verseCounts.map((v) => (v / totalVerses) * totalPages);
  const floors = raw.map((x) => Math.floor(x));
  let sum = floors.reduce((a, b) => a + b, 0);
  const fracs = raw
    .map((x, i) => ({ i, frac: x - Math.floor(x) }))
    .sort((a, b) => b.frac - a.frac);
  let left = totalPages - sum;
  for (const { i } of fracs) {
    if (left <= 0) break;
    floors[i]++;
    left--;
  }
  return floors;
}

function buildStarts(surahs: Array<{ surahNumber: number; versesCount: number }>) {
  const byNum = new Map(surahs.map((s) => [s.surahNumber, s]));
  const starts = new Array(115).fill(0) as number[];
  const method = new Array(115).fill('') as string[];

  const anchorList = Object.entries(ANCHORS)
    .map(([k, v]) => ({ sn: Number(k), page: v }))
    .sort((a, b) => a.sn - b.sn);

  for (const a of anchorList) {
    starts[a.sn] = a.page;
    method[a.sn] = 'visual-anchor';
  }

  // Fill between consecutive anchors (and trailing to end)
  for (let ai = 0; ai < anchorList.length; ai++) {
    const cur = anchorList[ai];
    const next = anchorList[ai + 1];
    const fromSn = cur.sn;
    const toSn = next ? next.sn - 1 : 114;
    const rangeStart = cur.page;
    const rangeEnd = next ? next.page - 1 : QURAN_END;
    const surahNums: number[] = [];
    for (let sn = fromSn; sn <= toSn; sn++) surahNums.push(sn);
    const pagesAvail = Math.max(0, rangeEnd - rangeStart + 1);
    const verses = surahNums.map((sn) => byNum.get(sn)?.versesCount || 1);
    const alloc = allocatePages(verses, pagesAvail);
    let cursor = rangeStart;
    for (let i = 0; i < surahNums.length; i++) {
      const sn = surahNums[i];
      if (ANCHORS[sn] != null) {
        starts[sn] = ANCHORS[sn];
        cursor = ANCHORS[sn];
      } else {
        starts[sn] = Math.min(cursor, rangeEnd);
        method[sn] = 'piecewise-verse-weighted';
      }
      const span = alloc[i];
      if (i < surahNums.length - 1) {
        const nextCursor = span > 0 ? starts[sn] + span : starts[sn];
        cursor = Math.min(nextCursor, rangeEnd);
      }
    }
  }

  // Explicit short-surah tail
  starts[112] = 1020;
  starts[113] = 1020; // Falaq shares / follows Ikhlas on same leaf region
  starts[114] = 1021;
  method[112] = 'visual-anchor';
  method[113] = 'visual-anchor-adjacent';
  method[114] = 'visual-anchor';

  // Monotonic non-decreasing (shared pages allowed)
  for (let sn = 2; sn <= 114; sn++) {
    if (starts[sn] < starts[sn - 1]) {
      starts[sn] = starts[sn - 1];
      method[sn] += '+mono-fix';
    }
  }
  for (let sn = 1; sn <= 114; sn++) {
    if (starts[sn] < QURAN_START) starts[sn] = QURAN_START;
    if (starts[sn] > QURAN_END) starts[sn] = QURAN_END;
  }

  return { starts, method };
}

function main() {
  fs.mkdirSync(CACHE, { recursive: true });
  const surahs = JSON.parse(fs.readFileSync(FE_SURAHS, 'utf8')) as Array<{
    surahNumber: number;
    versesCount: number;
    startPageNumber?: number;
    nameEnglish?: string;
  }>;

  const { starts, method } = buildStarts(surahs);

  const issues: string[] = [];
  for (const [sn, page] of Object.entries(ANCHORS)) {
    if (starts[Number(sn)] !== page) issues.push(`anchor S${sn} want ${page} got ${starts[Number(sn)]}`);
  }
  for (let sn = 2; sn <= 114; sn++) {
    if (starts[sn] < starts[sn - 1]) issues.push(`decrease at ${sn}`);
  }

  const mapping = surahs.map((s) => {
    const sn = s.surahNumber;
    s.startPageNumber = starts[sn];
    const next = sn < 114 ? starts[sn + 1] : QURAN_END + 1;
    return {
      surahNumber: sn,
      nameEnglish: s.nameEnglish,
      startPageNumber: starts[sn],
      pages: Math.max(1, next - starts[sn]),
      versesCount: s.versesCount,
      method: method[sn],
    };
  });

  fs.writeFileSync(FE_SURAHS, JSON.stringify(surahs, null, 2));

  const span = QURAN_END - QURAN_START + 1;
  const juzSize = Math.ceil(span / 30);
  const juz = Array.from({ length: 30 }, (_, i) => {
    const start = QURAN_START + i * juzSize;
    const end = Math.min(QURAN_END, start + juzSize - 1);
    return {
      id: i + 1,
      juzNumber: i + 1,
      startVerse: null,
      endVerse: null,
      startPageNumber: start,
      endPageNumber: end,
      method: 'content-span/30',
      createdAt: new Date().toISOString(),
    };
  });
  fs.writeFileSync(FE_JUZ, JSON.stringify(juz, null, 2));

  if (fs.existsSync(FE_PAGES)) {
    const pages = JSON.parse(fs.readFileSync(FE_PAGES, 'utf8')) as Array<Record<string, unknown>>;
    for (const p of pages) {
      const n = Number(p.pageNumber);
      if (n < QURAN_START || n > QURAN_END) {
        if (n > QURAN_END) p.surahNumberStart = 114;
        continue;
      }
      let surah = 1;
      for (let sn = 1; sn <= 114; sn++) {
        if (starts[sn] <= n) surah = sn;
        else break;
      }
      p.surahNumberStart = surah;
      const j = [...juz].reverse().find((x) => Number(x.startPageNumber) <= n);
      if (j) p.juzNumber = j.juzNumber;
    }
    fs.writeFileSync(FE_PAGES, JSON.stringify(pages, null, 2));
  }

  const report = {
    method: 'visual-anchors + piecewise verse-weighted (largest-remainder)',
    anchors: ANCHORS,
    contentRange: [QURAN_START, QURAN_END],
    issues,
    mapping,
    checkpoints: {
      S1: starts[1],
      S2: starts[2],
      S3: starts[3],
      S4: starts[4],
      S40: starts[40],
      S86: starts[86],
      S112: starts[112],
      S113: starts[113],
      S114: starts[114],
    },
  };
  fs.writeFileSync(path.join(CACHE, 'final-map.json'), JSON.stringify(report, null, 2));

  console.log('Checkpoints', report.checkpoints);
  console.log('issues:', issues.length ? issues : 'none');
  if (issues.length) process.exitCode = 2;
  else console.log('OK — map written (content 37–1021)');
}

main();
