import { Platform, Serial } from '@dogu-private/types';
import { Injectable } from '@nestjs/common';
import { AppiumContextProxy } from '../appium/appium.context';
import { DoguLogger } from '../logger/logger';
import { AppiumDeviceWebDriverEndpointHandlerService } from './appium-device-webdriver.endpoint-handler-service';
import { AppiumDeviceWebDriverHandler } from './appium-device-webdriver.handler';
import { RelayHttpRequestService } from './relay-http-request.service';

@Injectable()
export class AppiumDeviceWebDriverHandlerFactoryService {
  constructor(
    private readonly logger: DoguLogger,
    private readonly relayHttpRequestService: RelayHttpRequestService,
    private readonly endpointHandlerService: AppiumDeviceWebDriverEndpointHandlerService,
  ) {}

  create(platform: Platform, serial: Serial, appiumContextProxy: AppiumContextProxy): AppiumDeviceWebDriverHandler {
    return new AppiumDeviceWebDriverHandler(platform, serial, appiumContextProxy, this.relayHttpRequestService, this.endpointHandlerService, this.logger);
  }
}
