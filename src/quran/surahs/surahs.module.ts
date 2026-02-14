import { Module } from '@nestjs/common';
import { SurahsService } from './surahs.service';
import { SurahsController } from './surahs.controller';

@Module({
  providers: [SurahsService],
  controllers: [SurahsController]
})
export class SurahsModule {}
