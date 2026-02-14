import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';

// Load environment first
dotenv.config();

// Import only the entities we need
import { Surah } from '../quran/entities/surah.entity';
import { Verse } from '../quran/entities/verse.entity';
import { Juz } from '../quran/entities/juz.entity';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10) || 5432,
  username: process.env.DB_USERNAME || 'mushaf_admin',
  password: process.env.DB_PASSWORD || 'secret',
  database: process.env.DB_NAME || 'mushaf_platform_db',
  entities: [Surah, Verse, Juz], // Only the entities we use
  synchronize: false,
  logging: false, // Set to true for debugging
});

async function seed() {
  try {
    console.log('🔗 Connecting to database...');
    await AppDataSource.initialize();
    console.log('✅ Database connected\n');

    const surahRepo = AppDataSource.getRepository(Surah);
    const verseRepo = AppDataSource.getRepository(Verse);
    const juzRepo = AppDataSource.getRepository(Juz);

    console.log('🌱 Seeding sample data...\n');

    // Clear existing data
    // console.log('🗑️  Clearing existing data...');
    // await verseRepo.clear();
    // await juzRepo.clear();
    // await surahRepo.clear();
    // console.log('✅ Cleared\n');

    // Seed Surahs
    console.log('📖 Creating Surahs...');
    const surahs = await surahRepo.save([
      {
        surahNumber: 1,
        nameArabic: 'الفاتحة',
        nameEnglish: 'Al-Fatihah',
        nameUrdu: 'فاتحہ',
        versesCount: 7,
        revelationType: 'Meccan',
        descriptionUrdu: 'قرآن کی ابتدائی سورت',
      },
      {
        surahNumber: 2,
        nameArabic: 'البقرة',
        nameEnglish: 'Al-Baqarah',
        nameUrdu: 'بقرہ',
        versesCount: 286,
        revelationType: 'Medinan',
        descriptionUrdu: 'قرآن کی سب سے لمبی سورت',
      },
      {
        surahNumber: 114,
        nameArabic: 'الناس',
        nameEnglish: 'An-Nas',
        nameUrdu: 'ناس',
        versesCount: 6,
        revelationType: 'Meccan',
        descriptionUrdu: 'قرآن کی آخری سورت',
      },
    ]);

    console.log(`✅ Created ${surahs.length} surahs\n`);

    // Seed Verses
    console.log('📝 Creating Verses...');
    const verses = await verseRepo.save([
      {
        surahId: surahs[0].id,
        verseNumber: 1,
        textArabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
        textUrdu: 'شروع اللہ کے نام سے جو بڑا مہربان نہایت رحم والا ہے',
        tafseerUrdu: 'یہ قرآن کی پہلی آیت ہے',
        pageNumber: 1,
        juzNumber: 1,
      },
      {
        surahId: surahs[0].id,
        verseNumber: 2,
        textArabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
        textUrdu: 'سب تعریف اللہ ہی کے لیے ہے',
        tafseerUrdu: 'تمام تعریفیں صرف اللہ کے لیے ہیں',
        pageNumber: 1,
        juzNumber: 1,
      },
      {
        surahId: surahs[0].id,
        verseNumber: 3,
        textArabic: 'الرَّحْمَٰنِ الرَّحِيمِ',
        textUrdu: 'بڑا مہربان نہایت رحم والا',
        tafseerUrdu: 'اللہ کی رحمت کا بیان',
        pageNumber: 1,
        juzNumber: 1,
      },
    ]);

    console.log(`✅ Created ${verses.length} verses\n`);

    // Seed Juz
    console.log('📚 Creating Juz...');
    await juzRepo.save({
      juzNumber: 1,
      startVerseId: verses[0].id,
      endVerseId: 148,
      startSurahNumber: 1,
      endSurahNumber: 2,
    });

    console.log('✅ Created Juz 1\n');
    console.log('🎉 Seeding completed successfully!\n');
    
    console.log('📊 Summary:');
    console.log(`   Surahs: ${surahs.length}`);
    console.log(`   Verses: ${verses.length}`);
    console.log(`   Juz: 1\n`);
    
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
    console.log('👋 Database connection closed');
  }
}

seed();