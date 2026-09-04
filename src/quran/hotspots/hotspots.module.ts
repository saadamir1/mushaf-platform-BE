import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Hotspot } from '../entities/hotspot.entity';
import { HotspotsController } from './hotspots.controller';
import { HotspotsService } from './hotspots.service';

@Module({
  imports: [TypeOrmModule.forFeature([Hotspot])],
  controllers: [HotspotsController],
  providers: [HotspotsService],
  exports: [HotspotsService],
})
export class HotspotsModule {}
