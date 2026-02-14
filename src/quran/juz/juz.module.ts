import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Juz } from '../entities/juz.entity';
import { JuzService } from './juz.service';
import { JuzController } from './juz.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Juz])],
  controllers: [JuzController],
  providers: [JuzService],
  exports: [JuzService],
})
export class JuzModule {}