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
  stringify,
  toISOStringWithTimezone,
} from '@dogu-tech/common';
import { DoguWebDriverCapabilitiesParser, RelayResponse, WebDriverEndPoint, WebDriverSessionEndpointInfo } from '@dogu-tech/device-client-common';
import { All, Controller, Delete, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { Request, Response } from 'express';
import { DataSource } from 'typeorm';
import { RemoteDeviceJob } from '../../../db/entity/remote-device-job.entity';
import { PROJECT_ROLE } from '../../auth/auth.types';
import { RemoteCaller, RemoteProjectPermission } from '../../auth/decorators';
import { FeatureFileService } from '../../feature/file/feature-file.service';
import { DoguLogger } from '../../logger/logger';
import { RemoteException } from '../common/exception';
import { WebDriverEndpointHandlerResult } from '../common/type';
import { RemoteDeviceJobProcessor } from '../processor/remote-device-job-processor';
import { RemoteService } from '../remote.service';
import { RemoteWebDriverBatchRequestExecutor } from './remote-webdriver.batch-request-executor';
import {
  AppiumIsKeyboardShownRemoteWebDriverBatchRequestItem,
  ElementClickRemoteWebDriverBatchRequestItem,
  ElementSendKeysRemoteWebDriverBatchRequestItem,
  FindElementRemoteWebDriverBatchRequestItem,
  GetPageSourceRemoteWebDriverBatchRequestItem,
  GetTimeoutsRemoteWebDriverBatchRequestItem,
  PerformActionsRemoteWebDriverBatchRequestItem,
  TakeScreenshotRemoteWebDriverBatchRequestItem,
} from './remote-webdriver.batch-request-items';
import { onBeforeDeleteSessionResponse, onBeforeNewSessionResponse } from './remote-webdriver.protocols';
import { RemoteWebDriverRequestOptions, RemoteWebDriverService } from './remote-webdriver.service';

@Controller('/remote/wd/hub')
export class RemoteWebDriverInfoController {
  constructor(
    private readonly remoteWebDriverService: RemoteWebDriverService, //
    private readonly remoteService: RemoteService,
    private readonly featureFileService: FeatureFileService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly logger: DoguLogger,
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

  /**
   * @deprecated
   * @description FIXME: henry - this is test code.
   * 1. get page source
   * 2. take screenshot
   * 3. save screenshot to file server
   */
  private async batchTest(processResult: WebDriverEndpointHandlerResult, endpointInfo: WebDriverSessionEndpointInfo, headers: HeaderRecord): Promise<void> {
    const start = Date.now();
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
      const getPageSource = new GetPageSourceRemoteWebDriverBatchRequestItem(batchExecutor, sessionId);
      const takeScreenshot = new TakeScreenshotRemoteWebDriverBatchRequestItem(batchExecutor, sessionId);
      const appiumIsKeyboardShown = new AppiumIsKeyboardShownRemoteWebDriverBatchRequestItem(batchExecutor, sessionId);
      const findElement = new FindElementRemoteWebDriverBatchRequestItem(batchExecutor, sessionId, 'xpath', '//*');
      await batchExecutor.execute();

      await takeScreenshot
        .response()
        .then(async (buffer) => {
          const putResult = await this.featureFileService.put({
            bucketKey: 'organization',
            key: `remote-device-jobs/${processResult.remoteDeviceJobId}/${toISOStringWithTimezone(new Date(), '-')}.png`,
            body: buffer,
            contentType: 'image/png',
          });
          this.logger.debug(`TEST: screenshot url: ${putResult.location}`);
        })
        .catch((error) => {
          this.logger.error(`TEST: screenshot error: ${stringify(error)}`);
        });
      await getPageSource
        .response()
        .then((pageSource) => {
          this.logger.debug(`TEST: pageSource size: ${pageSource.length}`);
        })
        .catch((error) => {
          this.logger.error(`TEST: pageSource error: ${stringify(error)}`);
        });
      await appiumIsKeyboardShown
        .response()
        .then((isKeyboardShown) => {
          this.logger.debug(`TEST: isKeyboardShown: ${isKeyboardShown}`);
        })
        .catch((error) => {
          this.logger.error(`TEST: isKeyboardShown error: ${stringify(error)}`);
        });
      await findElement
        .response()
        .then(async (elementId) => {
          this.logger.debug(`TEST: findElement: ${stringify(elementId)}`);
          const batchExecutor = new RemoteWebDriverBatchRequestExecutor(this.remoteWebDriverService, {
            organizationId,
            projectId,
            deviceId,
            deviceSerial,
            headers,
            parallel: true,
          });
          const click = new ElementClickRemoteWebDriverBatchRequestItem(batchExecutor, sessionId, elementId);
          const sendKeys = new ElementSendKeysRemoteWebDriverBatchRequestItem(batchExecutor, sessionId, elementId, 'test');
          const performActions = new PerformActionsRemoteWebDriverBatchRequestItem(batchExecutor, sessionId, []);
          const getTimeouts = new GetTimeoutsRemoteWebDriverBatchRequestItem(batchExecutor, sessionId);
          await batchExecutor.execute();

          await click
            .response()
            .then(() => {
              this.logger.debug(`TEST: click`);
            })
            .catch((error) => {
              this.logger.error(`TEST: click error: ${stringify(error)}`);
            });
          await sendKeys
            .response()
            .then(() => {
              this.logger.debug(`TEST: sendKeys`);
            })
            .catch((error) => {
              this.logger.error(`TEST: sendKeys error: ${stringify(error)}`);
            });
          await performActions
            .response()
            .then(() => {
              this.logger.debug(`TEST: performActions`);
            })
            .catch((error) => {
              this.logger.error(`TEST: performActions error: ${stringify(error)}`);
            });
          await getTimeouts
            .response()
            .then((timeouts) => {
              this.logger.debug(`TEST: getTimeouts: ${stringify(timeouts)}`);
            })
            .catch((error) => {
              this.logger.error(`TEST: getTimeouts error: ${stringify(error)}`);
            });
        })
        .catch((error) => {
          this.logger.error(`TEST: findElement error: ${stringify(error)}`);
        });
    } catch (error) {
      this.logger.debug(`TEST: batchTest error: ${stringify(error)}`);
    } finally {
      const end = Date.now();
      this.logger.debug(`TEST: batchTest time: ${end - start}ms`);
    }
  }
}
