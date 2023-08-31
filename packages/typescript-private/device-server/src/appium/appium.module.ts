import { Module } from '@nestjs/common';
import { DevicePortModule } from '../device-port/device-port.module';
import { AppiumService } from './appium.service';

@Module({
  imports: [DevicePortModule],
  providers: [AppiumService],
  exports: [AppiumService],
})
export class AppiumModule {}
