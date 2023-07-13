import { Injectable } from '@nestjs/common';
import {
  AppiumDeviceWebDriverEndpointHandler,
  AppiumDeviceWebDriverNewSessionEndpointHandler,
  AppiumDeviceWebDriverSessionEndpointHandler,
} from './appium-device-webdriver.endpoint-handlers';

const endpointHandlers: {
  [key: string]: AppiumDeviceWebDriverEndpointHandler;
} = {
  'new-session': new AppiumDeviceWebDriverNewSessionEndpointHandler(),
  session: new AppiumDeviceWebDriverSessionEndpointHandler(),
};

@Injectable()
export class AppiumDeviceWebDriverEndpointHandlerService {
  private readonly _endpointHandlers = endpointHandlers;

  find(key: string): AppiumDeviceWebDriverEndpointHandler | null {
    const handler = this._endpointHandlers[key];
    if (!handler) {
      return null;
    }
    return handler;
  }
}
