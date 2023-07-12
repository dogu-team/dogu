import { DeviceId, extensionFromPlatform, Serial, WebDriverSessionId } from '@dogu-private/types';
import { HeaderRecord, Method } from '@dogu-tech/common';
import {
  convertWebDriverPlatformToDogu,
  DeviceWebDriver,
  RelayRequest,
  RelayResponse,
  WebDriverDeleteSessionEndpointInfo,
  WebDriverNewSessionEndpointInfo,
  WebDriverSessionEndpointInfo,
} from '@dogu-tech/device-client-common';
import { Injectable } from '@nestjs/common';
import { IncomingHttpHeaders } from 'http';
import { DataSource } from 'typeorm';
import { DeviceMessageRelayer } from '../device-message/device-message.relayer';
import { DoguLogger } from '../logger/logger';
import { DeviceStatusService } from '../organization/device/device-status.service';
import { ApplicationService } from '../project/application/application.service';
import { FindProjectApplicationDto } from '../project/application/dto/application.dto';
import { RemoteWebDriverInfoService } from '../remote/remote-webdriver/remote-webdriver.service';
import { WebDriverException } from './webdriver.exception';
export interface WebDriverEndpointHandlerResult {
  error?: undefined;
  organizationId: string;
  deviceId: DeviceId;
  serial: Serial;
  sessionId?: WebDriverSessionId;
  request: RelayRequest;
}

@Injectable()
export class WebDriverService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly deviceStatusService: DeviceStatusService,
    private readonly remoteWebDriverService: RemoteWebDriverInfoService,
    private readonly deviceMessageRelayer: DeviceMessageRelayer,
    private readonly applicationService: ApplicationService,
    private readonly logger: DoguLogger,
  ) {}

  async sendRequest(processResult: WebDriverEndpointHandlerResult): Promise<RelayResponse> {
    try {
      const pathProvider = new DeviceWebDriver.relayHttp.pathProvider(processResult.serial);
      const path = DeviceWebDriver.relayHttp.resolvePath(pathProvider);
      const res = await this.deviceMessageRelayer.sendHttpRequest(
        processResult.organizationId,
        processResult.deviceId,
        DeviceWebDriver.relayHttp.method,
        path,
        undefined,
        undefined,
        processResult.request,
        DeviceWebDriver.relayHttp.responseBodyData,
      );
      return res;
    } catch (e) {
      throw new WebDriverException(500, e, {});
    }
  }

  async handleNewSessionRequest(endpointInfo: WebDriverNewSessionEndpointInfo, request: RelayRequest): Promise<WebDriverEndpointHandlerResult> {
    const options = endpointInfo.capabilities.doguOptions;
    const devices = await this.dataSource.transaction(async (manager) => {
      return await this.deviceStatusService.findDevicesByDeviceTag(manager, options.organizationId, options.projectId, [options.tag]);
    });

    if (devices.length === 0) {
      throw new WebDriverException(400, new Error('Device not found'), {});
    }
    if (!options.appVersion) {
      throw new WebDriverException(400, new Error('App version not specified'), {});
    }
    const randIndex = Math.floor(Math.random() * devices.length);
    const device = devices[randIndex];
    const headers = convertHeaders(request.headers);

    const findAppDto = new FindProjectApplicationDto();
    findAppDto.version = options.appVersion;
    findAppDto.extension = extensionFromPlatform(convertWebDriverPlatformToDogu(endpointInfo.capabilities.platformName));
    const applications = await this.applicationService.getApplicationList(options.organizationId, options.projectId, findAppDto);
    if (applications.items.length === 0) {
      throw new WebDriverException(400, new Error('Application not found'), {});
    }
    const application = applications.items[0];
    const applicationUrl = await this.applicationService.getApplicationDownladUrl(application.projectApplicationId, options.organizationId, options.projectId);

    endpointInfo.capabilities.setDoguAppUrl(applicationUrl);
    endpointInfo.capabilities.setUdid(device.serial);

    return {
      organizationId: options.organizationId,
      deviceId: device.deviceId,
      serial: device.serial,
      request: {
        path: request.path,
        headers: headers,
        method: request.method as Method,
        query: request.query,
        reqBody: endpointInfo.capabilities.origin,
      },
    };
  }

  async handleNewSessionResponse(handleResult: WebDriverEndpointHandlerResult, response: RelayResponse): Promise<void> {
    if (response.status !== 200) {
      return;
    }
    const sessionId = (response.resBody as any)?.value?.sessionId as string;
    if (!sessionId) {
      throw new WebDriverException(400, new Error('Session id not found in response'), {});
    }

    await this.dataSource.transaction(async (manager) => {
      await this.remoteWebDriverService.createSessionToDevice(manager, handleResult.deviceId, { sessionId: sessionId });
    });
  }

  async handleDeleteSessionRequest(endpointInfo: WebDriverDeleteSessionEndpointInfo, request: RelayRequest): Promise<WebDriverEndpointHandlerResult> {
    const sessionId = endpointInfo.sessionId;
    if (!sessionId) {
      throw new WebDriverException(400, new Error('empty session path'), {});
    }
    const { organizationId, deviceId, serial } = await this.dataSource.transaction(async (manager) => {
      const deviceId = await this.remoteWebDriverService.findDeviceBySessionIdAndMark(manager, sessionId);
      const device = await this.deviceStatusService.findDevice(deviceId);
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

  async handleDeleteSessionResponse(handleResult: WebDriverEndpointHandlerResult, response: RelayResponse): Promise<void> {
    if (response.status !== 200) {
      return;
    }
    const sessionId = handleResult.sessionId;
    if (!sessionId) {
      throw new WebDriverException(400, new Error('Session id not found when deleting'), {});
    }

    await this.dataSource.transaction(async (manager) => {
      await this.remoteWebDriverService.deleteSession(manager, sessionId);
    });

    const pathProvider = new DeviceWebDriver.sessionDeleted.pathProvider(handleResult.serial);
    const path = DeviceWebDriver.sessionDeleted.resolvePath(pathProvider);
    const res = await this.deviceMessageRelayer.sendHttpRequest(
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

  async handleEachSessionRequest(endpointInfo: WebDriverSessionEndpointInfo, request: RelayRequest): Promise<WebDriverEndpointHandlerResult> {
    const sessionId = endpointInfo.sessionId;
    if (!sessionId) {
      throw new WebDriverException(400, new Error('empty session path'), {});
    }
    const { organizationId, deviceId, serial } = await this.dataSource.transaction(async (manager) => {
      const deviceId = await this.remoteWebDriverService.findDeviceBySessionIdAndMark(manager, sessionId);
      const device = await this.deviceStatusService.findDevice(deviceId);
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
