import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DeviceHostModule } from '../device-host/device-host.module';
import { ScanModule } from '../scan/scan.module';
import { DeviceWebDriverController } from './device-webdriver.controller';
import { AppiumEndpointHandlerService } from './endpoint-handler/appium.service';
import { SeleniumEndpointHandlerService } from './endpoint-handler/selenium.service';

@Module({
  imports: [forwardRef(() => ScanModule), DeviceHostModule, AuthModule],
  controllers: [DeviceWebDriverController],
  providers: [AppiumEndpointHandlerService, SeleniumEndpointHandlerService],
  exports: [AppiumEndpointHandlerService, SeleniumEndpointHandlerService],
})
export class DeviceWebDriverModule {}
