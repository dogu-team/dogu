import { Module } from '@nestjs/common';
import { DeviceStreamingSessionQueue } from './device-streaming-session.queue';

@Module({
  providers: [DeviceStreamingSessionQueue],
  exports: [DeviceStreamingSessionQueue],
})
export class DeviceStreamingSessionModule {}
