import {
  DefaultHttpOptions,
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
import { DoguWebDriverCapabilitiesParser, RelayResponse, WebDriverEndPoint } from '@dogu-tech/device-client-common';
import { All, Controller, Delete, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { API_TOKEN_TYPE } from '../../auth/auth.types';
import { ApiTokenPermission } from '../../auth/decorators';
import { DoguLogger } from '../../logger/logger';
import { RemoteException } from '../common/exception';
import { WebDriverEndpointHandlerResult } from '../common/type';
import { RemoteWebDriverService } from './remote-webdriver.service';

@Controller('/remote/wd/hub')
export class RemoteWebDriverInfoController {
  constructor(
    private readonly remoteWebDriverService: RemoteWebDriverService, //
    private readonly logger: DoguLogger,
  ) {}

  @Post('session')
  @ApiTokenPermission(API_TOKEN_TYPE.WEBDRIVER_AGENT)
  async newSession(@Req() request: Request, @Res() response: Response): Promise<void> {
    const relayRequest = this.remoteWebDriverService.convertRequest(request);

    const doguWebDriverCapabilitiesParser = new DoguWebDriverCapabilitiesParser();
    const endpoint = await WebDriverEndPoint.create(relayRequest, doguWebDriverCapabilitiesParser).catch((e) => {
      throw new RemoteException(HttpStatus.BAD_REQUEST, e, {});
    });
    if (!doguWebDriverCapabilitiesParser.doguOptions) {
      throw new RemoteException(HttpStatus.INTERNAL_SERVER_ERROR, new Error('newSession. doguOptions is null'), {});
    }
    const { doguOptions } = doguWebDriverCapabilitiesParser;
    if (endpoint.info.type !== 'new-session') {
      throw new RemoteException(HttpStatus.BAD_REQUEST, new Error('newSession. endpoint type is not new-session'), {});
    }

    const processResult = await this.remoteWebDriverService.handleNewSessionRequest(endpoint.info, relayRequest, doguOptions);

    // create headers
    const headers: HeaderRecord = {};
    this.setHeaders(headers, processResult);
    headers[DoguRequestTimeoutHeader] = DefaultHttpOptions.request.timeout3minutes.toString();

    const relayResponse = await this.remoteWebDriverService.sendRequest(processResult, headers);
    await this.remoteWebDriverService.handleNewSessionResponse(processResult, relayResponse);
    await this.remoteWebDriverService.waitRemoteDeviceJobToInprogress(processResult.remoteDeviceJobId);
    this.sendResponse(relayResponse, response);
  }

  @Delete('session/:sessionId')
  async deleteSession(@Req() request: Request, @Res() response: Response): Promise<void> {
    const relayRequest = this.remoteWebDriverService.convertRequest(request);
    const endpoint = await WebDriverEndPoint.create(relayRequest).catch((e) => {
      throw new RemoteException(HttpStatus.BAD_REQUEST, e, {});
    });
    if (endpoint.info.type !== 'delete-session') {
      throw new RemoteException(HttpStatus.INTERNAL_SERVER_ERROR, new Error('deleteSession. endpoint type is not delete-session'), {});
    }
    const processResult = await this.remoteWebDriverService.handleDeleteSessionRequest(endpoint.info, relayRequest);
    const headers: HeaderRecord = {};
    this.setHeaders(headers, processResult);
    headers[DoguRequestTimeoutHeader] = DefaultHttpOptions.request.timeout1minutes.toString();

    const relayResponse = await this.remoteWebDriverService.sendRequest(processResult, headers);
    await this.remoteWebDriverService.handleDeleteSessionResponse(processResult, relayResponse);
    this.sendResponse(relayResponse, response);
  }

  @All('session/:sessionId/*')
  // @ApiTokenPermission(API_TOKEN_TYPE.WEBDRIVER_AGENT)
  async process(@Req() request: Request, @Res() response: Response): Promise<void> {
    const relayRequest = this.remoteWebDriverService.convertRequest(request);
    const endpoint = await WebDriverEndPoint.create(relayRequest).catch((e) => {
      throw new RemoteException(HttpStatus.BAD_REQUEST, e, {});
    });
    if (endpoint.info.type !== 'session') {
      throw new RemoteException(HttpStatus.INTERNAL_SERVER_ERROR, new Error('process. endpoint type is not session'), {});
    }
    const processResult = await this.remoteWebDriverService.handleEachSessionRequest(endpoint.info, relayRequest);
    const headers: HeaderRecord = {};
    this.setHeaders(headers, processResult);
    headers[DoguRequestTimeoutHeader] = DefaultHttpOptions.request.timeout1minutes.toString();

    const relayResponse = await this.remoteWebDriverService.sendRequest(processResult, headers);
    this.sendResponse(relayResponse, response);
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
    if (processResult.browserName) headers[DoguBrowserNameHeader] = processResult.browserName;
    if (processResult.browserVersion) headers[DoguBrowserVersionHeader] = processResult.browserVersion;
  }
}
