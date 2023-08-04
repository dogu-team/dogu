import { Module } from '@nestjs/common';
import { DeviceModule } from '../../module/organization/device/device.module';
import { WsCommonModule } from '../common/ws-common.module';
import { DeviceStreamingGateway } from './device-streaming.gateway';

@Module({
  imports: [DeviceModule, WsCommonModule],
  providers: [DeviceStreamingGateway],
})
export class DeviceStreamingModule {}
