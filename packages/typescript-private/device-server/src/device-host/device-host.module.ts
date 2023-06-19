import { Module } from '@nestjs/common';
import { DeviceHostController } from './device-host.controller';

@Module({
  controllers: [DeviceHostController],
})
export class DeviceHostModule {}
