import {
  DeviceId,
  DEVICE_TABLE_NAME,
  OrganizationId,
  Platform,
  ProjectId,
  RemoteDeviceJobId,
  REMOTE_DEVICE_JOB_STATE,
  REMOTE_TABLE_NAME,
  REMOTE_TYPE,
  Serial,
  WebDriverSessionId,
} from '@dogu-private/types';
import { HeaderRecord, Method } from '@dogu-tech/common';
import {
  DeviceWebDriver,
  RelayRequest,
  RelayResponse,
  WebDriverDeleteSessionEndpointInfo,
  WebDriverNewSessionEndpointInfo,
  WebDriverSessionEndpointInfo,
} from '@dogu-tech/device-client-common';
import { HttpStatus, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { IncomingHttpHeaders } from 'http';
import { DataSource } from 'typeorm';
import { v4 } from 'uuid';
import { Device } from '../../db/entity/device.entity';
import { RemoteDeviceJob } from '../../db/entity/remote-device-job.entity';
import { RemoteWebDriverInfo } from '../../db/entity/remote-webdriver-info.entity';
import { Remote } from '../../db/entity/remote.entity';
import { DeviceMessageRelayer } from '../device-message/device-message.relayer';
import { DoguLogger } from '../logger/logger';
import { DeviceStatusService } from '../organization/device/device-status.service';
import { ApplicationService } from '../project/application/application.service';
import { RemoteWebDriverInfoService } from '../remote/remote-webdriver/remote-webdriver.service';
import { WebDriverException } from './webdriver.exception';

export interface WebDriverEndpointHandlerResult {
  error?: undefined;
  organizationId: OrganizationId;
  projectId: ProjectId;
  remoteDeviceJobId: RemoteDeviceJobId;
  deviceId: DeviceId;
  platform: Platform;
  serial: Serial;
  browserName: string | null;
  browserVersion: string | null;
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

  async sendRequest(processResult: WebDriverEndpointHandlerResult, headers: HeaderRecord = {}): Promise<RelayResponse> {
    try {
      const pathProvider = new DeviceWebDriver.relayHttp.pathProvider(processResult.serial);
      const path = DeviceWebDriver.relayHttp.resolvePath(pathProvider);
      const res = await this.deviceMessageRelayer.sendHttpRequest(
        processResult.organizationId,
        processResult.deviceId,
        DeviceWebDriver.relayHttp.method,
        path,
        headers,
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
    const runsOn = options['runs-on'];
    const deviceTagOrNames = Array.isArray(runsOn) ? runsOn : typeof runsOn === 'string' ? [runsOn] : [];
    if (deviceTagOrNames.length === 0) {
      throw new WebDriverException(HttpStatus.BAD_REQUEST, new Error('Device tag or name not specified'), {});
    }

    let device: Device;

    if (deviceTagOrNames.length === 1) {
      const deviceByName = await this.dataSource.getRepository(Device).findOne({ where: { organizationId: options.organizationId, name: deviceTagOrNames[0] } });
      if (!deviceByName) {
        throw new WebDriverException(HttpStatus.NOT_FOUND, new Error(`Device not found. Device Name: ${deviceByName}`), {});
      }
      device = deviceByName;
    } else {
      const devicesByTag = await this.deviceStatusService.findDevicesByDeviceTag(this.dataSource.manager, options.organizationId, options.projectId, []);
      const deviceIds = devicesByTag.map((device) => device.deviceId);
      const sortDevicesByRunningRate = await this.deviceStatusService.sortDevicesByRunningRate(deviceIds);
      if (sortDevicesByRunningRate.length === 0) {
        throw new WebDriverException(HttpStatus.NOT_FOUND, new Error(`Device not found. Device tag: ${deviceTagOrNames.join(', ')}`), {});
      }
      device = sortDevicesByRunningRate[0];
    }

    if (!options.appVersion) {
      throw new WebDriverException(400, new Error('App version not specified'), {});
    }

    const headers = this.convertHeaders(request.headers);

    // FIXME: henry - temporary test
    // // appium begin
    // const findAppDto = new FindProjectApplicationDto();
    // findAppDto.version = options.appVersion;
    // findAppDto.extension = extensionFromPlatform(convertWebDriverPlatformToDogu(endpointInfo.capabilities.platformName));
    // const applications = await this.applicationService.getApplicationList(options.organizationId, options.projectId, findAppDto);
    // if (applications.items.length === 0) {
    //   throw new WebDriverException(400, new Error('Application not found'), {});
    // }
    // const application = applications.items[0];
    // const applicationUrl = await this.applicationService.getApplicationDownladUrl(application.projectApplicationId, options.organizationId, options.projectId);

    // endpointInfo.capabilities.setDoguAppUrl(applicationUrl);
    // endpointInfo.capabilities.setUdid(device.serial);
    // // appium end

    return {
      organizationId: options.organizationId,
      remoteDeviceJobId: v4(),
      projectId: options.projectId,
      deviceId: device.deviceId,
      platform: device.platform,
      serial: device.serial,
      browserName: options.browserName ?? null,
      browserVersion: options.browserVersion ?? null,
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

    const rv = await this.dataSource.manager.transaction(async (manager) => {
      // remote
      const remoteData = manager.getRepository(Remote).create({
        remoteId: v4(),
        projectId: handleResult.projectId,
        type: REMOTE_TYPE.WEBDRIVER,
      });

      // remote-webdriver-info
      const remoteWebDriverInfoData = manager.getRepository(RemoteWebDriverInfo).create({
        remoteWebDriverInfoId: v4(),
        remoteId: remoteData.remoteId,
        browserName: handleResult.browserName,
        browserVersion: handleResult.browserVersion,
      });

      // remote-device-job
      const remoteDeviceJobData = manager.getRepository(RemoteDeviceJob).create({
        remoteDeviceJobId: handleResult.remoteDeviceJobId,
        remoteId: remoteData.remoteId,
        deviceId: handleResult.deviceId,
        lastIntervalTime: new Date(),
        sessionId,
        state: REMOTE_DEVICE_JOB_STATE.WAITING,
      });

      await manager.getRepository(Remote).save(remoteData);
      await manager.getRepository(RemoteWebDriverInfo).save(remoteWebDriverInfoData);
      const remoteDeviceJob = await manager.getRepository(RemoteDeviceJob).save(remoteDeviceJobData);

      return remoteDeviceJob;
    });

    await this.waitRemoteDeviceJobToInprogress(rv.remoteDeviceJobId);
  }

  async waitRemoteDeviceJobToInprogress(remoteDeviceJobId: RemoteDeviceJobId): Promise<void> {
    while (true) {
      const remoteDeviceJob = await this.dataSource.getRepository(RemoteDeviceJob).findOne({ where: { remoteDeviceJobId } });
      if (!remoteDeviceJob) {
        throw new WebDriverException(HttpStatus.NOT_FOUND, new Error(`Remote device job not found. remoteDeviceJobId: ${remoteDeviceJobId}`), {});
      }

      if (remoteDeviceJob.state === REMOTE_DEVICE_JOB_STATE.IN_PROGRESS) {
        return;
      }

      if (remoteDeviceJob.state === REMOTE_DEVICE_JOB_STATE.FAILURE) {
        throw new WebDriverException(HttpStatus.INTERNAL_SERVER_ERROR, new Error(`Remote device job failed. remoteDeviceJobId: ${remoteDeviceJobId}`), {});
      }

      await new Promise((resolve) => setTimeout(resolve, 3 * 1000));
    }
  }

  // complete remoteDeviceJob
  async handleDeleteSessionRequest(endpointInfo: WebDriverDeleteSessionEndpointInfo, request: RelayRequest): Promise<WebDriverEndpointHandlerResult> {
    const sessionId = endpointInfo.sessionId;
    if (!sessionId) {
      throw new WebDriverException(400, new Error('empty session path'), {});
    }

    const remoteDeviceJob = await this.dataSource.getRepository(RemoteDeviceJob).findOne({ where: { sessionId }, relations: [DEVICE_TABLE_NAME, REMOTE_TABLE_NAME] });
    if (!remoteDeviceJob) {
      throw new WebDriverException(HttpStatus.NOT_FOUND, new Error(`Remote device job not found. sessionId: ${sessionId}`), {});
    }
    const remote = remoteDeviceJob.remote!;
    const remoteWdaInfo = await this.dataSource.getRepository(RemoteWebDriverInfo).findOne({ where: { remoteId: remote.remoteId } });

    const device = remoteDeviceJob.device!;

    await this.dataSource.getRepository(RemoteDeviceJob).update(remoteDeviceJob.remoteDeviceJobId, { state: REMOTE_DEVICE_JOB_STATE.COMPLETE });

    const headers = this.convertHeaders(request.headers);
    return {
      organizationId: device.organizationId,
      projectId: remoteDeviceJob.remote!.projectId,
      remoteDeviceJobId: remoteDeviceJob.remoteDeviceJobId,
      deviceId: device.deviceId,
      platform: device.platform,
      serial: device.serial,
      browserName: remoteWdaInfo!.browserName,
      browserVersion: remoteWdaInfo!.browserVersion,
      sessionId,
      request: {
        path: request.path,
        headers,
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

    // await this.remoteWebDriverService.deleteSession(this.dataSource.manager, sessionId);

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

  // Inprogress remoteDeviceJob
  async handleEachSessionRequest(endpointInfo: WebDriverSessionEndpointInfo, request: RelayRequest): Promise<WebDriverEndpointHandlerResult> {
    const sessionId = endpointInfo.sessionId;
    if (!sessionId) {
      throw new WebDriverException(400, new Error('empty session path'), {});
    }

    const remoteDeviceJob = await this.dataSource.getRepository(RemoteDeviceJob).findOne({ where: { sessionId }, relations: [DEVICE_TABLE_NAME, REMOTE_TABLE_NAME] });
    if (!remoteDeviceJob) {
      throw new WebDriverException(HttpStatus.NOT_FOUND, new Error(`Remote device job not found. sessionId: ${sessionId}`), {});
    }
    const remote = remoteDeviceJob.remote!;
    const remoteWdaInfo = await this.dataSource.getRepository(RemoteWebDriverInfo).findOne({ where: { remoteId: remote.remoteId } });

    const device = remoteDeviceJob.device!;
    await this.dataSource.getRepository(RemoteDeviceJob).update(remoteDeviceJob.remoteDeviceJobId, { lastIntervalTime: new Date() });
    const headers = this.convertHeaders(request.headers);

    return {
      organizationId: device.organizationId,
      projectId: remote!.projectId,
      remoteDeviceJobId: remoteDeviceJob.remoteDeviceJobId,
      deviceId: device.deviceId,
      platform: device.platform,
      serial: device.serial,
      browserName: remoteWdaInfo!.browserName,
      browserVersion: remoteWdaInfo!.browserVersion,
      request: {
        path: request.path,
        headers: headers,
        method: request.method as Method,
        query: request.query,
        reqBody: request.reqBody,
      },
    };
  }

  convertHeaders(requestHeaders: IncomingHttpHeaders): HeaderRecord {
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

  convertRequest(request: Request): RelayRequest {
    const headers = this.convertHeaders(request.headers);
    const subpath = request.url.replace('/remote/wd/hub/', '');
    return {
      path: subpath,
      headers: headers,
      method: request.method as Method,
      query: request.query,
      reqBody: request.body,
    };
  }
}
