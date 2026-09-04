import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuranPage } from '../entities/page.entity';
import { Surah } from '../entities/surah.entity';
import { Juz } from '../entities/juz.entity';
import { TopicIndex } from '../entities/topic_index.entity';
import { PagesService } from './pages.service';
import { PagesController } from './pages.controller';
import { MappingModule } from '../mapping/mapping.module';

@Module({
  imports: [TypeOrmModule.forFeature([QuranPage, Surah, Juz, TopicIndex]), MappingModule],
  controllers: [PagesController],
  providers: [PagesService],
  exports: [PagesService],
})
export class PagesModule {}
