import { Module } from '@nestjs/common';
import { WebSocketClientRegistryModule } from '../../../module/websocket-client-registry/websocket-client-registry.module';

import { CloudLicenseService } from './cloud-license.service';
import { SelfHostedLicenseService } from './self-hosted-license.service';

@Module({
  imports: [WebSocketClientRegistryModule],
  controllers: [],
  providers: [CloudLicenseService, SelfHostedLicenseService],
  exports: [CloudLicenseService, SelfHostedLicenseService],
})
export class LicenseModule {}
