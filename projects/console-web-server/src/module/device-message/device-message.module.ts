import { Module } from '@nestjs/common';
import { DeviceMessageQueue } from './device-message.queue';
import { DeviceMessageRelayer } from './device-message.relayer';

@Module({
  providers: [DeviceMessageRelayer, DeviceMessageQueue],
  exports: [DeviceMessageRelayer, DeviceMessageQueue],
})
export class DeviceMessageModule {}
