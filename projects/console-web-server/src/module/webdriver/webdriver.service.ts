import { stringify } from '@dogu-tech/common';
import { DeviceWebDriver, RelayResponse } from '@dogu-tech/device-client-common';
import { Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import { DeviceMessageRelayer } from '../device-message/device-message.relayer';
import { DoguLogger } from '../logger/logger';
import { DeviceStatusService } from '../organization/device/device-status.service';
import { WebDriverAPIHandler, WebDriverNewSessionAPIHandler } from './webdriver.api.handler';

@Injectable()
export class WebDriverService {
  private readonly apiHandlers: WebDriverAPIHandler[] = [new WebDriverNewSessionAPIHandler()];
  constructor(private readonly deviceStatusService: DeviceStatusService, private readonly deviceMessageRelayer: DeviceMessageRelayer, private readonly logger: DoguLogger) {}

  async process(request: Request, response: Response): Promise<RelayResponse> {
    const subpath = request.url.replace('/wd/hub/', '');

    for (const apiHandler of this.apiHandlers) {
      const processResult = await apiHandler.process(this.deviceStatusService, subpath, request).catch((e) => {
        return { isHandlable: true, error: e as Error, status: 400, data: {} };
      });
      if (!processResult.isHandlable) {
        continue;
      }
      if (processResult.error) {
        // https://www.w3.org/TR/webdriver/#errors
        return {
          headers: {},
          status: processResult.status,
          data: {
            error: processResult.error.name,
            message: processResult.error.message,
            stacktrace: '',
            data: JSON.stringify(processResult.data),
          },
        };
      }
      const pathProvider = new DeviceWebDriver.relayHttp.pathProvider(processResult.serial);
      const path = DeviceWebDriver.relayHttp.resolvePath(pathProvider);
      const res = await this.deviceMessageRelayer
        .sendHttpRequest(
          processResult.organizationId,
          processResult.deviceId,
          DeviceWebDriver.relayHttp.method,
          path,
          undefined,
          undefined,
          processResult.request,
          DeviceWebDriver.relayHttp.responseBodyData,
        )
        .catch((e) => {
          if (e instanceof Error) {
            return {
              headers: {},
              status: 500,
              data: {
                error: e.name,
                message: e.message,
                stacktrace: '',
                data: {},
              },
            };
          }
          return {
            headers: {},
            status: 500,
            data: {
              error: stringify(e),
              message: stringify(e),
              stacktrace: '',
              data: {},
            },
          };
        });
      return res;
    }

    throw new Error('All Handlers failed to process request');
  }

  // private getTargetDeviceId(request: Request): string | null {
  //   const subpath = request.url.replace('/wd/hub/', '');
  //   if (!subpath.startsWith('session')) {
  //     return null;
  //   }
  //   this.processNewSession(request);
  // }

  // private processNewSession(request: Request): string | null {
  //   const subpath = request.url.replace('/wd/hub/', '');
  //   const alwaysMatchCaps = request.body?.capabilities?.alwaysMatch;
  //   if (!alwaysMatchCaps) {
  //     throw new Error('alwaysMatch capabilities not found');
  //   }
  //   const platformName = alwaysMatchCaps['platformName'];
  //   if (!platformName) {
  //     throw new Error('platformName not found');
  //   }
  //   const doguOptions = alwaysMatchCaps['dogu:options'];
  //   if (!doguOptions) {
  //     throw new Error('Dogu options not found');
  //   }
  // }
}
