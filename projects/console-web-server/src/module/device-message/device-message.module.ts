import { Module } from '@nestjs/common';
import { RedisModule } from '../redis/redis.module';
import { DeviceMessageQueue } from './device-message.queue';
import { DeviceMessageRelayer } from './device-message.relayer';

@Module({
  imports: [RedisModule],
  providers: [DeviceMessageRelayer, DeviceMessageQueue],
  exports: [DeviceMessageRelayer, DeviceMessageQueue],
})
export class DeviceMessageModule {}
