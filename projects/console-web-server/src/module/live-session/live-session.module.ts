import { Module } from '@nestjs/common';

import { WsCommonModule } from '../../ws/common/ws-common.module';
import { DeviceModule } from '../organization/device/device.module';
import { LiveSessionHeartbeatGateway } from './live-session-heartbeat.gateway';
import { LiveSessionController } from './live-session.controller';
import { LiveSessionService } from './live-session.service';

@Module({
  imports: [DeviceModule, WsCommonModule],
  controllers: [LiveSessionController],
  providers: [LiveSessionHeartbeatGateway, LiveSessionService],
  exports: [LiveSessionService],
})
export class LiveSessionModule {}
