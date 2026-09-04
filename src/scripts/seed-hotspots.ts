/**
 * Seed demo hotspots + ensure topic samples for page mapping demos.
 * Run: npx tsx src/scripts/seed-hotspots.ts
 * Uses D:/E drive temps via project .env — does not install to C:.
 */
import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { Hotspot } from '../quran/entities/hotspot.entity';
import { TopicIndex } from '../quran/entities/topic_index.entity';

dotenv.config();

const ds = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME || 'mushaf_admin',
  password: process.env.DB_PASSWORD || 'secret',
  database: process.env.DB_NAME || 'mushaf_platform_db',
  entities: [Hotspot, TopicIndex],
  synchronize: true,
  logging: false,
});

async function run() {
  await ds.initialize();
  const topics = ds.getRepository(TopicIndex);
  const hotspots = ds.getRepository(Hotspot);

  const samples = [
    { topicNameUrdu: 'توحید', topicNameEnglish: 'Tawheed', pageNumber: 37, category: 'Aqeedah', surahNumber: 1, juzNumber: 1 },
    { topicNameUrdu: 'نماز', topicNameEnglish: 'Prayer', pageNumber: 38, category: 'Ibadah', surahNumber: 2, juzNumber: 1 },
    { topicNameUrdu: 'صبر', topicNameEnglish: 'Patience', pageNumber: 40, category: 'Akhlaq', surahNumber: 2, juzNumber: 1 },
    { topicNameUrdu: 'جنت', topicNameEnglish: 'Paradise', pageNumber: 42, category: 'Akhirah', surahNumber: 2, juzNumber: 1 },
  ];

  const savedTopics = [];
  for (const t of samples) {
    let row = await topics.findOne({ where: { topicNameUrdu: t.topicNameUrdu } });
    if (!row) row = await topics.save(topics.create(t));
    savedTopics.push(row);
  }

  await hotspots.clear();
  await hotspots.save([
    { pageNumber: 37, x: 12, y: 18, width: 28, height: 8, label: 'Surah Al-Fatihah', topicIndexId: savedTopics[0].id, linkType: 'topic' },
    { pageNumber: 37, x: 55, y: 40, width: 30, height: 10, label: 'Tawheed focus', topicIndexId: savedTopics[0].id, linkType: 'topic' },
    { pageNumber: 38, x: 20, y: 25, width: 35, height: 12, label: 'Prayer theme', topicIndexId: savedTopics[1].id, linkType: 'topic' },
    { pageNumber: 1, x: 15, y: 20, width: 40, height: 15, label: 'Opening page', topicIndexId: savedTopics[0].id, linkType: 'topic' },
  ]);

  console.log(`Seeded ${savedTopics.length} topics and hotspots`);
  await ds.destroy();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
