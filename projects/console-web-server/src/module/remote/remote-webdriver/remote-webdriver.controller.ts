import {
  DefaultHttpOptions,
  DoguBrowserNameHeader,
  DoguBrowserVersionHeader,
  DoguRemoteDeviceJobIdHeader,
  DoguRemotePlatformHeader,
  DoguRemoteSerialHeader,
  DoguRequestTimeoutHeader,
  HeaderRecord,
} from '@dogu-tech/common';
import { RelayResponse, WebDriverEndPoint } from '@dogu-tech/device-client-common';
import { All, Controller, Delete, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { API_TOKEN_TYPE } from '../../auth/auth.types';
import { ApiTokenPermission } from '../../auth/decorators';
import { WebDriverException } from '../../webdriver/webdriver.exception';
import { WebDriverService } from '../../webdriver/webdriver.service';

@Controller('/remote/wd/hub')
export class RemoteWebDriverInfoController {
  constructor(private readonly webdriverService: WebDriverService) {}

  @Post('session')
  @ApiTokenPermission(API_TOKEN_TYPE.WEBDRIVER_AGENT)
  async newSession(@Req() request: Request, @Res() response: Response): Promise<void> {
    const relayRequest = this.webdriverService.convertRequest(request);
    const endpoint = await WebDriverEndPoint.create(relayRequest).catch((e) => {
      throw new WebDriverException(400, e, {});
    });
    if (endpoint.info.type !== 'new-session') {
      throw new WebDriverException(400, new Error('Internal error. endpoint type is not new-session'), {});
    }

    const processResult = await this.webdriverService.handleNewSessionRequest(endpoint.info, relayRequest);

    const headers: HeaderRecord = {};
    headers[DoguRequestTimeoutHeader] = DefaultHttpOptions.request.timeout3minutes.toString();
    headers[DoguRemoteDeviceJobIdHeader] = processResult.remoteDeviceJobId;
    headers[DoguRemoteSerialHeader] = processResult.serial;
    headers[DoguRemotePlatformHeader] = processResult.platform.toString();

    if (processResult.browserName) headers[DoguBrowserNameHeader] = processResult.browserName;
    if (processResult.browserVersion) headers[DoguBrowserVersionHeader] = processResult.browserVersion;

    const relayResponse = await this.webdriverService.sendRequest(processResult, headers);
    await this.webdriverService.handleNewSessionResponse(processResult, relayResponse);
    await this.sendResponse(relayResponse, response);
  }

  @Delete('session/:sessionId')
  async deleteSession(@Req() request: Request, @Res() response: Response): Promise<void> {
    const relayRequest = this.webdriverService.convertRequest(request);
    const endpoint = await WebDriverEndPoint.create(relayRequest).catch((e) => {
      throw new WebDriverException(400, e, {});
    });
    if (endpoint.info.type !== 'delete-session') {
      throw new WebDriverException(400, new Error('Internal error. endpoint type is not delete-session'), {});
    }
    const processResult = await this.webdriverService.handleDeleteSessionRequest(endpoint.info, relayRequest);
    const headers: HeaderRecord = {};
    headers[DoguRequestTimeoutHeader] = DefaultHttpOptions.request.timeout1minutes.toString();
    /**
     * FIXME: henry - temporary test
     */
    headers[DoguRemoteDeviceJobIdHeader] = 'dogu';

    const relayResponse = await this.webdriverService.sendRequest(processResult, headers);
    await this.webdriverService.handleDeleteSessionResponse(processResult, relayResponse);
    this.sendResponse(relayResponse, response);
  }

  @All('session/:sessionId/*')
  // @ApiTokenPermission(API_TOKEN_TYPE.WEBDRIVER_AGENT)
  async process(@Req() request: Request, @Res() response: Response): Promise<void> {
    const relayRequest = this.webdriverService.convertRequest(request);
    const endpoint = await WebDriverEndPoint.create(relayRequest).catch((e) => {
      throw new WebDriverException(400, e, {});
    });
    if (endpoint.info.type !== 'session') {
      throw new WebDriverException(400, new Error('Internal error. endpoint type is not session'), {});
    }
    const processResult = await this.webdriverService.handleEachSessionRequest(endpoint.info, relayRequest);
    const headers: HeaderRecord = {};
    headers[DoguRequestTimeoutHeader] = DefaultHttpOptions.request.timeout1minutes.toString();
    /**
     * FIXME: henry - test
     */
    headers[DoguRemoteDeviceJobIdHeader] = 'dogu';

    const relayResponse = await this.webdriverService.sendRequest(processResult, headers);
    this.sendResponse(relayResponse, response);
  }

  private sendResponse<T>(res: RelayResponse, response: Response): void {
    for (const headKey of Object.keys(res.headers)) {
      response.setHeader(headKey, res.headers[headKey]!);
    }
    response.status(res.status);
    response.send(res.resBody);
  }
}
