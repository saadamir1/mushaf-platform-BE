import { Test, TestingModule } from '@nestjs/testing';
import { JuzService } from './juz.service';

describe('JuzService', () => {
  let service: JuzService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JuzService],
    }).compile();

    service = module.get<JuzService>(JuzService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
