import { Module } from '@nestjs/common';
import { DeviceMessageModule } from '../../module/device-message/device-message.module';
import { RemoteWebDriverBiDiCdpGateway } from './remote-webdriver-bidi.cdp-gateway';

@Module({
  imports: [DeviceMessageModule],
  providers: [RemoteWebDriverBiDiCdpGateway],
})
export class RemoteWebDriverBiDiModule {}
