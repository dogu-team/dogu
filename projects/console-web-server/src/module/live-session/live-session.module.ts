import { Module } from '@nestjs/common';
import { LicenseModule } from '../../enterprise/module/license/license.module';

import { WsCommonModule } from '../../ws/common/ws-common.module';
import { DeviceModule } from '../organization/device/device.module';
import { RedisModule } from '../redis/redis.module';
import { WebSocketClientRegistryModule } from '../websocket-client-registry/websocket-client-registry.module';
import { LiveSessionHeartbeatGateway } from './live-session-heartbeat.gateway';
import { LiveSessionController } from './live-session.controller';
import { LiveSessionService } from './live-session.service';

@Module({
  imports: [DeviceModule, WsCommonModule, LicenseModule, WebSocketClientRegistryModule, RedisModule],
  controllers: [LiveSessionController],
  providers: [LiveSessionHeartbeatGateway, LiveSessionService],
  exports: [LiveSessionService],
})
export class LiveSessionModule {}
