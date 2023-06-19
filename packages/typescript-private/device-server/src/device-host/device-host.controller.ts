import { Instance } from '@dogu-tech/common';
import { DeviceHost, GetFreePortQuery } from '@dogu-tech/device-client-common';
import { Controller, Get, Query } from '@nestjs/common';
import { getFreePort } from '../internal/util/net';
import { pathMap } from '../path-map';

@Controller(DeviceHost.controller)
export class DeviceHostController {
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
}
