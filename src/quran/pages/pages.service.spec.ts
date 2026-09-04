import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { PagesService } from './pages.service';
import { QuranPage } from '../entities/page.entity';
import { Surah } from '../entities/surah.entity';
import { Juz } from '../entities/juz.entity';
import { TopicIndex } from '../entities/topic_index.entity';

describe('PagesService', () => {
  let service: PagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PagesService,
        { provide: getRepositoryToken(QuranPage), useValue: { findOne: jest.fn(), findAndCount: jest.fn(), createQueryBuilder: jest.fn(), save: jest.fn() } },
        { provide: getRepositoryToken(Surah), useValue: { findOne: jest.fn(), find: jest.fn() } },
        { provide: getRepositoryToken(Juz), useValue: { findOne: jest.fn(), find: jest.fn() } },
        { provide: getRepositoryToken(TopicIndex), useValue: { find: jest.fn().mockResolvedValue([]) } },
        { provide: CACHE_MANAGER, useValue: { get: jest.fn(), set: jest.fn() } },
      ],
    }).compile();

    service = module.get<PagesService>(PagesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
