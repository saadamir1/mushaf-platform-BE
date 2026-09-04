/**
 * Auto Surah mapper — gated.
 * Pilot proved free Tesseract OCR is unreliable on this Mushaf calligraphy/index art.
 * This script will NOT overwrite surahs.json unless FORCE_OCR_MAP=1 and confidence is high.
 *
 * Recommended: supply a correct mapping CSV (surahNumber,startPageNumber) instead.
 * Run CSV import: npx tsx src/scripts/import-surah-map.ts path/to/map.csv
 */
import * as fs from 'fs';
import * as path from 'path';

const CACHE = path.join('d:', 'MYAPPS', 'personal', '.cache', 'mushaf-ocr');
const REPORT = path.join(CACHE, 'index-pilot-report.json');

console.log('Surah auto-map gate');
console.log('───────────────────');
console.log('Pilot result: body-page OCR = 0 reliable hits.');
console.log('Index-page OCR = noisy (false page numbers).');
console.log('');
console.log('Free OCR is NOT good enough for this Mushaf art.');
console.log('We will NOT overwrite FE/DB mapping automatically.');
console.log('');
console.log('Options that work:');
console.log('  1) Import a correct map CSV:  npm run map:import -- map.csv');
console.log('  2) Paid vision AI later (Gemini/GPT) — optional, not free');
console.log('  3) Keep current Surah.startPageNumber until a verified map exists');
console.log('');

if (fs.existsSync(REPORT)) {
  const r = JSON.parse(fs.readFileSync(REPORT, 'utf8'));
  console.log(`Last pilot foundCount=${r.foundCount} (treat as untrusted)`);
}

if (process.env.FORCE_OCR_MAP === '1') {
  console.log('FORCE_OCR_MAP=1 set — refusing anyway until a better engine is added.');
}

process.exit(0);
