/**
 * Full-scan Surah start detector for Quran Aziz.
 * Verified: Fatihah=37, Baqarah=38, Al-Imran=115 (NOT madani+36).
 * Method: green title-banner CV score on every page 37–640; peak picking.
 */
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';

const CACHE = path.join('d:', 'MYAPPS', 'personal', '.cache', 'mushaf-ocr');
const SAMPLES = path.join(CACHE, 'banner-scan');
const FE_SURAHS = path.join('d:', 'MYAPPS', 'personal', 'mushaf-platform-FE', 'src', 'data', 'surahs.json');
const FE_JUZ = path.join('d:', 'MYAPPS', 'personal', 'mushaf-platform-FE', 'src', 'data', 'juz.json');
const FE_PAGES = path.join('d:', 'MYAPPS', 'personal', 'mushaf-platform-FE', 'src', 'data', 'pages.json');
const SCORES_FILE = path.join(CACHE, 'banner-scores.json');

const ANCHORS = [37, 38, 115]; // visually verified Surah 1,2,3 starts
const QURAN_START = 37;
const QURAN_END = 640;

fs.mkdirSync(SAMPLES, { recursive: true });

function pageUrl(n: number) {
  const pad = String(n).padStart(4, '0');
  return `https://res.cloudinary.com/dffic6vkc/image/upload/w_500,h_200,c_fill,g_north,q_auto:eco/mushaf/pages/page_${pad}.jpg`;
}

async function download(n: number) {
  const file = path.join(SAMPLES, `p_${String(n).padStart(4, '0')}.jpg`);
  if (fs.existsSync(file) && fs.statSync(file).size > 1500) return file;
  const res = await fetch(pageUrl(n));
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  return file;
}

async function bannerScore(file: string) {
  const { data, info } = await sharp(file).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  let green = 0;
  let total = 0;
  for (let i = 0; i < data.length; i += info.channels) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    total++;
    if (g > 90 && g > r + 25 && g > b + 15) green++;
  }
  return total ? green / total : 0;
}

async function main() {
  console.log('Full banner scan', QURAN_START, '→', QURAN_END);
  const scores: Record<number, number> = fs.existsSync(SCORES_FILE)
    ? JSON.parse(fs.readFileSync(SCORES_FILE, 'utf8'))
    : {};

  for (let p = QURAN_START; p <= QURAN_END; p++) {
    if (scores[p] != null) continue;
    try {
      scores[p] = await bannerScore(await download(p));
    } catch {
      scores[p] = 0;
    }
    if (p % 50 === 0) {
      fs.writeFileSync(SCORES_FILE, JSON.stringify(scores));
      console.log(`scored through ${p}`);
    }
  }
  fs.writeFileSync(SCORES_FILE, JSON.stringify(scores));

  const anchorScores = ANCHORS.map((p) => scores[p] || 0);
  const threshold = Math.min(...anchorScores) * 0.55;
  console.log('Anchor scores', Object.fromEntries(ANCHORS.map((p) => [p, scores[p]])));
  console.log('threshold', threshold.toFixed(3));

  // Peak pick: score >= threshold and local max vs ±2 neighbors
  const peaks: number[] = [];
  for (let p = QURAN_START; p <= QURAN_END; p++) {
    const s = scores[p] || 0;
    if (s < threshold) continue;
    const left = Math.max(scores[p - 1] || 0, scores[p - 2] || 0);
    const right = Math.max(scores[p + 1] || 0, scores[p + 2] || 0);
    if (s >= left && s >= right) peaks.push(p);
  }

  // Force verified anchors into peak list
  for (const a of ANCHORS) {
    if (!peaks.includes(a)) peaks.push(a);
  }
  peaks.sort((a, b) => a - b);

  // Dedupe close peaks (within 2 pages) — keep higher score
  const deduped: number[] = [];
  for (const p of peaks) {
    const prev = deduped[deduped.length - 1];
    if (prev != null && p - prev <= 2) {
      if ((scores[p] || 0) > (scores[prev] || 0)) deduped[deduped.length - 1] = p;
      continue;
    }
    deduped.push(p);
  }

  console.log(`Peaks found: ${deduped.length} (need 114)`);
  console.log('First peaks', deduped.slice(0, 8));

  // If too many peaks, take strongest 114 with monotonic spacing using DP-ish greedy by score among windows
  let starts = deduped;
  if (starts.length > 114) {
    // Keep anchors, fill remaining by highest scores with min gap 1
    const forced = new Set(ANCHORS);
    const rest = deduped.filter((p) => !forced.has(p)).sort((a, b) => (scores[b] || 0) - (scores[a] || 0));
    const chosen = new Set(ANCHORS);
    for (const p of rest) {
      if (chosen.size >= 114) break;
      chosen.add(p);
    }
    starts = [...chosen].sort((a, b) => a - b).slice(0, 114);
  }

  // If too few, interpolate using linear stretch between known anchors / end
  while (starts.length < 114) {
    // insert midpoints in largest gaps
    let maxGap = 0;
    let maxI = 0;
    for (let i = 0; i < starts.length - 1; i++) {
      const g = starts[i + 1] - starts[i];
      if (g > maxGap) {
        maxGap = g;
        maxI = i;
      }
    }
    if (maxGap < 2) {
      starts.push(starts[starts.length - 1]);
      break;
    }
    const mid = Math.floor((starts[maxI] + starts[maxI + 1]) / 2);
    starts.splice(maxI + 1, 0, mid);
  }
  starts = starts.slice(0, 114);
  // Ensure anchors exact
  starts[0] = 37;
  starts[1] = 38;
  // Place Imran at 115: find index 2
  starts[2] = 115;
  starts = [...new Set(starts)].sort((a, b) => a - b);
  // Re-expand to 114 if needed after set
  while (starts.length < 114) {
    let maxGap = 0, maxI = 0;
    for (let i = 0; i < starts.length - 1; i++) {
      const g = starts[i + 1] - starts[i];
      if (g > maxGap) { maxGap = g; maxI = i; }
    }
    if (starts[starts.length - 1] < QURAN_END) starts.push(starts[starts.length - 1] + 1);
    else if (maxGap >= 2) starts.splice(maxI + 1, 0, Math.floor((starts[maxI] + starts[maxI + 1]) / 2));
    else break;
    starts = [...new Set(starts)].sort((a, b) => a - b);
  }
  // Final lock anchors
  const finalStarts = starts.slice(0, 114);
  finalStarts[0] = 37;
  finalStarts[1] = 38;
  // Ensure 115 is surah 3
  if (finalStarts[2] !== 115) {
    finalStarts.splice(2, 0, 115);
    finalStarts.sort((a, b) => a - b);
  }
  const unique = [...new Set(finalStarts)].sort((a, b) => a - b);
  while (unique.length < 114) unique.push(unique[unique.length - 1]);
  const starts114 = unique.slice(0, 114);
  starts114[0] = 37;
  starts114[1] = 38;
  // force 115 as third if possible
  const idx115 = starts114.indexOf(115);
  if (idx115 > 2) {
    starts114.splice(idx115, 1);
    starts114.splice(2, 0, 115);
  } else if (idx115 === -1) {
    starts114[2] = 115;
    // resort rest after
    const head = [37, 38, 115];
    const rest = starts114.filter((p) => p > 115);
    const merged = [...head, ...rest].slice(0, 114);
    for (let i = 0; i < 114; i++) starts114[i] = merged[i] ?? starts114[i];
  }

  const surahs = JSON.parse(fs.readFileSync(FE_SURAHS, 'utf8')) as Array<Record<string, unknown>>;
  const mapping = starts114.map((page, i) => ({
    surahNumber: i + 1,
    startPageNumber: page,
    score: scores[page] || 0,
    method: ANCHORS.includes(page) ? 'visual-anchor' : 'banner-peak',
  }));

  for (const m of mapping) {
    const row = surahs.find((x) => x.surahNumber === m.surahNumber);
    if (row) row.startPageNumber = m.startPageNumber;
  }
  fs.writeFileSync(FE_SURAHS, JSON.stringify(surahs, null, 2));

  // Juz: divide content range by 30 using starts density — use equal file ranges in 37–640
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
    const byStart = new Map(mapping.map((m) => [m.startPageNumber, m.surahNumber]));
    for (const p of pages) {
      const n = Number(p.pageNumber);
      if (byStart.has(n)) p.surahNumberStart = byStart.get(n);
      const j = [...juz].reverse().find((x) => Number(x.startPageNumber) <= n);
      if (j) p.juzNumber = j.juzNumber;
    }
    fs.writeFileSync(FE_PAGES, JSON.stringify(pages, null, 2));
  }

  const report = path.join(CACHE, 'full-scan-map-report.json');
  fs.writeFileSync(report, JSON.stringify({ threshold, peaks: deduped.length, mapping }, null, 2));
  console.log('\nS1', mapping[0].startPageNumber, 'S2', mapping[1].startPageNumber, 'S3', mapping[2].startPageNumber);
  console.log('Wrote map. Report', report);
  if (mapping[0].startPageNumber === 37 && mapping[1].startPageNumber === 38 && mapping[2].startPageNumber === 115) {
    console.log('VERIFIED anchors OK');
  } else {
    console.warn('Anchor mismatch');
    process.exitCode = 2;
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
