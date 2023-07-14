import { DeviceId, DEVICE_TABLE_NAME, extensionFromPlatform, platformTypeFromPlatform, RemoteDeviceJobId, REMOTE_DEVICE_JOB_STATE, REMOTE_TABLE_NAME } from '@dogu-private/types';
import { HeaderRecord, Method } from '@dogu-tech/common';
import {
  DeviceWebDriver,
  DoguWebDriverOptions,
  RelayRequest,
  RelayResponse,
  WebDriverDeleteSessionEndpointInfo,
  WebDriverNewSessionEndpointInfo,
  WebDriverSessionEndpointInfo,
} from '@dogu-tech/device-client-common';
import { forwardRef, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { Request } from 'express';
import { IncomingHttpHeaders } from 'http';
import { DataSource } from 'typeorm';
import { v4 } from 'uuid';
import { Device } from '../../../db/entity/device.entity';
import { RemoteDeviceJob } from '../../../db/entity/remote-device-job.entity';
import { RemoteWebDriverInfo } from '../../../db/entity/remote-webdriver-info.entity';
import { DeviceMessageRelayer } from '../../device-message/device-message.relayer';
import { DoguLogger } from '../../logger/logger';
import { DeviceStatusService } from '../../organization/device/device-status.service';
import { ApplicationService } from '../../project/application/application.service';
import { FindProjectApplicationDto } from '../../project/application/dto/application.dto';
import { RemoteException } from '../common/exception';
import { WebDriverEndpointHandlerResult } from '../common/type';
import { RemoteDeviceJobProcessor } from '../processor/remote-device-job-processor';

@Injectable()
export class RemoteWebDriverService {
  constructor(
    @Inject(forwardRef(() => DeviceStatusService))
    private readonly deviceStatusService: DeviceStatusService,
    @InjectDataSource()
    private readonly dataSource: DataSource, //
    @Inject(DeviceMessageRelayer)
    private readonly deviceMessageRelayer: DeviceMessageRelayer,
    @Inject(ApplicationService)
    private readonly applicationService: ApplicationService,

    private readonly logger: DoguLogger,
  ) {}

  async sendRequest(processResult: WebDriverEndpointHandlerResult, headers: HeaderRecord = {}): Promise<RelayResponse> {
    try {
      const pathProvider = new DeviceWebDriver.relayHttp.pathProvider(processResult.deviceSerial);
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
      throw new RemoteException(500, e, {});
    }
  }

  async handleNewSessionRequest(endpointInfo: WebDriverNewSessionEndpointInfo, request: RelayRequest, doguOptions: DoguWebDriverOptions): Promise<WebDriverEndpointHandlerResult> {
    const options = doguOptions;

    // find device
    const runsOn = options['runs-on'];
    const deviceTagOrNames = Array.isArray(runsOn) ? runsOn : typeof runsOn === 'string' ? [runsOn] : [];
    if (deviceTagOrNames.length === 0) {
      throw new RemoteException(HttpStatus.BAD_REQUEST, new Error('Device tag or name not specified'), {});
    }

    const deviceIds: DeviceId[] = [];
    for (const tagOrName of deviceTagOrNames) {
      const deviceByName = await this.dataSource.getRepository(Device).findOne({ where: { organizationId: options.organizationId, name: tagOrName } });
      if (deviceByName) {
        deviceIds.push(deviceByName.deviceId);
        continue;
      } else {
        const devicesByTag = await this.deviceStatusService.findDevicesByDeviceTag(this.dataSource.manager, options.organizationId, options.projectId, [tagOrName]);
        if (devicesByTag.length === 0) {
          throw new RemoteException(HttpStatus.NOT_FOUND, new Error(`Device not found. Device name: ${tagOrName}, Device tag: ${deviceTagOrNames.join(', ')}`), {});
        }
        const deviceIdsByTag = devicesByTag.map((device) => device.deviceId);
        deviceIds.push(...deviceIdsByTag);
      }
    }
    const sortDevicesByRunningRate = await this.deviceStatusService.sortDevicesByRunningRate(deviceIds);
    const device = sortDevicesByRunningRate[0];

    const devicePlatformType = platformTypeFromPlatform(device.platform);
    const headers = this.convertHeaders(request.headers);

    let applicationUrl: string | undefined = undefined;
    let applicationVersion: string | undefined = undefined;
    if (devicePlatformType === 'android' || devicePlatformType === 'ios') {
      if (!options.appVersion) {
        throw new RemoteException(400, new Error('App version not specified'), {});
      }

      const findAppDto = new FindProjectApplicationDto();
      findAppDto.version = options.appVersion;
      findAppDto.extension = extensionFromPlatform(devicePlatformType);
      const applications = await this.applicationService.getApplicationList(options.organizationId, options.projectId, findAppDto);
      if (applications.items.length === 0) {
        throw new RemoteException(400, new Error('Application not found'), {});
      }
      const application = applications.items[0];
      applicationUrl = await this.applicationService.getApplicationDownladUrl(application.projectApplicationId, options.organizationId, options.projectId);
      applicationVersion = application.version;
    }

    return {
      organizationId: options.organizationId,
      remoteDeviceJobId: v4(),
      projectId: options.projectId,
      deviceId: device.deviceId,
      devicePlatform: devicePlatformType,
      deviceSerial: device.serial,
      browserName: options.browserName,
      browserVersion: options.browserVersion,
      applicationUrl,
      applicationVersion,
      request: {
        path: request.path,
        headers: headers,
        method: request.method as Method,
        query: request.query,
        reqBody: endpointInfo.capabilities,
      },
    };
  }

  async handleNewSessionResponse(handleResult: WebDriverEndpointHandlerResult, response: RelayResponse): Promise<void> {
    if (response.status !== 200) {
      return;
    }
    const sessionId = (response.resBody as any)?.value?.sessionId as string;
    if (!sessionId) {
      throw new RemoteException(400, new Error('Session id not found in response'), {});
    }

    const rv = await this.dataSource.manager.transaction(async (manager) => {
      const remoteDeviceJob = await RemoteDeviceJobProcessor.createWebdriverRemoteDeviceJob(
        manager,
        handleResult.projectId,
        handleResult.deviceId,
        handleResult.remoteDeviceJobId,
        sessionId,
        handleResult.browserName ?? null,
        handleResult.browserVersion ?? null,
      );
      return remoteDeviceJob;
    });
  }

  async waitRemoteDeviceJobToInprogress(remoteDeviceJobId: RemoteDeviceJobId): Promise<void> {
    while (true) {
      const remoteDeviceJob = await this.dataSource.getRepository(RemoteDeviceJob).findOne({ where: { remoteDeviceJobId } });
      if (!remoteDeviceJob) {
        throw new RemoteException(HttpStatus.NOT_FOUND, new Error(`Remote device job not found. remoteDeviceJobId: ${remoteDeviceJobId}`), {});
      }

      if (remoteDeviceJob.state === REMOTE_DEVICE_JOB_STATE.IN_PROGRESS) {
        return;
      }

      if (remoteDeviceJob.state === REMOTE_DEVICE_JOB_STATE.FAILURE) {
        throw new RemoteException(HttpStatus.INTERNAL_SERVER_ERROR, new Error(`Remote device job failed. remoteDeviceJobId: ${remoteDeviceJobId}`), {});
      }

      await new Promise((resolve) => setTimeout(resolve, 3 * 1000));
    }
  }

  // complete remoteDeviceJob
  async handleDeleteSessionRequest(endpointInfo: WebDriverDeleteSessionEndpointInfo, request: RelayRequest): Promise<WebDriverEndpointHandlerResult> {
    const sessionId = endpointInfo.sessionId;
    if (!sessionId) {
      throw new RemoteException(400, new Error('empty session path'), {});
    }

    const remoteDeviceJob = await this.dataSource.getRepository(RemoteDeviceJob).findOne({ where: { sessionId }, relations: [DEVICE_TABLE_NAME, REMOTE_TABLE_NAME] });
    if (!remoteDeviceJob) {
      throw new RemoteException(HttpStatus.NOT_FOUND, new Error(`Remote device job not found. sessionId: ${sessionId}`), {});
    }
    const remote = remoteDeviceJob.remote!;
    const remoteWdaInfo = await this.dataSource.getRepository(RemoteWebDriverInfo).findOne({ where: { remoteId: remote.remoteId } });

    const device = remoteDeviceJob.device!;

    await RemoteDeviceJobProcessor.setRemoteDeviceJobState(this.dataSource.manager, remoteDeviceJob, REMOTE_DEVICE_JOB_STATE.COMPLETE);

    const headers = this.convertHeaders(request.headers);
    const devicePlatform = platformTypeFromPlatform(device.platform);
    return {
      organizationId: device.organizationId,
      projectId: remoteDeviceJob.remote!.projectId,
      remoteDeviceJobId: remoteDeviceJob.remoteDeviceJobId,
      deviceId: device.deviceId,
      devicePlatform,
      deviceSerial: device.serial,
      browserName: remoteWdaInfo!.browserName ?? undefined,
      browserVersion: remoteWdaInfo!.browserVersion ?? undefined,
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
      throw new RemoteException(400, new Error('Session id not found when deleting'), {});
    }
    const pathProvider = new DeviceWebDriver.sessionDeleted.pathProvider(handleResult.deviceSerial);
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
      throw new RemoteException(400, new Error('empty session path'), {});
    }

    const remoteDeviceJob = await this.dataSource.getRepository(RemoteDeviceJob).findOne({ where: { sessionId }, relations: [DEVICE_TABLE_NAME, REMOTE_TABLE_NAME] });
    if (!remoteDeviceJob) {
      throw new RemoteException(HttpStatus.NOT_FOUND, new Error(`Remote device job not found. sessionId: ${sessionId}`), {});
    }
    const remote = remoteDeviceJob.remote!;
    const remoteWdaInfo = await this.dataSource.getRepository(RemoteWebDriverInfo).findOne({ where: { remoteId: remote.remoteId } });

    const device = remoteDeviceJob.device!;

    await RemoteDeviceJobProcessor.setRemoteDeviceJobLastIntervalTime(this.dataSource.manager, remoteDeviceJob);
    const headers = this.convertHeaders(request.headers);
    const devicePlatform = platformTypeFromPlatform(device.platform);
    return {
      organizationId: device.organizationId,
      projectId: remote!.projectId,
      remoteDeviceJobId: remoteDeviceJob.remoteDeviceJobId,
      deviceId: device.deviceId,
      devicePlatform,
      deviceSerial: device.serial,
      browserName: remoteWdaInfo!.browserName ?? undefined,
      browserVersion: remoteWdaInfo!.browserVersion ?? undefined,
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
