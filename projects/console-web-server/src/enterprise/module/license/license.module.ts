import { Module } from '@nestjs/common';

import { CloudLicenseService } from './cloud-license.service';
import { LicenseSelfHostedController } from './self-hosted-license.controller';
import { SelfHostedLicenseService } from './self-hosted-license.service';

@Module({
  controllers: [LicenseSelfHostedController],
  providers: [CloudLicenseService, SelfHostedLicenseService],
  exports: [CloudLicenseService, SelfHostedLicenseService],
})
export class LicenseModule {}
