import { Module } from '@nestjs/common';
import { DeviceMessageModule } from '../../module/device-message/device-message.module';
import { DeviceModule } from '../../module/organization/device/device.module';
import { WsCommonModule } from '../common/ws-common.module';
import { PrivateDeviceWsGateway } from './private-device-ws.gateway';

@Module({
  imports: [DeviceModule, DeviceMessageModule, WsCommonModule],
  providers: [PrivateDeviceWsGateway],
})
export class PrivateDeviceWsModule {}
