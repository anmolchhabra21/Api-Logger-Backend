import { Test, TestingModule } from '@nestjs/testing';
import { BackendService } from './backend.service';

describe('BackendService', () => {
  let service: BackendService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BackendService],
    }).compile();

    service = module.get<BackendService>(BackendService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
