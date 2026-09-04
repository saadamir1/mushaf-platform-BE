/**
 * Pilot: OCR Mushaf INDEX pages (usually 1–40), not calligraphy body pages.
 * Looks for "SurahName … pageNumber" patterns. Free Tesseract.
 * Run: npx tsx src/scripts/pilot-ocr-index.ts
 */
import * as fs from 'fs';
import * as path from 'path';
import { createWorker } from 'tesseract.js';

const CACHE = path.join('d:', 'MYAPPS', 'personal', '.cache', 'mushaf-ocr');
const FE_SURAHS = path.join('d:', 'MYAPPS', 'personal', 'mushaf-platform-FE', 'src', 'data', 'surahs.json');
fs.mkdirSync(CACHE, { recursive: true });

const SURAHS = JSON.parse(fs.readFileSync(FE_SURAHS, 'utf8'));

function normalizeAr(s: string) {
  return (s || '')
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/\s+/g, '')
    .trim();
}

function pageUrl(n: number) {
  const padded = String(n).padStart(4, '0');
  // Full page for index (not just header crop)
  return `https://res.cloudinary.com/dffic6vkc/image/upload/w_1200,q_auto:eco/mushaf/pages/page_${padded}.jpg`;
}

async function main() {
  console.log('Index-page OCR pilot (pages 1–20)…');
  const worker = await createWorker(['ara', 'eng'], 1, {
    cachePath: path.join('d:', 'MYAPPS', 'personal', '.cache', 'tesseract'),
    logger: () => undefined,
  });

  const found = new Map<number, number>(); // surahNumber -> page
  const raw: Array<{ page: number; snippet: string; digits: number[] }> = [];

  for (let page = 1; page <= 20; page++) {
    try {
      const { data } = await worker.recognize(pageUrl(page));
      const text = (data.text || '').replace(/\s+/g, ' ').trim();
      const digits = [...text.matchAll(/\b(\d{1,4})\b/g)].map((m) => parseInt(m[1], 10)).filter((n) => n >= 1 && n <= 1027);
      raw.push({ page, snippet: text.slice(0, 180), digits: digits.slice(0, 30) });

      for (const s of SURAHS) {
        const ar = normalizeAr(s.nameArabic);
        const en = (s.nameEnglish || '').toLowerCase();
        const arHit = ar.length > 2 && normalizeAr(text).includes(ar);
        const enHit = en.length > 3 && text.toLowerCase().includes(en);
        if (!arHit && !enHit) continue;

        // Prefer a number near the match; fallback: largest plausible page digit on this index page
        const candidates = digits.filter((d) => d >= 30 && d <= 1027);
        if (candidates.length && !found.has(s.surahNumber)) {
          found.set(s.surahNumber, candidates[0]);
          console.log(`hit Surah ${s.surahNumber} ${s.nameEnglish} ~ page ${candidates[0]} (from index p${page})`);
        }
      }
      console.log(`p${page}: chars=${text.length} digits=${digits.length}`);
    } catch (e) {
      console.log(`p${page} FAIL`, (e as Error).message);
    }
  }

  await worker.terminate();
  const out = {
    foundCount: found.size,
    mapping: Object.fromEntries([...found.entries()].sort((a, b) => a[0] - b[0])),
    raw,
  };
  const reportPath = path.join(CACHE, 'index-pilot-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(out, null, 2));
  console.log(`\nFound ${found.size}/114 Surah page refs from index.`);
  console.log('Report:', reportPath);
  process.exitCode = found.size >= 10 ? 0 : 2;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
