import { Module } from '@nestjs/common';
import { DevicePortService } from './device-port.service';

@Module({
  providers: [DevicePortService],
  exports: [DevicePortService],
})
export class DevicePortModule {}
