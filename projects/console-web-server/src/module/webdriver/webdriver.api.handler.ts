import { DeviceConnectionState, DeviceId, Serial, WebDriverSessionId } from '@dogu-private/types';
import { HeaderRecord, Method, transformAndValidate } from '@dogu-tech/common';
import { DeviceWebDriver, RelayRequest, RelayResponse } from '@dogu-tech/device-client-common';
import { Request } from 'express';
import { IncomingHttpHeaders } from 'http';
import { DataSource } from 'typeorm';
import { DoguWebDriverOptions } from '../../types/webdriver-options';
import { DeviceMessageRelayer } from '../device-message/device-message.relayer';
import { DeviceStatusService } from '../organization/device/device-status.service';
import { FindDevicesByOrganizationIdDto } from '../organization/device/dto/device.dto';
import { DeviceWebDriverService } from './device-webdriver.service';

export interface WebDriverDeviceAPIHandlerResultNotHandlable {
  isHandlable: false;
}

export interface WebDriverDeviceAPIHandlerResultError {
  isHandlable: true;
  // https://www.w3.org/TR/webdriver/#errors
  status: number;
  error: Error;
  data: Object;
}

export interface WebDriverDeviceAPIHandlerResultOk {
  isHandlable: true;
  error?: undefined;
  organizationId: string;
  deviceId: DeviceId;
  serial: Serial;
  sessionId?: WebDriverSessionId;
  request: RelayRequest;
}

export type WebDriverDeviceAPIHandlerResult = WebDriverDeviceAPIHandlerResultNotHandlable | WebDriverDeviceAPIHandlerResultError | WebDriverDeviceAPIHandlerResultOk;

export interface WebDriverHandleContext {
  dataSource: DataSource;
  deviceWebDriverService: DeviceWebDriverService;
  deviceStatusService: DeviceStatusService;
  deviceMessageRelayer: DeviceMessageRelayer;
}

export abstract class WebDriverAPIHandler {
  abstract onRequest(context: WebDriverHandleContext, subpath: string, request: Request): Promise<WebDriverDeviceAPIHandlerResult>;
  abstract onResponse(context: WebDriverHandleContext, handleResult: WebDriverDeviceAPIHandlerResultOk, response: RelayResponse): Promise<void>;
}

export class WebDriverNewSessionAPIHandler extends WebDriverAPIHandler {
  async onRequest(context: WebDriverHandleContext, subpath: string, request: Request): Promise<WebDriverDeviceAPIHandlerResult> {
    if (subpath !== 'session') {
      return { isHandlable: false };
    }
    const alwaysMatchCaps = request.body?.capabilities?.alwaysMatch;
    if (!alwaysMatchCaps) {
      return { isHandlable: true, status: 400, error: new Error('alwaysMatch capabilities not found'), data: {} };
    }
    const platformName = alwaysMatchCaps['platformName'];
    if (!platformName) {
      return { isHandlable: true, status: 400, error: new Error('platformName not found'), data: { platformName: platformName } };
    }
    const doguOptions = alwaysMatchCaps['dogu:options'];
    if (!doguOptions) {
      return { isHandlable: true, status: 400, error: new Error('Dogu options not found'), data: {} };
    }

    const options = await transformAndValidate(DoguWebDriverOptions, doguOptions);
    const dto = new FindDevicesByOrganizationIdDto();
    dto.tagNames = [options.tag];
    dto.connectionStates = [DeviceConnectionState.DEVICE_CONNECTION_STATE_CONNECTED];
    dto.projectIds = options.projectId ? [options.projectId] : [];

    const page = await context.deviceStatusService.findDevicesByOrganizationId({ userId: doguOptions.userId }, doguOptions.organizationId, dto);
    if (page.items.length === 0) {
      return { isHandlable: true, status: 400, error: new Error('Device not found'), data: {} };
    }
    const headers = convertHeaders(request.headers);

    return {
      isHandlable: true,
      organizationId: doguOptions.organizationId,
      deviceId: page.items[0].deviceId,
      serial: page.items[0].serial,
      request: {
        path: subpath,
        headers: headers,
        method: request.method as Method,
        query: request.query,
        reqBody: request.body,
      },
    };
  }

  async onResponse(context: WebDriverHandleContext, handleResult: WebDriverDeviceAPIHandlerResultOk, response: RelayResponse): Promise<void> {
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

export class WebDriverDeleteSessionAPIHandler extends WebDriverAPIHandler {
  async onRequest(context: WebDriverHandleContext, subpath: string, request: Request): Promise<WebDriverDeviceAPIHandlerResult> {
    if (!subpath.startsWith('session/')) {
      return { isHandlable: false };
    }
    const splited = subpath.split('/');
    if (splited.length !== 2) {
      return { isHandlable: false };
    }
    if (request.method !== 'DELETE') {
      return { isHandlable: false };
    }
    const sessionId = splited[1];
    if (sessionId.length === 0) {
      return { isHandlable: true, status: 400, error: new Error('empty session path'), data: {} };
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
      isHandlable: true,
      organizationId: organizationId,
      deviceId: deviceId,
      serial: serial,
      sessionId: sessionId,
      request: {
        path: subpath,
        headers: headers,
        method: request.method as Method,
        query: request.query,
        reqBody: request.body,
      },
    };
  }

  async onResponse(context: WebDriverHandleContext, handleResult: WebDriverDeviceAPIHandlerResultOk, response: RelayResponse): Promise<void> {
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

export class WebDriverEachSessionAPIHandler extends WebDriverAPIHandler {
  async onRequest(context: WebDriverHandleContext, subpath: string, request: Request): Promise<WebDriverDeviceAPIHandlerResult> {
    if (!subpath.startsWith('session/')) {
      return { isHandlable: false };
    }
    const splited = subpath.split('/');
    if (splited.length < 2) {
      return { isHandlable: true, status: 400, error: new Error('Invalid session path'), data: {} };
    }
    const sessionId = splited[1];
    if (sessionId.length === 0) {
      return { isHandlable: true, status: 400, error: new Error('empty session path'), data: {} };
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
      isHandlable: true,
      organizationId: organizationId,
      deviceId: deviceId,
      serial: serial,
      request: {
        path: subpath,
        headers: headers,
        method: request.method as Method,
        query: request.query,
        reqBody: request.body,
      },
    };
  }

  onResponse(context: WebDriverHandleContext, handleResult: WebDriverDeviceAPIHandlerResultOk, response: RelayResponse): Promise<void> {
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
