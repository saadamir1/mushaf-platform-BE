import { Module } from '@nestjs/common';
import { VersesService } from './verses.service';
import { VersesController } from './verses.controller';

@Module({
  providers: [VersesService],
  controllers: [VersesController]
})
export class VersesModule {}
