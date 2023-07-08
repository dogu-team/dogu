import { RelayResponse } from '@dogu-tech/device-client-common';
import { All, Controller, Delete, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { API_TOKEN_TYPE } from '../auth/auth.types';
import { ApiTokenPermission } from '../auth/decorators';
import { WebDriverService } from './webdriver.service';

@Controller('/remote/wd/hub')
export class WebDriverController {
  constructor(private readonly webdriverService: WebDriverService) {}

  @Post('session')
  @ApiTokenPermission(API_TOKEN_TYPE.WEBDRIVER_AGENT)
  async newSession(@Req() request: Request, @Res() response: Response): Promise<void> {
    const relayResponse = await this.webdriverService.process(request, response);
    this.sendResponse(relayResponse, response);
  }

  @Delete('session/:sessionId')
  async deleteSession(@Req() request: Request, @Res() response: Response): Promise<void> {
    const relayResponse = await this.webdriverService.process(request, response);
    this.sendResponse(relayResponse, response);
  }

  @All('session/:sessionId/*')
  // @ApiTokenPermission(API_TOKEN_TYPE.WEBDRIVER_AGENT)
  async process(@Req() request: Request, @Res() response: Response): Promise<void> {
    const relayResponse = await this.webdriverService.process(request, response);
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
