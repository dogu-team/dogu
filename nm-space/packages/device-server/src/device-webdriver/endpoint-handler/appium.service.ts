import { Injectable } from '@nestjs/common';

import { HeaderRecord, PromiseOrValue } from '@dogu-tech/common';
import { RelayRequest, WebDriverEndPoint, WebDriverEndpointType } from '@dogu-tech/device-client-common';
import _ from 'lodash';
import { AppiumRemoteContext } from '../../appium/appium.remote.context';
import { DeviceHostDownloadSharedResourceService } from '../../device-host/device-host.download-shared-resource';
import { DoguLogger } from '../../logger/logger';
import { OnBeforeRequestResult } from './common';

export abstract class AppiumEndpointHandler {
  abstract get endpointType(): WebDriverEndpointType;

  onBeforeRequest(
    remoteContext: AppiumRemoteContext,
    downloadService: DeviceHostDownloadSharedResourceService,
    headers: HeaderRecord,
    endpoint: WebDriverEndPoint,
    request: RelayRequest,
    logger: DoguLogger,
  ): PromiseOrValue<OnBeforeRequestResult> {
    request.headers = this.resolveHeader(request.headers, logger);
    return {
      request,
    };
  }

  protected resolveHeader(headers: HeaderRecord, logger: DoguLogger): HeaderRecord {
    _.keys(headers).forEach((key) => {
      if (key.toString().toLowerCase() === 'content-type') {
        const value = _.get(headers, key);
        const newValue = 'application/json; charset=utf-8';
        if (value.toLowerCase() === newValue.toLowerCase()) {
          return;
        }

        delete headers[key];
        headers[key] = newValue;
        logger.info('Content-Type is changed.', {
          key,
          oldValue: value,
          newValue,
        });
      } else if (key.toString().toLowerCase() === 'content-length') {
        delete headers[key];
        logger.info('Content-Length is removed.', {
          key,
        });
      }
    });
    return headers;
  }
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
  constructor(public readonly downloadService: DeviceHostDownloadSharedResourceService) {}
  getHandler(endpointType: WebDriverEndpointType): AppiumEndpointHandler | null {
    return appiumEndpointHandlerMap.get(endpointType) ?? null;
  }
}
