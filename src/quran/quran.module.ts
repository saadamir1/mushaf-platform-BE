import { Module } from '@nestjs/common';
import { SurahsModule } from './surahs/surahs.module';
import { VersesModule } from './verses/verses.module';
import { PagesModule } from './pages/pages.module';
import { JuzModule } from './juz/juz.module';
import { SearchModule } from './search/search.module';

@Module({
  imports: [SurahsModule, VersesModule, PagesModule, JuzModule, SearchModule]
})
export class QuranModule {}
