import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { DoguLogger } from '../../logger/logger';
import { DeviceStatusService } from '../../organization/device/device-status.service';

@Injectable()
export class RemoteWebDriverInfoService {
  constructor(
    @Inject(forwardRef(() => DeviceStatusService))
    private readonly deviceStatusService: DeviceStatusService,
    private readonly logger: DoguLogger,
  ) {}
}
