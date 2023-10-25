import { Module } from '@nestjs/common';

import { CloudLicenseService } from './cloud-license.service';
import { SelfHostedLicenseService } from './self-hosted-license.service';

@Module({
  imports: [],
  controllers: [],
  providers: [CloudLicenseService, SelfHostedLicenseService],
  exports: [CloudLicenseService, SelfHostedLicenseService],
})
export class LicenseModule {}
