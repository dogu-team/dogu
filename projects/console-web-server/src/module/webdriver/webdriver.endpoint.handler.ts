import { DeviceId, extensionFromPlatform, Serial, WebDriverSessionId } from '@dogu-private/types';
import { HeaderRecord, Method } from '@dogu-tech/common';
import { convertWebDriverPlatformToDogu, DeviceWebDriver, RelayRequest, RelayResponse, WebDriverEndPoint } from '@dogu-tech/device-client-common';
import { IncomingHttpHeaders } from 'http';
import { DataSource } from 'typeorm';
import { DeviceMessageRelayer } from '../device-message/device-message.relayer';
import { DeviceStatusService } from '../organization/device/device-status.service';
import { ApplicationService } from '../project/application/application.service';
import { FindProjectApplicationDto } from '../project/application/dto/application.dto';
import { DeviceWebDriverService } from './device-webdriver.service';

export interface WebDriverEndpointHandlerResultError {
  // https://www.w3.org/TR/webdriver/#errors
  status: number;
  error: Error;
  data: Object;
}

export interface WebDriverEndpointHandlerResultOk {
  error?: undefined;
  organizationId: string;
  deviceId: DeviceId;
  serial: Serial;
  sessionId?: WebDriverSessionId;
  request: RelayRequest;
}

export type WebDriverEndpointHandlerResult = WebDriverEndpointHandlerResultError | WebDriverEndpointHandlerResultOk;

export interface WebDriverHandleContext {
  dataSource: DataSource;
  deviceWebDriverService: DeviceWebDriverService;
  deviceStatusService: DeviceStatusService;
  deviceMessageRelayer: DeviceMessageRelayer;
  applicationService: ApplicationService;
}

export abstract class WebDriverEndpointHandler {
  abstract onRequest(context: WebDriverHandleContext, endpoint: WebDriverEndPoint, request: RelayRequest): Promise<WebDriverEndpointHandlerResult>;
  abstract onResponse(context: WebDriverHandleContext, handleResult: WebDriverEndpointHandlerResultOk, response: RelayResponse): Promise<void>;
}

export class WebDriverNewSessionEndpointHandler extends WebDriverEndpointHandler {
  async onRequest(context: WebDriverHandleContext, endpoint: WebDriverEndPoint, request: RelayRequest): Promise<WebDriverEndpointHandlerResult> {
    if (endpoint.info.type !== 'new-session') {
      return { status: 400, error: new Error('Internal error. endpoint type is not delete-session'), data: {} };
    }
    const options = endpoint.info.capabilities.doguOptions;
    const devices = await context.dataSource.transaction(async (manager) => {
      return await context.deviceStatusService.findDevicesByDeviceTag(manager, options.organizationId, options.projectId, [options.tag]);
    });

    if (devices.length === 0) {
      return { status: 400, error: new Error('Device not found'), data: {} };
    }
    if (!options.appVersion) {
      return { status: 400, error: new Error('App version not specified'), data: {} };
    }
    const randIndex = Math.floor(Math.random() * devices.length);
    const device = devices[randIndex];
    const headers = convertHeaders(request.headers);

    const findAppDto = new FindProjectApplicationDto();
    findAppDto.version = options.appVersion;
    findAppDto.extension = extensionFromPlatform(convertWebDriverPlatformToDogu(endpoint.info.capabilities.platformName));
    const applications = await context.applicationService.getApplicationList(options.organizationId, options.projectId, findAppDto);
    if (applications.items.length === 0) {
      return { status: 400, error: new Error('Application not found'), data: {} };
    }
    const application = applications.items[0];
    const applicationUrl = await context.applicationService.getApplicationDownladUrl(application.projectApplicationId, options.organizationId, options.projectId);

    endpoint.info.capabilities.setDoguAppUrl(applicationUrl);

    return {
      organizationId: options.organizationId,
      deviceId: device.deviceId,
      serial: device.serial,
      request: {
        path: request.path,
        headers: headers,
        method: request.method as Method,
        query: request.query,
        reqBody: endpoint.info.capabilities.origin,
      },
    };
  }

  async onResponse(context: WebDriverHandleContext, handleResult: WebDriverEndpointHandlerResultOk, response: RelayResponse): Promise<void> {
    if (response.status !== 200) {
      return;
    }
    const sessionId = (response.resBody as any)?.value?.sessionId as string;
    if (!sessionId) {
      throw new Error('Session id not found in response');
    }

    await context.dataSource.transaction(async (manager) => {
      await context.deviceWebDriverService.createSessionToDevice(manager, handleResult.deviceId, { sessionId: sessionId });
    });
  }
}

export class WebDriverDeleteSessionEndpointHandler extends WebDriverEndpointHandler {
  async onRequest(context: WebDriverHandleContext, endpoint: WebDriverEndPoint, request: RelayRequest): Promise<WebDriverEndpointHandlerResult> {
    if (endpoint.info.type !== 'delete-session') {
      return { status: 400, error: new Error('Internal error. endpoint type is not delete-session'), data: {} };
    }
    const sessionId = endpoint.info.sessionId;
    if (!sessionId) {
      return { status: 400, error: new Error('empty session path'), data: {} };
    }
    const { organizationId, deviceId, serial } = await context.dataSource.transaction(async (manager) => {
      const deviceId = await context.deviceWebDriverService.findDeviceBySessionIdAndMark(manager, sessionId);
      const device = await context.deviceStatusService.findDevice(deviceId);
      return {
        organizationId: device.organizationId,
        deviceId: device.deviceId,
        serial: device.serial,
      };
    });
    const headers = convertHeaders(request.headers);

    return {
      organizationId: organizationId,
      deviceId: deviceId,
      serial: serial,
      sessionId: sessionId,
      request: {
        path: request.path,
        headers: headers,
        method: request.method as Method,
        query: request.query,
        reqBody: request.reqBody,
      },
    };
  }

  async onResponse(context: WebDriverHandleContext, handleResult: WebDriverEndpointHandlerResultOk, response: RelayResponse): Promise<void> {
    if (response.status !== 200) {
      return;
    }
    const sessionId = handleResult.sessionId;
    if (!sessionId) {
      throw new Error('Session id not found when deleting');
    }

    await context.dataSource.transaction(async (manager) => {
      await context.deviceWebDriverService.deleteSession(manager, sessionId);
    });

    const pathProvider = new DeviceWebDriver.sessionDeleted.pathProvider(handleResult.serial);
    const path = DeviceWebDriver.sessionDeleted.resolvePath(pathProvider);
    const res = await context.deviceMessageRelayer.sendHttpRequest(
      handleResult.organizationId,
      handleResult.deviceId,
      DeviceWebDriver.sessionDeleted.method,
      path,
      undefined,
      undefined,
      { sessionId: sessionId },
      DeviceWebDriver.sessionDeleted.responseBody,
    );
  }
}

export class WebDriverEachSessionEndpointHandler extends WebDriverEndpointHandler {
  async onRequest(context: WebDriverHandleContext, endpoint: WebDriverEndPoint, request: RelayRequest): Promise<WebDriverEndpointHandlerResult> {
    if (endpoint.info.type !== 'session') {
      return { status: 400, error: new Error('Internal error. endpoint type is not delete-session'), data: {} };
    }
    const sessionId = endpoint.info.sessionId;
    if (!sessionId) {
      return { status: 400, error: new Error('empty session path'), data: {} };
    }
    const { organizationId, deviceId, serial } = await context.dataSource.transaction(async (manager) => {
      const deviceId = await context.deviceWebDriverService.findDeviceBySessionIdAndMark(manager, sessionId);
      const device = await context.deviceStatusService.findDevice(deviceId);
      return {
        organizationId: device.organizationId,
        deviceId: device.deviceId,
        serial: device.serial,
      };
    });
    const headers = convertHeaders(request.headers);

    return {
      organizationId: organizationId,
      deviceId: deviceId,
      serial: serial,
      request: {
        path: request.path,
        headers: headers,
        method: request.method as Method,
        query: request.query,
        reqBody: request.reqBody,
      },
    };
  }

  onResponse(context: WebDriverHandleContext, handleResult: WebDriverEndpointHandlerResultOk, response: RelayResponse): Promise<void> {
    return Promise.resolve();
  }
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
