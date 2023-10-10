import { Module } from '@nestjs/common';
import { CloudDeviceController } from './cloud-device.controller';

@Module({
  imports: [],
  controllers: [CloudDeviceController],
})
export class CloudDeviceModule {}
