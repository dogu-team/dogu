import { Module } from '@nestjs/common';
import { LicenseModule } from '../../enterprise/module/license/license.module';

import { WsCommonModule } from '../../ws/common/ws-common.module';
import { DeviceModule } from '../organization/device/device.module';
import { RedisModule } from '../redis/redis.module';
import { LiveSessionHeartbeatGateway } from './live-session-heartbeat.gateway';
import { LiveSessionController } from './live-session.controller';
import { LiveSessionService } from './live-session.service';
import { LiveSessionSubscriber } from './live-session.subscriber';
import { LiveSessionUpdater } from './live-session.updater';

@Module({
  imports: [DeviceModule, WsCommonModule, LicenseModule, RedisModule],
  controllers: [LiveSessionController],
  providers: [LiveSessionHeartbeatGateway, LiveSessionService, LiveSessionUpdater, LiveSessionSubscriber],
  exports: [LiveSessionService],
})
export class LiveSessionModule {}
