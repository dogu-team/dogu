import { Test, TestingModule } from '@nestjs/testing';
import { HostService } from './host.service';

describe('HostService', () => {
  let service: HostService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HostService],
    }).compile();
    await module.init();

    service = module.get<HostService>(HostService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
