import { RemotePayload, REMOTE_DEVICE_JOB_SESSION_STATE } from '@dogu-private/types';
import {
  DefaultHttpOptions,
  DoguApplicationFileSizeHeader,
  DoguApplicationUrlHeader,
  DoguApplicationVersionHeader,
  DoguBrowserNameHeader,
  DoguBrowserVersionHeader,
  DoguDevicePlatformHeader,
  DoguDeviceSerialHeader,
  DoguRemoteDeviceJobIdHeader,
  DoguRequestTimeoutHeader,
  HeaderRecord,
} from '@dogu-tech/common';
import { Device, DoguWebDriverCapabilitiesParser, RelayResponse, WebDriverEndPoint, WebDriverSessionEndpointInfo } from '@dogu-tech/device-client-common';
import { All, Controller, Delete, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { Request, Response } from 'express';
import { DataSource } from 'typeorm';
import { RemoteDeviceJob } from '../../../db/entity/remote-device-job.entity';
import { PROJECT_ROLE } from '../../auth/auth.types';
import { RemoteCaller, RemoteProjectPermission } from '../../auth/decorators';
import { DeviceMessageRelayer } from '../../device-message/device-message.relayer';
import { FeatureFileService } from '../../feature/file/feature-file.service';
import { DoguLogger } from '../../logger/logger';
import { RemoteException } from '../common/exception';
import { WebDriverEndpointHandlerResult } from '../common/type';
import { RemoteDeviceJobProcessor } from '../processor/remote-device-job-processor';
import { RemoteService } from '../remote.service';
import {
  AppiumGetContextsRemoteWebDriverBatchRequestItem,
  AppiumGetSystemBarsRemoteWebDriverBatchRequestItem,
  AppiumSetContextRemoteWebDriverBatchRequestItem,
} from './remote-webdriver.appium-batch-request-items';
import { RemoteWebDriverBatchRequestExecutor } from './remote-webdriver.batch-request-executor';
import { onBeforeDeleteSessionResponse, onBeforeNewSessionResponse } from './remote-webdriver.protocols';
import { RemoteWebDriverRequestOptions, RemoteWebDriverService } from './remote-webdriver.service';
import { W3CGetPageSourceRemoteWebDriverBatchRequestItem, W3CNavigateToRemoteWebDriverBatchRequestItem } from './remote-webdriver.w3c-batch-request-items';

@Controller('/remote/wd/hub')
export class RemoteWebDriverInfoController {
  constructor(
    private readonly remoteWebDriverService: RemoteWebDriverService, //
    private readonly remoteService: RemoteService,
    private readonly featureFileService: FeatureFileService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly logger: DoguLogger,
    private readonly deviceMessageRelayer: DeviceMessageRelayer,
  ) {}

  @Post('session')
  @RemoteProjectPermission(PROJECT_ROLE.WRITE)
  async newSession(
    @Req() request: Request, //
    @Res() response: Response,
    @RemoteCaller() remotePayload: RemotePayload,
  ): Promise<void> {
    this.logger.debug(JSON.stringify(remotePayload));

    const relayRequest = this.remoteWebDriverService.convertRequest(request);

    const doguWebDriverCapabilitiesParser = new DoguWebDriverCapabilitiesParser();
    const endpoint = await WebDriverEndPoint.fromRelayRequest(relayRequest, doguWebDriverCapabilitiesParser).catch((e) => {
      throw new RemoteException(HttpStatus.BAD_REQUEST, e, {});
    });
    if (!doguWebDriverCapabilitiesParser.doguOptions) {
      throw new RemoteException(HttpStatus.INTERNAL_SERVER_ERROR, new Error('newSession. doguOptions is null'), {});
    }
    const { doguOptions } = doguWebDriverCapabilitiesParser;
    if (endpoint.info.type !== 'new-session') {
      throw new RemoteException(HttpStatus.BAD_REQUEST, new Error('newSession. endpoint type is not new-session'), {});
    }

    const processResult = await this.remoteWebDriverService.handleNewSessionRequest(endpoint.info, relayRequest, doguOptions, remotePayload);
    await this.remoteWebDriverService.waitRemoteDeviceJobToInprogress(processResult.remoteDeviceJobId);
    // create headers
    const headers: HeaderRecord = {};
    this.setHeaders(headers, processResult);
    headers[DoguRequestTimeoutHeader] = DefaultHttpOptions.request.timeout3minutes.toString();

    try {
      const options: RemoteWebDriverRequestOptions = {
        ...processResult,
        headers,
      };
      const relayResponse = await this.remoteWebDriverService.sendRequest(options);
      await this.remoteWebDriverService.handleNewSessionResponse(processResult, relayResponse);
      onBeforeNewSessionResponse(relayResponse, processResult);
      this.sendResponse(relayResponse, response);
    } catch (e) {
      const remoteDeviceJob = await this.dataSource.getRepository(RemoteDeviceJob).findOne({ where: { remoteDeviceJobId: processResult.remoteDeviceJobId } });
      if (!remoteDeviceJob) {
        throw new RemoteException(
          HttpStatus.NOT_FOUND,
          new Error(`newSession:sendRequest. remote-device-job not found. remote-device-job-id: ${processResult.remoteDeviceJobId}`),
          {},
        );
      }
      await RemoteDeviceJobProcessor.setRemoteDeviceJobSessionState(this.dataSource.manager, remoteDeviceJob, REMOTE_DEVICE_JOB_SESSION_STATE.FAILURE);
      throw new RemoteException(HttpStatus.INTERNAL_SERVER_ERROR, e, {});
    }
  }

  @Delete('session/:sessionId')
  async deleteSession(@Req() request: Request, @Res() response: Response): Promise<void> {
    const relayRequest = this.remoteWebDriverService.convertRequest(request);
    const endpoint = await WebDriverEndPoint.fromRelayRequest(relayRequest).catch((e) => {
      throw new RemoteException(HttpStatus.BAD_REQUEST, e, {});
    });
    if (endpoint.info.type !== 'delete-session') {
      throw new RemoteException(HttpStatus.INTERNAL_SERVER_ERROR, new Error('deleteSession. endpoint type is not delete-session'), {});
    }

    const processResult = await this.remoteWebDriverService.handleDeleteSessionRequest(endpoint.info, relayRequest);
    const headers: HeaderRecord = {};
    this.setHeaders(headers, processResult);
    headers[DoguRequestTimeoutHeader] = DefaultHttpOptions.request.timeout1minutes.toString();

    try {
      const options: RemoteWebDriverRequestOptions = {
        ...processResult,
        headers,
      };
      const relayResponse = await this.remoteWebDriverService.sendRequest(options);
      await this.remoteWebDriverService.handleDeleteSessionResponse(processResult, relayResponse);
      const resultUrl = await this.remoteService.getResultUrl(processResult.remoteDeviceJobId);
      onBeforeDeleteSessionResponse(relayResponse, resultUrl);
      this.sendResponse(relayResponse, response);
    } catch (e) {
      const remoteDeviceJob = await this.dataSource.getRepository(RemoteDeviceJob).findOne({ where: { remoteDeviceJobId: processResult.remoteDeviceJobId } });
      if (!remoteDeviceJob) {
        throw new RemoteException(
          HttpStatus.NOT_FOUND,
          new Error(`deleteSession:sendRequest. remote-device-job not found. remoteDeviceJobId: ${processResult.remoteDeviceJobId}`),
          {},
        );
      }
      if (remoteDeviceJob.sessionState !== REMOTE_DEVICE_JOB_SESSION_STATE.FAILURE) {
        await RemoteDeviceJobProcessor.setRemoteDeviceJobSessionState(this.dataSource.manager, remoteDeviceJob, REMOTE_DEVICE_JOB_SESSION_STATE.FAILURE);
      }
      throw new RemoteException(HttpStatus.INTERNAL_SERVER_ERROR, e, {});
    }
  }

  @All('session/:sessionId/*')
  async process(@Req() request: Request, @Res() response: Response): Promise<void> {
    const relayRequest = this.remoteWebDriverService.convertRequest(request);
    const endpoint = await WebDriverEndPoint.fromRelayRequest(relayRequest).catch((e) => {
      throw new RemoteException(HttpStatus.BAD_REQUEST, e, {});
    });
    if (endpoint.info.type !== 'session') {
      throw new RemoteException(HttpStatus.INTERNAL_SERVER_ERROR, new Error('process. endpoint type is not session'), {});
    }
    const processResult = await this.remoteWebDriverService.handleEachSessionRequest(endpoint.info, relayRequest);
    const headers: HeaderRecord = {};
    this.setHeaders(headers, processResult);
    headers[DoguRequestTimeoutHeader] = DefaultHttpOptions.request.timeout1minutes.toString();

    try {
      await this.test(processResult, endpoint.info, headers);

      const options: RemoteWebDriverRequestOptions = {
        ...processResult,
        headers,
      };
      const relayResponse = await this.remoteWebDriverService.sendRequest(options);
      this.sendResponse(relayResponse, response);
    } catch (e) {
      const remoteDeviceJob = await this.dataSource.getRepository(RemoteDeviceJob).findOne({ where: { remoteDeviceJobId: processResult.remoteDeviceJobId } });
      if (!remoteDeviceJob) {
        throw new RemoteException(HttpStatus.NOT_FOUND, new Error(`process:sendRequest. remote-device-job not found. remoteDeviceJobId: ${processResult.remoteDeviceJobId}`), {});
      }
      if (remoteDeviceJob.sessionState !== REMOTE_DEVICE_JOB_SESSION_STATE.FAILURE) {
        await RemoteDeviceJobProcessor.setRemoteDeviceJobSessionState(this.dataSource.manager, remoteDeviceJob, REMOTE_DEVICE_JOB_SESSION_STATE.FAILURE);
      }
      throw new RemoteException(HttpStatus.INTERNAL_SERVER_ERROR, e, {});
    }
  }

  private sendResponse<T>(res: RelayResponse, response: Response): void {
    for (const headKey of Object.keys(res.headers)) {
      response.setHeader(headKey, res.headers[headKey]!);
    }
    response.status(res.status);
    response.send(res.resBody);
  }

  private setHeaders(headers: HeaderRecord, processResult: WebDriverEndpointHandlerResult): void {
    headers[DoguRemoteDeviceJobIdHeader] = processResult.remoteDeviceJobId;
    headers[DoguDevicePlatformHeader] = processResult.devicePlatform;
    headers[DoguDeviceSerialHeader] = processResult.deviceSerial;
    headers[DoguRequestTimeoutHeader] = DefaultHttpOptions.request.timeout3minutes.toString();
    if (processResult.applicationUrl) headers[DoguApplicationUrlHeader] = processResult.applicationUrl;
    if (processResult.applicationVersion) headers[DoguApplicationVersionHeader] = processResult.applicationVersion;
    if (processResult.applicationFileSize) headers[DoguApplicationFileSizeHeader] = processResult.applicationFileSize.toString();
    if (processResult.browserName) headers[DoguBrowserNameHeader] = processResult.browserName;
    if (processResult.browserVersion) headers[DoguBrowserVersionHeader] = processResult.browserVersion;
  }

  private async test(processResult: WebDriverEndpointHandlerResult, endpointInfo: WebDriverSessionEndpointInfo, headers: HeaderRecord): Promise<void> {
    try {
      const { sessionId } = endpointInfo;
      const { organizationId, projectId, deviceId, deviceSerial } = processResult;
      const batchExecutor = new RemoteWebDriverBatchRequestExecutor(this.remoteWebDriverService, {
        organizationId,
        projectId,
        deviceId,
        deviceSerial,
        headers,
        parallel: true,
      });
      const w3cNavigateTo = new W3CNavigateToRemoteWebDriverBatchRequestItem(batchExecutor, sessionId, 'https://dogutech.io');
      const appiumGetContexts = new AppiumGetContextsRemoteWebDriverBatchRequestItem(batchExecutor, sessionId);
      const appiumGetSystemBars = new AppiumGetSystemBarsRemoteWebDriverBatchRequestItem(batchExecutor, sessionId);
      await batchExecutor.execute();
      const contexts = await appiumGetContexts.response();
      const systemBars = await appiumGetSystemBars.response();

      const systemBarVisibility = await this.deviceMessageRelayer.sendHttpRequest(
        organizationId,
        deviceId,
        'GET',
        Device.getSystemBarVisibility.resolvePath(new Device.getSystemBarVisibility.pathProvider(deviceSerial)),
        undefined,
        undefined,
        undefined,
        Device.getSystemBarVisibility.responseBodyData,
      );

      for (const context of contexts) {
        const subExecutor = batchExecutor.new({ parallel: false });
        const appiumSetContext = new AppiumSetContextRemoteWebDriverBatchRequestItem(subExecutor, sessionId, context);
        const w3cGetPageSource = new W3CGetPageSourceRemoteWebDriverBatchRequestItem(subExecutor, sessionId);
        await subExecutor.execute();
        await appiumSetContext.response();
        const pageSource = await w3cGetPageSource.response();
        this.logger.debug(`TEST: ${context} ${pageSource.length}`);
      }
    } catch (error) {
      this.logger.debug(`TEST ERROR: ${error}`);
    }
  }
}
