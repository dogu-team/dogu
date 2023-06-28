import { All, Controller, Req, Res } from '@nestjs/common';
import axios from 'axios';
import { Request, Response } from 'express';
import { WebDriverService } from './webdriver.service';

@Controller('/wd/hub/*')
export class WebDriverController {
  constructor(private readonly webdriverService: WebDriverService) {}

  @All()
  async process(@Req() request: Request, @Res() response: Response): Promise<void> {
    console.log(request);
    console.log(`method ${request.method}`);
    const subpath = request.url.replace('/wd/hub/', '');
    const url = `http://localhost:51234/${subpath}`;
    switch (request.method) {
      case 'GET': {
        const res = await axios.get(url);
        this.sendResponse(res, response);
        return;
      }
      case 'POST': {
        const res = await axios.post(url, request.body);
        this.sendResponse(res, response);
        return;
      }
      case 'PUT': {
        const res = await axios.put(url, request.body);
        this.sendResponse(res, response);
        return;
      }
      case 'PATCH': {
        const res = await axios.patch(url, request.body);
        this.sendResponse(res, response);
        return;
      }
      case 'HEAD': {
        const res = await axios.head(url);
        this.sendResponse(res, response);
        return;
      }
    }
    return Promise.resolve();
  }

  private parseSessionRequest(request: Request) {
    const subpath = request.url.replace('/wd/hub/', '');
    if (subpath === 'session') {
      const { capabilities } = request.body;
    }
  }

  private sendResponse<T>(res: axios.AxiosResponse<T>, response: Response): void {
    for (const headKey of Object.keys(res.headers)) {
      response.setHeader(headKey, res.headers[headKey]);
    }
    response.status(res.status);
    response.send(res.data);
  }
}
