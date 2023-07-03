import { Code, Serial } from '@dogu-private/types';
import { HeaderRecord, Instance, stringify } from '@dogu-tech/common';
import { DeviceServerResponseDto, DeviceWebDriver, RelayRequest, RelayResponse } from '@dogu-tech/device-client-common';
import { Body, Controller, Param, Post } from '@nestjs/common';
import axios from 'axios';
import { deviceNotFoundError } from '../device/device.utils';
import { appiumContextNotFoundError } from '../response-utils';
import { ScanService } from '../scan/scan.service';

@Controller(DeviceWebDriver.controller)
export class DeviceWebDriverController {
  constructor(private readonly scanService: ScanService) {}

  @Post(DeviceWebDriver.relayHttp.path)
  async relayHttp(@Param('serial') serial: Serial, @Body() request: RelayRequest): Promise<Instance<typeof DeviceWebDriver.relayHttp.responseBody>> {
    const device = this.scanService.findChannel(serial);
    if (device === null) {
      return deviceNotFoundError(serial);
    }
    const channel = await device.getAppiumContext();
    if (channel === null) {
      return appiumContextNotFoundError(serial);
    }
    if (!(request.method in handlers)) {
      return apiNotFoundError(serial, request.method);
    }

    const url = `http://localhost:${channel.getInfo().server.port}/${request.path}`;
    const res = await handlers[request.method](url, request);

    return {
      value: {
        $case: 'data',
        data: res,
      },
    };
  }
}

const handlers: {
  [key: string]: (url: string, request: RelayRequest) => Promise<RelayResponse>;
} = {
  GET: async (url, request) => {
    const res = await axios.get(url);
    return convertResponse(res);
  },
  POST: async (url, request) => {
    const res = await axios.post(url, request.data);
    return convertResponse(res);
  },
  PUT: async (url, request) => {
    const res = await axios.put(url, request.data);
    return convertResponse(res);
  },
  PATCH: async (url, request) => {
    const res = await axios.patch(url, request.data);
    return convertResponse(res);
  },
  HEAD: async (url, request) => {
    const res = await axios.head(url);
    return convertResponse(res);
  },
};

function convertResponse<T>(res: axios.AxiosResponse<any, any>): RelayResponse {
  const headers: HeaderRecord = {};
  for (const headKey of Object.keys(res.headers)) {
    headers[headKey] = stringify(res.headers[headKey]);
  }
  const response: RelayResponse = {
    headers: headers,
    status: res.status,
    data: res.data,
  };

  return response;
}

export function apiNotFoundError(serial: Serial, method: string): DeviceServerResponseDto {
  return {
    value: {
      $case: 'error',
      error: {
        code: Code.CODE_MAP_KEY_NOTFOUND,
        message: `API method not found for key: ${method}`,
        details: {
          serial,
          method,
        },
      },
    },
  };
}
