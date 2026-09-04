/**
 * Import verified Surah → page mapping from CSV (no OCR).
 * CSV columns: surahNumber,startPageNumber
 * Example:
 *   1,37
 *   2,38
 * Run: npx tsx src/scripts/import-surah-map.ts d:/path/map.csv
 */
import 'reflect-metadata';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { DataSource } from 'typeorm';
import { Surah } from '../quran/entities/surah.entity';
import { QuranPage } from '../quran/entities/page.entity';

dotenv.config();

const csvPath = process.argv[2];
if (!csvPath || !fs.existsSync(csvPath)) {
  console.error('Usage: npx tsx src/scripts/import-surah-map.ts <map.csv>');
  process.exit(1);
}

const FE_SURAHS = path.join('d:', 'MYAPPS', 'personal', 'mushaf-platform-FE', 'src', 'data', 'surahs.json');

function parseCsv(text: string) {
  const rows: { surahNumber: number; startPageNumber: number }[] = [];
  for (const line of text.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#') || /surah/i.test(t)) continue;
    const [a, b] = t.split(/[,;\t]/).map((x) => x.trim());
    const surahNumber = parseInt(a, 10);
    const startPageNumber = parseInt(b, 10);
    if (surahNumber >= 1 && surahNumber <= 114 && startPageNumber >= 1 && startPageNumber <= 1027) {
      rows.push({ surahNumber, startPageNumber });
    }
  }
  return rows;
}

async function main() {
  const rows = parseCsv(fs.readFileSync(csvPath, 'utf8'));
  if (rows.length < 50) {
    console.error(`Only ${rows.length} valid rows — need a fuller map (ideally 114).`);
    process.exit(1);
  }

  // Update FE JSON always
  const fe = JSON.parse(fs.readFileSync(FE_SURAHS, 'utf8')) as Array<Record<string, unknown>>;
  for (const r of rows) {
    const row = fe.find((x) => x.surahNumber === r.surahNumber);
    if (row) row.startPageNumber = r.startPageNumber;
  }
  fs.writeFileSync(FE_SURAHS, JSON.stringify(fe, null, 2));
  console.log(`Updated FE surahs.json (${rows.length} rows)`);

  try {
    const ds = new DataSource({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT ?? '5432', 10),
      username: process.env.DB_USERNAME || 'mushaf_admin',
      password: process.env.DB_PASSWORD || 'secret',
      database: process.env.DB_NAME || 'mushaf_platform_db',
      entities: [Surah, QuranPage],
      synchronize: false,
    });
    await ds.initialize();
    const surahRepo = ds.getRepository(Surah);
    const pageRepo = ds.getRepository(QuranPage);
    for (const r of rows) {
      await surahRepo.update({ surahNumber: r.surahNumber }, { startPageNumber: r.startPageNumber });
      await pageRepo.update({ pageNumber: r.startPageNumber }, { surahNumberStart: r.surahNumber });
    }
    await ds.destroy();
    console.log('Updated DB surahs + page.surahNumberStart');
  } catch (e) {
    console.warn('DB update skipped:', (e as Error).message);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
