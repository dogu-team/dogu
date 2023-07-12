import { HeaderRecord, Method } from '@dogu-tech/common';
import { RelayRequest, RelayResponse, WebDriverEndPoint } from '@dogu-tech/device-client-common';
import { All, Controller, Delete, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { IncomingHttpHeaders } from 'http';
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
    const relayRequest = convertRequest(request);
    const endpoint = await WebDriverEndPoint.create(relayRequest).catch((e) => {
      throw new WebDriverException(400, e, {});
    });
    if (endpoint.info.type !== 'new-session') {
      throw new WebDriverException(400, new Error('Internal error. endpoint type is not new-session'), {});
    }
    const processResult = await this.webdriverService.handleNewSessionRequest(endpoint.info, relayRequest);
    const relayResponse = await this.webdriverService.sendRequest(processResult);
    await this.webdriverService.handleNewSessionResponse(processResult, relayResponse);
    this.sendResponse(relayResponse, response);
  }

  @Delete('session/:sessionId')
  async deleteSession(@Req() request: Request, @Res() response: Response): Promise<void> {
    const relayRequest = convertRequest(request);
    const endpoint = await WebDriverEndPoint.create(relayRequest).catch((e) => {
      throw new WebDriverException(400, e, {});
    });
    if (endpoint.info.type !== 'delete-session') {
      throw new WebDriverException(400, new Error('Internal error. endpoint type is not delete-session'), {});
    }
    const processResult = await this.webdriverService.handleDeleteSessionRequest(endpoint.info, relayRequest);
    const relayResponse = await this.webdriverService.sendRequest(processResult);
    await this.webdriverService.handleDeleteSessionResponse(processResult, relayResponse);
    this.sendResponse(relayResponse, response);
  }

  @All('session/:sessionId/*')
  // @ApiTokenPermission(API_TOKEN_TYPE.WEBDRIVER_AGENT)
  async process(@Req() request: Request, @Res() response: Response): Promise<void> {
    const relayRequest = convertRequest(request);
    const endpoint = await WebDriverEndPoint.create(relayRequest).catch((e) => {
      throw new WebDriverException(400, e, {});
    });
    if (endpoint.info.type !== 'session') {
      throw new WebDriverException(400, new Error('Internal error. endpoint type is not session'), {});
    }
    const processResult = await this.webdriverService.handleEachSessionRequest(endpoint.info, relayRequest);
    const relayResponse = await this.webdriverService.sendRequest(processResult);
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

function convertRequest(request: Request): RelayRequest {
  const headers = convertHeaders(request.headers);
  const subpath = request.url.replace('/remote/wd/hub/', '');
  return {
    path: subpath,
    headers: headers,
    method: request.method as Method,
    query: request.query,
    reqBody: request.body,
  };
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
