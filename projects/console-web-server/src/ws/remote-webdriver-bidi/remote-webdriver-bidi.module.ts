import { Module } from '@nestjs/common';
import { RemoteWebDriverBiDiCdpGateway } from './remote-webdriver-bidi.cdp-gateway';

@Module({
  providers: [RemoteWebDriverBiDiCdpGateway],
})
export class RemoteWebDriverBiDiModule {}
