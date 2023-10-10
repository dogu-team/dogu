import { Module } from '@nestjs/common';
import { CloudDeviceController } from './cloud-device.controller';
import { CloudDeviceService } from './cloud-device.service';

@Module({
  imports: [],
  controllers: [CloudDeviceController],
  providers: [CloudDeviceService],
})
export class CloudDeviceModule {}
