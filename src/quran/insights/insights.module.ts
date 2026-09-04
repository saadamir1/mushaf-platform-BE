import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TopicIndex } from '../entities/topic_index.entity';
import { QuranPage } from '../entities/page.entity';
import { Surah } from '../entities/surah.entity';
import { Juz } from '../entities/juz.entity';
import { InsightsController } from './insights.controller';
import { InsightsService } from './insights.service';

@Module({
  imports: [TypeOrmModule.forFeature([TopicIndex, QuranPage, Surah, Juz])],
  controllers: [InsightsController],
  providers: [InsightsService],
  exports: [InsightsService],
})
export class InsightsModule {}