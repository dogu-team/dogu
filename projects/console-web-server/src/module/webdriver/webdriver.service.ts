import { HeaderRecord, Method, stringify } from '@dogu-tech/common';
import { DeviceWebDriver, RelayRequest, RelayResponse, WebDriverEndPoint } from '@dogu-tech/device-client-common';
import { Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import { IncomingHttpHeaders } from 'http';
import { DataSource } from 'typeorm';
import { DeviceMessageRelayer } from '../device-message/device-message.relayer';
import { DoguLogger } from '../logger/logger';
import { DeviceStatusService } from '../organization/device/device-status.service';
import { ApplicationService } from '../project/application/application.service';
import { DeviceWebDriverService } from './device-webdriver.service';
import {
  WebDriverDeleteSessionEndpointHandler,
  WebDriverEachSessionEndpointHandler,
  WebDriverEndpointHandler,
  WebDriverHandleContext,
  WebDriverNewSessionEndpointHandler,
} from './webdriver.endpoint.handler';

@Injectable()
export class WebDriverService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly deviceStatusService: DeviceStatusService,
    private readonly deviceWebDriverService: DeviceWebDriverService,
    private readonly deviceMessageRelayer: DeviceMessageRelayer,
    private readonly applicationService: ApplicationService,
    private readonly logger: DoguLogger,
  ) {}

  async process(request: Request, response: Response): Promise<RelayResponse> {
    const relayRequest = convertRequest(request);
    const endpoint = await WebDriverEndPoint.create(relayRequest);

    if (!(endpoint.info.type in handlers)) {
      return makeWdError(501, new Error(`Not Implemented to handle ${relayRequest.path}`), {});
    }

    const context: WebDriverHandleContext = {
      dataSource: this.dataSource,
      deviceStatusService: this.deviceStatusService,
      deviceWebDriverService: this.deviceWebDriverService,
      deviceMessageRelayer: this.deviceMessageRelayer,
      applicationService: this.applicationService,
    };

    const handler = handlers[endpoint.info.type];

    const processResult = await handler.onRequest(context, endpoint, relayRequest).catch((e) => {
      return { error: e as Error, status: 400, data: {} };
    });
    if (processResult.error) {
      // https://www.w3.org/TR/webdriver/#errors
      return makeWdError(processResult.status, processResult.error, processResult.data);
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
        return makeWdError(500, e, {});
      });
    await handler.onResponse(context, processResult, res);
    return res;
  }
}

const handlers: {
  [key: string]: WebDriverEndpointHandler;
} = {
  'new-session': new WebDriverNewSessionEndpointHandler(),
  'delete-session': new WebDriverDeleteSessionEndpointHandler(),
  session: new WebDriverEachSessionEndpointHandler(),
};

function convertRequest(request: Request): RelayRequest {
  const headers = convertHeaders(request.headers);
  const subpath = request.url.replace('/wd/hub/', '');
  return {
    path: subpath,
    headers: headers,
    method: request.method as Method,
    query: request.query,
    reqBody: request.body,
  };
}

function convertHeaders(requestHeaders: IncomingHttpHeaders): HeaderRecord {
  const headers: HeaderRecord = {};
  for (const key of Object.keys(requestHeaders)) {
    const value = requestHeaders[key]!;
    if (value instanceof Array) {
      throw new Error('Multiple headers not supported');
    }
    headers[key] = value;
  }
  return headers;
}

function makeWdError(status: number, error: Error | unknown, data: Object): RelayResponse {
  if (error instanceof Error) {
    return {
      headers: {},
      status: status,
      resBody: {
        error: error.name,
        message: error.message,
        stacktrace: '',
        data: data ? JSON.stringify(data) : {},
      },
    };
  }
  return {
    headers: {},
    status: 500,
    resBody: {
      error: stringify(error),
      message: stringify(error),
      stacktrace: '',
      data: {},
    },
  };
}
