import { forwardRef, Module } from '@nestjs/common';
import { DeviceHostDownloadSharedResourceService } from '../device-host/device-host.download-shared-resource';
import { ScanModule } from '../scan/scan.module';
import { DeviceWebDriverController } from './device-webdriver.controller';
import { AppiumEndpointHandlerService } from './endpoint-handler/appium.service';
import { SeleniumEndpointHandlerService } from './endpoint-handler/selenium.service';

@Module({
  imports: [forwardRef(() => ScanModule)],
  controllers: [DeviceWebDriverController],
  providers: [AppiumEndpointHandlerService, SeleniumEndpointHandlerService, DeviceHostDownloadSharedResourceService],
  exports: [AppiumEndpointHandlerService, SeleniumEndpointHandlerService, DeviceHostDownloadSharedResourceService],
})
export class DeviceWebDriverModule {}
