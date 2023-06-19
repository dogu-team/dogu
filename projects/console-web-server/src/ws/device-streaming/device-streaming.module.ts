import { Module } from '@nestjs/common';
import { DeviceModule } from '../../module/organization/device/device.module';
import { WsCommonService } from '../common/ws-common.service';
import { DeviceStreamingGateway } from './device-streaming.gateway';

@Module({
  imports: [DeviceModule],
  providers: [DeviceStreamingGateway, WsCommonService],
})
export class DeviceStreamingModule {}
