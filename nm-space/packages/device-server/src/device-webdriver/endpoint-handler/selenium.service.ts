import { HeaderRecord, PromiseOrValue } from '@dogu-tech/common';
import { RelayRequest, RelayResponse, WebDriverEndPoint, WebDriverEndpointType } from '@dogu-tech/device-client-common';
import { Injectable } from '@nestjs/common';
import _ from 'lodash';
import { BrowserManagerService } from '../../browser-manager/browser-manager.service';
import { DoguLogger } from '../../logger/logger';
import { SeleniumService } from '../../selenium/selenium.service';
import { OnAfterRequestResult, OnBeforeRequestResult } from './common';

export abstract class SeleniumEndpointHandler {
  abstract get endpointType(): string;

  onBeforeRequest(
    browserManagerService: BrowserManagerService,
    seleniumService: SeleniumService,
    headers: HeaderRecord,
    endpoint: WebDriverEndPoint,
    request: RelayRequest,
    logger: DoguLogger,
  ): PromiseOrValue<OnBeforeRequestResult> {
    request.path = this.resolvePath(request.path);
    request.headers = this.resolveHeader(request.headers, logger);
    return {
      request,
    };
  }

  onAfterRequest(
    seleniumService: SeleniumService,
    headers: HeaderRecord,
    endpoint: WebDriverEndPoint,
    request: RelayRequest,
    response: RelayResponse,
    logger: DoguLogger,
  ): PromiseOrValue<OnAfterRequestResult> {
    return {
      response,
    };
  }

  protected resolvePath(path: string): string {
    if (!path.startsWith('/')) {
      path = `/${path}`;
    }
    if (!path.startsWith('/wd/hub')) {
      path = `/wd/hub${path}`;
    }
    return path;
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

const seleniumEndpointHandlerMap = new Map<string, SeleniumEndpointHandler>();

export function RegisterSeleniumEndpointHandler(): ClassDecorator {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return (constructor: Function): void => {
    if (!constructor.name.startsWith('Selenium')) {
      throw new Error(`DeviceWebDriver.SeleniumEndpointHandler [${constructor.name}] is not started with Selenium`);
    }
    if (!constructor.name.endsWith('EndpointHandler')) {
      throw new Error(`DeviceWebDriver.SeleniumEndpointHandler [${constructor.name}] is not ended with EndpointHandler`);
    }
    const endpointHandler = new (constructor as unknown as { new (): SeleniumEndpointHandler })();
    if (!endpointHandler.endpointType) {
      throw new Error(`DeviceWebDriver.SeleniumEndpointHandler [${constructor.name}] has no endpointType`);
    }
    if (seleniumEndpointHandlerMap.has(endpointHandler.endpointType)) {
      throw new Error(`DeviceWebDriver.SeleniumEndpointHandler [${constructor.name}] is already registered`);
    }
    seleniumEndpointHandlerMap.set(endpointHandler.endpointType, endpointHandler);
  };
}

@Injectable()
export class SeleniumEndpointHandlerService {
  getHandler(endpointType: WebDriverEndpointType): SeleniumEndpointHandler | null {
    return seleniumEndpointHandlerMap.get(endpointType) ?? null;
  }
}
