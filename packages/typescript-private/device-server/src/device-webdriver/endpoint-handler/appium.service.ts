import { Injectable } from '@nestjs/common';

import { HeaderRecord, PromiseOrValue } from '@dogu-tech/common';
import { RelayRequest, WebDriverEndPoint, WebDriverEndpointType } from '@dogu-tech/device-client-common';
import { AppiumRemoteContext } from '../../appium/appium.remote.context';
import { DoguLogger } from '../../logger/logger';
import { OnBeforeRequestResult } from './common';

export abstract class AppiumEndpointHandler {
  abstract get endpointType(): WebDriverEndpointType;
  abstract onBeforeRequest(
    remoteContext: AppiumRemoteContext,
    headers: HeaderRecord,
    endpoint: WebDriverEndPoint,
    request: RelayRequest,
    logger: DoguLogger,
  ): PromiseOrValue<OnBeforeRequestResult>;
}

const appiumEndpointHandlerMap = new Map<string, AppiumEndpointHandler>();

export function RegisterAppiumEndpointHandler(): ClassDecorator {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return (constructor: Function): void => {
    if (!constructor.name.startsWith('Appium')) {
      throw new Error(`DeviceWebDriver.AppiumEndpointHandler [${constructor.name}] is not started with Appium`);
    }
    if (!constructor.name.endsWith('EndpointHandler')) {
      throw new Error(`DeviceWebDriver.AppiumEndpointHandler [${constructor.name}] is not ended with EndpointHandler`);
    }
    const endpointHandler = new (constructor as unknown as { new (): AppiumEndpointHandler })();
    if (!endpointHandler.endpointType) {
      throw new Error(`DeviceWebDriver.AppiumEndpointHandler [${constructor.name}] has no endpointType`);
    }
    if (appiumEndpointHandlerMap.has(endpointHandler.endpointType)) {
      throw new Error(`DeviceWebDriver.AppiumEndpointHandler [${constructor.name}] is already registered`);
    }
    appiumEndpointHandlerMap.set(endpointHandler.endpointType, endpointHandler);
  };
}

@Injectable()
export class AppiumEndpointHandlerService {
  getHandler(endpointType: WebDriverEndpointType): AppiumEndpointHandler | null {
    return appiumEndpointHandlerMap.get(endpointType) ?? null;
  }
}
