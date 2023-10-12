import { Module } from '@nestjs/common';
import { LiveSessionHeartbeatGateway } from './live-session-heartbeat.gateway';
import { LiveSessionController } from './live-session.controller';
import { LiveSessionService } from './live-session.service';

@Module({
  controllers: [LiveSessionController],
  providers: [LiveSessionHeartbeatGateway, LiveSessionService],
})
export class LiveSessionModule {}
