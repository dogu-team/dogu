import { Module } from '@nestjs/common';
import { DeviceStreamingSessionModule } from '../../module/device-streaming-session/device-streaming-session.module';
import { DeviceModule } from '../../module/organization/device/device.module';
import { WsCommonModule } from '../common/ws-common.module';
import { DeviceStreamingGateway } from './device-streaming.gateway';

@Module({
  imports: [DeviceModule, WsCommonModule, DeviceStreamingSessionModule],
  providers: [DeviceStreamingGateway],
})
export class DeviceStreamingModule {}
