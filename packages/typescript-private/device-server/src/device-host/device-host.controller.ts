import { Instance } from '@dogu-tech/common';
import { DeviceHost, DeviceHostEnsureBrowserAndDriverRequestBody, GetFreePortQuery, ResignAppFileRequestBody } from '@dogu-tech/device-client-common';
import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { BrowserManagerService } from '../browser-manager/browser-manager.service';
import { getFreePort } from '../internal/util/net';
import { pathMap } from '../path-map';
import { DeviceHostResignAppFileService } from './device-host.resign-app-file';

@Controller(DeviceHost.controller)
export class DeviceHostController {
  constructor(private readonly browserManagerService: BrowserManagerService, private readonly appFileSerivce: DeviceHostResignAppFileService) {}

  @Get(DeviceHost.getFreePort.path)
  async getFreePort(@Query() query: GetFreePortQuery): Promise<Instance<typeof DeviceHost.getFreePort.responseBody>> {
    const { excludes, offset } = query;
    const port = await getFreePort(excludes, offset);
    return {
      value: {
        $case: 'data',
        data: {
          port,
        },
      },
    };
  }

  @Get(DeviceHost.getPathMap.path)
  getPathMap(): Instance<typeof DeviceHost.getPathMap.responseBody> {
    return {
      value: {
        $case: 'data',
        data: {
          pathMap: pathMap(),
        },
      },
    };
  }

  @Post(DeviceHost.ensureBrowserAndDriver.path)
  async ensureBrowserAndDriver(@Body() options: DeviceHostEnsureBrowserAndDriverRequestBody): Promise<Instance<typeof DeviceHost.ensureBrowserAndDriver.responseBody>> {
    const result = await this.browserManagerService.ensureBrowserAndDriver(options);
    return {
      value: {
        $case: 'data',
        data: result,
      },
    };
  }

  @Post(DeviceHost.resignAppFile.path)
  async resignAppFile(@Body() body: ResignAppFileRequestBody): Promise<Instance<typeof DeviceHost.resignAppFile.responseBody>> {
    const result = await this.appFileSerivce.queueResign(body);
    return {
      value: {
        $case: 'data',
        data: result,
      },
    };
  }
}
