import { Test, TestingModule } from '@nestjs/testing';
import { BackendController } from './backend.controller';

describe('BackendController', () => {
  let controller: BackendController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BackendController],
    }).compile();

    controller = module.get<BackendController>(BackendController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
