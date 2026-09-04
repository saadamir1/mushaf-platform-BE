/**
 * Quick OCR pilot — tests if Surah headers are detectable on scanned pages.
 * Does NOT need DB. Uses Cloudinary + Tesseract (free).
 * Run: npx tsx src/scripts/pilot-ocr.ts
 */
import * as fs from 'fs';
import * as path from 'path';
import { createWorker } from 'tesseract.js';

const CACHE = path.join('d:', 'MYAPPS', 'personal', '.cache', 'mushaf-ocr');
fs.mkdirSync(CACHE, { recursive: true });

const SURAHS = JSON.parse(
  fs.readFileSync(
    path.join('d:', 'MYAPPS', 'personal', 'mushaf-platform-FE', 'src', 'data', 'surahs.json'),
    'utf8',
  ),
);

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
  return `https://res.cloudinary.com/dffic6vkc/image/upload/w_1000,h_280,c_fill,g_north,q_auto:eco/mushaf/pages/page_${padded}.jpg`;
}

// Sample pages: claimed starts + nearby pages
const TEST_PAGES = [1, 37, 38, 39, 86, 100, 200];

async function main() {
  console.log('OCR pilot starting…');
  const worker = await createWorker(['ara', 'eng'], 1, {
    cachePath: path.join('d:', 'MYAPPS', 'personal', '.cache', 'tesseract'),
    logger: (m) => {
      if (m.status === 'recognizing text') process.stdout.write(`\r  ${Math.round((m.progress || 0) * 100)}%`);
    },
  });

  const report: Array<Record<string, unknown>> = [];

  for (const page of TEST_PAGES) {
    process.stdout.write(`\nPage ${page}: `);
    try {
      const { data } = await worker.recognize(pageUrl(page));
      const text = (data.text || '').replace(/\s+/g, ' ').trim();
      const ar = normalizeAr(text);
      const hits = SURAHS.filter((s: { nameArabic: string; nameEnglish: string; surahNumber: number }) => {
        const name = normalizeAr(s.nameArabic);
        return name.length > 2 && ar.includes(name);
      }).map((s: { surahNumber: number; nameEnglish: string; nameArabic: string }) => ({
        n: s.surahNumber,
        en: s.nameEnglish,
        ar: s.nameArabic,
      }));

      console.log(`\n  OCR chars=${text.length} hits=${hits.length}`);
      console.log(`  snippet: ${text.slice(0, 160)}`);
      if (hits.length) console.log('  matched:', hits.map((h) => `${h.n}:${h.en}`).join(', '));
      report.push({ page, textLen: text.length, snippet: text.slice(0, 200), hits });
    } catch (e) {
      console.log('FAIL', (e as Error).message);
      report.push({ page, error: (e as Error).message });
    }
  }

  await worker.terminate();
  const out = path.join(CACHE, 'pilot-report.json');
  fs.writeFileSync(out, JSON.stringify(report, null, 2));
  const ok = report.filter((r) => (r.hits as unknown[])?.length > 0).length;
  console.log(`\nPilot done. Surah-name hits on ${ok}/${TEST_PAGES.length} pages.`);
  console.log('Report:', out);
  if (ok === 0) {
    console.log('VERDICT: OCR cannot reliably read Surah headers on this Mushaf art. Keep index+hotspot mapping; do not auto-overwrite surahs.json.');
    process.exitCode = 2;
  } else {
    console.log('VERDICT: OCR detects some Surah names — full map:surahs is worth running.');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
