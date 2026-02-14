import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Juz } from '../entities/juz.entity';

@Injectable()
export class JuzService {
  constructor(
    @InjectRepository(Juz)
    private juzRepository: Repository<Juz>,
  ) {}

  async findAll() {
    return await this.juzRepository.find({
      order: { juzNumber: 'ASC' },
    });
  }

  async findByNumber(juzNumber: number) {
    const juz = await this.juzRepository.findOne({
      where: { juzNumber },
    });

    if (!juz) {
      throw new NotFoundException(`Juz ${juzNumber} not found`);
    }

    return juz;
  }

  async getJuzWithVerses(juzNumber: number) {
    // This will be enhanced when you have the verses service integrated
    const juz = await this.findByNumber(juzNumber);
    
    return {
      juz,
      // In future: fetch verses using juz.startVerseId and juz.endVerseId
      // verses: await this.versesService.getVerseRange(juz.startVerseId, juz.endVerseId)
    };
  }
}