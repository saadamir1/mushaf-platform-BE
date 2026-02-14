import { Test, TestingModule } from '@nestjs/testing';
import { JuzController } from './juz.controller';

describe('JuzController', () => {
  let controller: JuzController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JuzController],
    }).compile();

    controller = module.get<JuzController>(JuzController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
