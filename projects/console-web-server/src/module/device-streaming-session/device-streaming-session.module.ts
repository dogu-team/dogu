import { Module } from '@nestjs/common';
import { RedisModule } from '../redis/redis.module';
import { DeviceStreamingSessionQueue } from './device-streaming-session.queue';

@Module({
  imports: [RedisModule],
  providers: [DeviceStreamingSessionQueue],
  exports: [DeviceStreamingSessionQueue],
})
export class DeviceStreamingSessionModule {}
