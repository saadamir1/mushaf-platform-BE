/**
 * Piecewise Surah map: fixed visual anchors + verse-weighted fill.
 * Shared by scripts and runtime auto-remap after page upload.
 */

export const DEFAULT_ANCHORS: Record<number, number> = {
  1: 37,
  2: 38,
  3: 115,
  4: 159,
  40: 800,
  86: 1000,
  112: 1020,
  114: 1021,
};

export function allocatePages(verseCounts: number[], totalPages: number): number[] {
  const n = verseCounts.length;
  if (n === 0) return [];
  if (totalPages <= 0) return verseCounts.map(() => 0);
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

export function buildSurahStarts(
  surahs: Array<{ surahNumber: number; versesCount: number }>,
  opts: {
    contentStart: number;
    contentEnd: number;
    anchors?: Record<number, number>;
  },
): { starts: number[]; method: string[] } {
  const anchors = { ...(opts.anchors || DEFAULT_ANCHORS) };
  const { contentStart, contentEnd } = opts;

  // Drop anchors outside content; force S1 at contentStart if needed
  for (const sn of Object.keys(anchors).map(Number)) {
    if (anchors[sn] < contentStart || anchors[sn] > contentEnd) {
      delete anchors[sn];
    }
  }
  if (!anchors[1]) anchors[1] = contentStart;
  if (!anchors[114]) anchors[114] = contentEnd;

  const starts = new Array(115).fill(0) as number[];
  const method = new Array(115).fill('') as string[];
  const byNum = new Map(surahs.map((s) => [s.surahNumber, s]));

  const anchorList = Object.entries(anchors)
    .map(([k, v]) => ({ sn: Number(k), page: v }))
    .filter((a) => a.sn >= 1 && a.sn <= 114)
    .sort((a, b) => a.sn - b.sn);

  for (const a of anchorList) {
    starts[a.sn] = a.page;
    method[a.sn] = 'visual-anchor';
  }

  for (let ai = 0; ai < anchorList.length; ai++) {
    const cur = anchorList[ai];
    const next = anchorList[ai + 1];
    const fromSn = cur.sn;
    const toSn = next ? next.sn - 1 : 114;
    const rangeStart = cur.page;
    const rangeEnd = next ? next.page - 1 : contentEnd;
    const surahNums: number[] = [];
    for (let sn = fromSn; sn <= toSn; sn++) surahNums.push(sn);
    const pagesAvail = Math.max(0, rangeEnd - rangeStart + 1);
    const verses = surahNums.map((sn) => byNum.get(sn)?.versesCount || 1);
    const alloc = allocatePages(verses, pagesAvail);
    let cursor = rangeStart;
    for (let i = 0; i < surahNums.length; i++) {
      const sn = surahNums[i];
      if (anchors[sn] != null) {
        starts[sn] = anchors[sn];
        cursor = anchors[sn];
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

  for (let sn = 2; sn <= 114; sn++) {
    if (starts[sn] < starts[sn - 1]) {
      starts[sn] = starts[sn - 1];
      method[sn] += '+mono-fix';
    }
    if (starts[sn] < contentStart) starts[sn] = contentStart;
    if (starts[sn] > contentEnd) starts[sn] = contentEnd;
  }
  if (starts[1] < contentStart) starts[1] = contentStart;

  return { starts, method };
}

export function buildJuzSpans(contentStart: number, contentEnd: number) {
  const span = contentEnd - contentStart + 1;
  const juzSize = Math.ceil(span / 30);
  return Array.from({ length: 30 }, (_, i) => {
    const start = contentStart + i * juzSize;
    const end = Math.min(contentEnd, start + juzSize - 1);
    return { juzNumber: i + 1, startPageNumber: start, endPageNumber: end };
  });
}

export function resolveSurahForPage(starts: number[], pageNumber: number): number {
  let surah = 1;
  for (let sn = 1; sn <= 114; sn++) {
    if (starts[sn] <= pageNumber) surah = sn;
    else break;
  }
  return surah;
}
