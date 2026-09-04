import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Surah } from '../entities/surah.entity';
import { Juz } from '../entities/juz.entity';
import { QuranPage } from '../entities/page.entity';
import { MappingService } from './mapping.service';

@Module({
  imports: [TypeOrmModule.forFeature([Surah, Juz, QuranPage])],
  providers: [MappingService],
  exports: [MappingService],
})
export class MappingModule {}
