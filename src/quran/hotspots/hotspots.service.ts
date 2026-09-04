import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Hotspot } from '../entities/hotspot.entity';

@Injectable()
export class HotspotsService {
  constructor(
    @InjectRepository(Hotspot)
    private readonly hotspotRepo: Repository<Hotspot>,
  ) {}

  findByPage(pageNumber: number) {
    return this.hotspotRepo.find({
      where: { pageNumber },
      relations: ['topic'],
      order: { y: 'ASC', x: 'ASC' },
    });
  }

  async findOne(id: number) {
    const hs = await this.hotspotRepo.findOne({
      where: { id },
      relations: ['topic'],
    });
    if (!hs) throw new NotFoundException(`Hotspot ${id} not found`);
    return hs;
  }

  create(data: Partial<Hotspot>) {
    return this.hotspotRepo.save(this.hotspotRepo.create(data));
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.hotspotRepo.delete(id);
    return { message: 'Hotspot deleted' };
  }
}
