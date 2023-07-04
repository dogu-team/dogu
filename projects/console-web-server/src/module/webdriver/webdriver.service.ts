import { stringify } from '@dogu-tech/common';
import { DeviceWebDriver, RelayResponse } from '@dogu-tech/device-client-common';
import { Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import { DataSource } from 'typeorm';
import { DeviceMessageRelayer } from '../device-message/device-message.relayer';
import { DoguLogger } from '../logger/logger';
import { DeviceStatusService } from '../organization/device/device-status.service';
import { DeviceWebDriverService } from './device-webdriver.service';
import { WebDriverAPIHandler, WebDriverEachSessionAPIHandler, WebDriverHandleContext, WebDriverNewSessionAPIHandler } from './webdriver.api.handler';

@Injectable()
export class WebDriverService {
  private readonly apiHandlers: WebDriverAPIHandler[] = [new WebDriverNewSessionAPIHandler(), new WebDriverEachSessionAPIHandler()];
  constructor(
    private readonly dataSource: DataSource,
    private readonly deviceStatusService: DeviceStatusService,
    private readonly deviceWebDriverService: DeviceWebDriverService,
    private readonly deviceMessageRelayer: DeviceMessageRelayer,
    private readonly logger: DoguLogger,
  ) {}

  async process(request: Request, response: Response): Promise<RelayResponse> {
    const subpath = request.url.replace('/wd/hub/', '');

    const context: WebDriverHandleContext = {
      dataSource: this.dataSource,
      deviceStatusService: this.deviceStatusService,
      deviceWebDriverService: this.deviceWebDriverService,
    };
    for (const apiHandler of this.apiHandlers) {
      const processResult = await apiHandler.onRequest(context, subpath, request).catch((e) => {
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
          resBody: {
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
              resBody: {
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
            resBody: {
              error: stringify(e),
              message: stringify(e),
              stacktrace: '',
              data: {},
            },
          };
        });
      await apiHandler.onResponse(context, processResult, res);
      return res;
    }

    throw new Error('All Handlers failed to process request');
  }
}
