import { Module } from '@nestjs/common';
import { AppiumDeviceWebDriverHandlerFactoryService } from './appium-device-webdriver.handler-factory-service';
import { RelayHttpRequestService } from './relay-http-request.service';
import { SeleniumDeviceWebDriverHandlerService } from './selenium-device-webdriver-handler.service';

@Module({
  providers: [AppiumDeviceWebDriverHandlerFactoryService, SeleniumDeviceWebDriverHandlerService, RelayHttpRequestService],
  exports: [AppiumDeviceWebDriverHandlerFactoryService, SeleniumDeviceWebDriverHandlerService],
})
export class DeviceWebDriverHandlerModule {}
