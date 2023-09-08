import { Module } from '@nestjs/common';
import { DeviceStreamingSessionModule } from '../../module/device-streaming-session/device-streaming-session.module';
import { DeviceModule } from '../../module/organization/device/device.module';
import { WsCommonModule } from '../common/ws-common.module';
import { DeviceStreamingSessionGateway } from './session-info/device-streaming-session.gateway';
import { DeviceStreamingTrickleExchangerGateway } from './trickle-exchanger/device-streaming-trickle-exchanger.gateway';

@Module({
  imports: [DeviceModule, WsCommonModule, DeviceStreamingSessionModule],
  providers: [DeviceStreamingTrickleExchangerGateway, DeviceStreamingSessionGateway],
})
export class DeviceStreamingModule {}
