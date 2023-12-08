import { Module } from '@nestjs/common';
import { AppiumModule } from '../appium/appium.module';
import { BrowserManagerModule } from '../browser-manager/browser-manager.module';
import { DeviceHostModule } from '../device-host/device-host.module';
import { DevicePortModule } from '../device-port/device-port.module';
import { DeviceWebDriverModule } from '../device-webdriver/device-webdriver.module';
import { GamiumModule } from '../gamium/gamium.module';
import { HttpRequestRelayModule } from '../http-request-relay/http-request-relay.module';
import { SeleniumModule } from '../selenium/selenium.module';
import { ScanService } from './scan.service';

@Module({
  imports: [AppiumModule, GamiumModule, HttpRequestRelayModule, DeviceWebDriverModule, SeleniumModule, BrowserManagerModule, DevicePortModule, DeviceHostModule],
  providers: [ScanService],
  exports: [ScanService],
})
export class ScanModule {}
