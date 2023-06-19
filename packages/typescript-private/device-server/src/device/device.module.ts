import { Module } from '@nestjs/common';
import { ConfigModule } from '../config/config.module';
import { LocalDeviceModule } from '../local-device/local-device.module';
import { ScanModule } from '../scan/scan.module';
import { DeviceController } from './device.controller';

@Module({
  imports: [ScanModule, ConfigModule, LocalDeviceModule],
  controllers: [DeviceController],
})
export class DeviceModule {}
