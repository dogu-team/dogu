import { Module } from '@nestjs/common';
import { DevicePortModule } from '../device-port/device-port.module';
import { PlatformAbilityModule } from '../platform-ability/platform-ability.module';
import { AppiumService } from './appium.service';

@Module({
  imports: [DevicePortModule, PlatformAbilityModule],
  providers: [AppiumService],
  exports: [AppiumService],
})
export class AppiumModule {}
