import { Platform, Serial } from '@dogu-private/types';
import { Injectable } from '@nestjs/common';
import { SeleniumDeviceWebDriverHandler } from './selenium-device-webdriver-handler.impl';

@Injectable()
export class SeleniumDeviceWebDriverHandlerService {
  create(platform: Platform, serial: Serial): SeleniumDeviceWebDriverHandler {
    return new SeleniumDeviceWebDriverHandler(this, platform, serial);
  }
}
