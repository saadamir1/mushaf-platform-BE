import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Surah } from '../entities/surah.entity';
import { SurahsService } from './surahs.service';
import { SurahsController } from './surahs.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Surah])],
  controllers: [SurahsController],
  providers: [SurahsService],
  exports: [SurahsService],
})
export class SurahsModule {}