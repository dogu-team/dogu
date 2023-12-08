import { Instance } from '@dogu-tech/common';
import { DeleteTempPathRequestBody, DeviceHost, DeviceHostEnsureBrowserAndDriverRequestBody, GetFreePortQuery, ResignAppFileRequestBody } from '@dogu-tech/device-client-common';
import { HostPaths } from '@dogu-tech/node';
import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import fs from 'fs';
import path from 'path';
import { DevicePermission } from '../auth/decorators';
import { BrowserManagerService } from '../browser-manager/browser-manager.service';
import { getFreePort } from '../internal/util/net';
import { pathMap } from '../path-map';
import { validateFilePath } from '../validation/file-path-validation';
import { DeviceHostResignAppFileService } from './device-host.resign-app-file';

@Controller(DeviceHost.controller)
export class DeviceHostController {
  constructor(
    private readonly browserManagerService: BrowserManagerService,
    private readonly appFileSerivce: DeviceHostResignAppFileService,
  ) {}

  @Get(DeviceHost.getFreePort.path)
  @DevicePermission({ allowAdmin: true, allowTemporary: 'exist' })
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
  @DevicePermission({ allowAdmin: true, allowTemporary: 'exist' })
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
  @DevicePermission({ allowAdmin: true, allowTemporary: 'exist' })
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
  @DevicePermission({ allowAdmin: true, allowTemporary: 'exist' })
  async removeTemp(@Body() param: DeleteTempPathRequestBody): Promise<Instance<typeof DeviceHost.removeTemp.responseBody>> {
    const filePathResolved = path.join(HostPaths.doguTempPath(), param.pathUnderTemp);
    if (validateFilePath(filePathResolved, ['temp'])) {
      throw new Error(`File path is not allowed: ${filePathResolved}`);
    }
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
  @DevicePermission({ allowAdmin: true, allowTemporary: 'exist' })
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
  @DevicePermission({ allowAdmin: true, allowTemporary: 'exist' })
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
