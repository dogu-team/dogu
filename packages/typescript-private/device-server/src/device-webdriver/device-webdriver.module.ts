import { Module } from '@nestjs/common';
import { ScanModule } from '../scan/scan.module';
import { DeviceWebDriverController } from './device-webdriver.controller';
import { AppiumEndpointHandlerService } from './endpoint-handler/appium.service';
import { SeleniumEndpointHandlerService } from './endpoint-handler/selenium.service';

@Module({
  imports: [ScanModule],
  controllers: [DeviceWebDriverController],
  providers: [AppiumEndpointHandlerService, SeleniumEndpointHandlerService],
})
export class DeviceWebDriverModule {}
