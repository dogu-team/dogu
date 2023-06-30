import { Injectable } from '@nestjs/common';
import { DoguLogger } from '../logger/logger';

@Injectable()
export class DeviceWebDriverService {
  constructor(private readonly logger: DoguLogger) {}
}
