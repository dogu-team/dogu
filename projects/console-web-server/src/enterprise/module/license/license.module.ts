import { Module } from '@nestjs/common';
import { WebSocketClientRegistryModule } from '../../../module/websocket-client-registry/websocket-client-registry.module';

import { CloudLicenseService } from './cloud-license.service';
import { LicenseSelfHostedController } from './self-hosted-license.controller';
import { SelfHostedLicenseService } from './self-hosted-license.service';

@Module({
  imports: [WebSocketClientRegistryModule],
  controllers: [LicenseSelfHostedController],
  providers: [CloudLicenseService, SelfHostedLicenseService],
  exports: [CloudLicenseService, SelfHostedLicenseService],
})
export class LicenseModule {}
