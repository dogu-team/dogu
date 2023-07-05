import { Module } from '@nestjs/common';
import { ScanModule } from '../scan/scan.module';
import { DeviceWebDriverController } from './device-webdriver.controller';

@Module({
  imports: [ScanModule],
  controllers: [DeviceWebDriverController],
})
export class DeviceWebDriverModule {}
