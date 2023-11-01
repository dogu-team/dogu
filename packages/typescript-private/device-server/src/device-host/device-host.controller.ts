import { Instance } from '@dogu-tech/common';
import { DeleteTempPathRequestBody, DeviceHost, DeviceHostEnsureBrowserAndDriverRequestBody, GetFreePortQuery, ResignAppFileRequestBody } from '@dogu-tech/device-client-common';
import { HostPaths } from '@dogu-tech/node';
import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import fs from 'fs';
import path from 'path';
import { BrowserManagerService } from '../browser-manager/browser-manager.service';
import { getFreePort } from '../internal/util/net';
import { pathMap } from '../path-map';
import { DeviceHostResignAppFileService } from './device-host.resign-app-file';

@Controller(DeviceHost.controller)
export class DeviceHostController {
  constructor(
    private readonly browserManagerService: BrowserManagerService,
    private readonly appFileSerivce: DeviceHostResignAppFileService,
  ) {}

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

  @Get(DeviceHost.getTempPath.path)
  getTempPath(): Instance<typeof DeviceHost.getTempPath.responseBody> {
    return {
      value: {
        $case: 'data',
        data: {
          path: HostPaths.doguTempPath(),
        },
      },
    };
  }

  @Delete(DeviceHost.removeTemp.path)
  async removeTemp(@Body() param: DeleteTempPathRequestBody): Promise<Instance<typeof DeviceHost.removeTemp.responseBody>> {
    const filePathResolved = path.join(HostPaths.doguTempPath(), param.pathUnderTemp);
    const stat = await fs.promises.stat(filePathResolved);
    if (!stat.isFile()) {
      throw new Error(`Path ${filePathResolved} is not a file`);
    }
    await fs.promises.rm(filePathResolved, { force: true });
    return {
      value: {
        $case: 'data',
        data: {},
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
