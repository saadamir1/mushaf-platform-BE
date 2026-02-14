import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Surah } from './entities/surah.entity';
import { Verse } from './entities/verse.entity';
import { Juz } from './entities/juz.entity';
import { QuranPage } from './entities/page.entity';
import { SurahsModule } from './surahs/surahs.module';
import { VersesModule } from './verses/verses.module';
import { PagesModule } from './pages/pages.module';
import { JuzModule } from './juz/juz.module';
import { SearchModule } from './search/search.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Surah, Verse, Juz, QuranPage]),
    SurahsModule,
    VersesModule,
    PagesModule,
    JuzModule,
    SearchModule,
  ],
  exports: [TypeOrmModule],
})
export class QuranModule {}