/**
 * Sync FE surahs/juz JSON into DB + seed demo topics/hotspots.
 * Requires Postgres running (npm run db:start).
 */
import 'reflect-metadata';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { DataSource } from 'typeorm';
import { Surah } from '../quran/entities/surah.entity';
import { Verse } from '../quran/entities/verse.entity';
import { Juz } from '../quran/entities/juz.entity';
import { QuranPage } from '../quran/entities/page.entity';
import { TopicIndex } from '../quran/entities/topic_index.entity';
import { Hotspot } from '../quran/entities/hotspot.entity';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

dotenv.config();

const FE = path.join('d:', 'MYAPPS', 'personal', 'mushaf-platform-FE', 'src', 'data');

async function main() {
  const ds = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'dev',
    password: process.env.DB_PASSWORD || 'secret',
    database: process.env.DB_NAME || 'mushaf_platform_db',
    entities: [Surah, Verse, Juz, QuranPage, TopicIndex, Hotspot, User],
    synchronize: true,
  });
  await ds.initialize();
  console.log('DB connected');

  const surahRepo = ds.getRepository(Surah);
  const juzRepo = ds.getRepository(Juz);
  const pageRepo = ds.getRepository(QuranPage);
  const topicRepo = ds.getRepository(TopicIndex);
  const hotspotRepo = ds.getRepository(Hotspot);
  const userRepo = ds.getRepository(User);

  const surahs = JSON.parse(fs.readFileSync(path.join(FE, 'surahs.json'), 'utf8'));
  const juzList = JSON.parse(fs.readFileSync(path.join(FE, 'juz.json'), 'utf8'));
  const pages = JSON.parse(fs.readFileSync(path.join(FE, 'pages.json'), 'utf8'));

  for (const s of surahs) {
    let row = await surahRepo.findOne({ where: { surahNumber: s.surahNumber } });
    if (!row) {
      row = surahRepo.create({
        surahNumber: s.surahNumber,
        nameArabic: s.nameArabic,
        nameEnglish: s.nameEnglish,
        nameTransliteration: s.nameTransliteration,
        nameUrdu: s.nameUrdu,
        versesCount: s.versesCount,
        revelationType: s.revelationType,
        orderOfRevelation: s.orderOfRevelation,
        descriptionUrdu: s.descriptionUrdu,
        startPageNumber: s.startPageNumber,
      });
    } else {
      row.startPageNumber = s.startPageNumber;
      row.nameArabic = s.nameArabic;
      row.nameEnglish = s.nameEnglish;
      row.nameUrdu = s.nameUrdu;
      row.versesCount = s.versesCount;
      row.revelationType = s.revelationType;
    }
    await surahRepo.save(row);
  }
  console.log(`Synced ${surahs.length} surahs`);

  for (const j of juzList) {
    let row = await juzRepo.findOne({ where: { juzNumber: j.juzNumber } });
    if (!row) {
      row = juzRepo.create({
        juzNumber: j.juzNumber,
        startVerse: j.startVerse || '1:1',
        endVerse: j.endVerse || '1:1',
        startPageNumber: j.startPageNumber,
      });
    } else {
      row.startPageNumber = j.startPageNumber;
    }
    await juzRepo.save(row);
  }
  console.log(`Synced ${juzList.length} juz`);

  let pageCount = 0;
  for (const p of pages) {
    let row = await pageRepo.findOne({ where: { pageNumber: p.pageNumber } });
    if (!row) {
      row = pageRepo.create({
        pageNumber: p.pageNumber,
        imageUrl: p.imageUrl,
        startVerse: p.startVerse || '',
        endVerse: p.endVerse || '',
        juzNumber: p.juzNumber ?? null,
        surahNumberStart: p.surahNumberStart ?? null,
      });
    } else {
      row.imageUrl = p.imageUrl;
      row.juzNumber = p.juzNumber ?? row.juzNumber;
      row.surahNumberStart = p.surahNumberStart ?? row.surahNumberStart;
    }
    await pageRepo.save(row);
    pageCount++;
    if (pageCount % 200 === 0) console.log(`pages ${pageCount}`);
  }
  console.log(`Synced ${pageCount} pages`);

  const topicsSeed = [
    { topicNameUrdu: 'توحید', topicNameEnglish: 'Tawheed', pageNumber: 37, category: 'Aqeedah', surahNumber: 1, juzNumber: 1 },
    { topicNameUrdu: 'نماز', topicNameEnglish: 'Prayer', pageNumber: 38, category: 'Ibadah', surahNumber: 2, juzNumber: 1 },
    { topicNameUrdu: 'صبر', topicNameEnglish: 'Patience', pageNumber: 115, category: 'Akhlaq', surahNumber: 3, juzNumber: 1 },
    { topicNameUrdu: 'جنت', topicNameEnglish: 'Paradise', pageNumber: 133, category: 'Akhirah', surahNumber: 4, juzNumber: 1 },
  ];
  const savedTopics: TopicIndex[] = [];
  for (const t of topicsSeed) {
    let row = await topicRepo.findOne({ where: { topicNameUrdu: t.topicNameUrdu } });
    if (!row) row = await topicRepo.save(topicRepo.create(t));
    else {
      row.pageNumber = t.pageNumber;
      row = await topicRepo.save(row);
    }
    savedTopics.push(row);
  }

  await hotspotRepo.clear();
  await hotspotRepo.save([
    { pageNumber: 37, x: 12, y: 14, width: 76, height: 10, label: 'Surah Al-Fatihah', topicIndexId: savedTopics[0].id, linkType: 'topic' },
    { pageNumber: 38, x: 12, y: 14, width: 76, height: 10, label: 'Surah Al-Baqarah', topicIndexId: savedTopics[1].id, linkType: 'topic' },
    { pageNumber: 115, x: 20, y: 35, width: 60, height: 12, label: 'Surah Al-Imran starts', topicIndexId: savedTopics[2].id, linkType: 'topic' },
  ]);
  console.log('Seeded topics + hotspots');

  const adminEmail = 'admin@mushaf.com';
  let admin = await userRepo.findOne({ where: { email: adminEmail } });
  if (!admin) {
    admin = await userRepo.save(userRepo.create({
      email: adminEmail,
      password: await bcrypt.hash('Admin@123', 10),
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isEmailVerified: true,
    }));
    console.log('Created admin@mushaf.com / Admin@123');
  } else {
    console.log('Admin already exists');
  }

  await ds.destroy();
  console.log('Done');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
