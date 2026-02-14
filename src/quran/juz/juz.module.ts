import { Module } from '@nestjs/common';
import { JuzService } from './juz.service';
import { JuzController } from './juz.controller';

@Module({
  providers: [JuzService],
  controllers: [JuzController]
})
export class JuzModule {}
