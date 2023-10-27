import { Inject, Injectable } from '@nestjs/common';
import { DoguLogger } from '../../../../module/logger/logger';
import { LicenseUpdater } from './license-updater';

@Injectable()
export class LicenseSystemProcessor {
  constructor(
    @Inject(LicenseUpdater) private readonly licenseUpdater: LicenseUpdater,
    private readonly logger: DoguLogger,
  ) {}

  public async update(): Promise<void> {
    await this.licenseUpdater.update();
  }
}
