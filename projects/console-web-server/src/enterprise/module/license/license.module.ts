import { Module } from '@nestjs/common';
import { CloudLicenseController } from './cloud-license.controller';
import { CloudLicenseEventSubscriber } from './cloud-license.event-subscriber';

import { CloudLicenseService } from './cloud-license.service';
import { SelfHostedLicenseController } from './self-hosted-license.controller';
import { SelfHostedLicenseService } from './self-hosted-license.service';

@Module({
  controllers: [SelfHostedLicenseController, CloudLicenseController],
  providers: [CloudLicenseService, SelfHostedLicenseService, CloudLicenseEventSubscriber],
  exports: [CloudLicenseService, SelfHostedLicenseService, CloudLicenseEventSubscriber],
})
export class LicenseModule {}
