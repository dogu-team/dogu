import { RelayResponse } from '@dogu-tech/device-client-common';
import { All, Controller, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { WebDriverService } from './webdriver.service';

@Controller('/wd/hub/*')
export class WebDriverController {
  constructor(private readonly webdriverService: WebDriverService) {}

  @All()
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
