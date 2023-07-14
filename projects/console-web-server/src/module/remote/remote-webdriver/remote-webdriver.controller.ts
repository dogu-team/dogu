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

    // parse capabilities then create endpoint and doguOptions
    const doguWebDriverCapabilitiesParser = new DoguWebDriverCapabilitiesParser();
    const endpoint = await WebDriverEndPoint.create(relayRequest, doguWebDriverCapabilitiesParser).catch((e) => {
      throw new WebDriverException(400, e, {});
    });
    if (!doguWebDriverCapabilitiesParser.doguOptions) {
      throw new WebDriverException(500, new Error('Internal error. doguOptions is null'), {});
    }
    const { doguOptions } = doguWebDriverCapabilitiesParser;
    if (endpoint.info.type !== 'new-session') {
      throw new WebDriverException(400, new Error('Internal error. endpoint type is not new-session'), {});
    }

    const processResult = await this.webdriverService.handleNewSessionRequest(endpoint.info, relayRequest, doguOptions);

    // create headers
    const headers: HeaderRecord = {};
    headers[DoguRequestTimeoutHeader] = DefaultHttpOptions.request.timeout3minutes.toString();

    // FIXME: henry - temporary test
    // headers[DoguRemoteDeviceJobIdHeader] = processResult.remoteDeviceJobId;
    headers[DoguRemoteDeviceJobIdHeader] = 'dogu';

    headers[DoguDevicePlatformHeader] = processResult.devicePlatform;
    headers[DoguDeviceSerialHeader] = processResult.deviceSerial;
    if (processResult.applicationUrl) headers[DoguApplicationUrlHeader] = processResult.applicationUrl;
    if (processResult.applicationVersion) headers[DoguApplicationVersionHeader] = processResult.applicationVersion;
    if (processResult.browserName) headers[DoguBrowserNameHeader] = processResult.browserName;
    if (processResult.browserVersion) headers[DoguBrowserVersionHeader] = processResult.browserVersion;

    const relayResponse = await this.webdriverService.sendRequest(processResult, headers);
    await this.webdriverService.handleNewSessionResponse(processResult, relayResponse);
    this.sendResponse(relayResponse, response);
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
