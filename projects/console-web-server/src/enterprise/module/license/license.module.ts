import { Module } from '@nestjs/common';
import { CloudLicenseController } from './cloud-license.controller';

import { CloudLicenseService } from './cloud-license.service';
import { SelfHostedLicenseController } from './self-hosted-license.controller';
import { SelfHostedLicenseService } from './self-hosted-license.service';

@Module({
  controllers: [SelfHostedLicenseController, CloudLicenseController],
  providers: [CloudLicenseService, SelfHostedLicenseService],
  exports: [CloudLicenseService, SelfHostedLicenseService],
})
export class LicenseModule {}
