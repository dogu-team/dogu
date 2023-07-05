import { Code, Serial } from '@dogu-private/types';
import { HeaderRecord, Instance, stringify } from '@dogu-tech/common';
import { DeviceServerResponseDto, DeviceWebDriver, RelayRequest, RelayResponse, SessionDeletedParam, WebDriverEndPoint } from '@dogu-tech/device-client-common';
import { Body, Controller, Delete, Param, Post } from '@nestjs/common';
import axios, { AxiosError } from 'axios';
import { deviceNotFoundError } from '../device/device.utils';
import { DoguLogger } from '../logger/logger';
import { appiumContextNotFoundError } from '../response-utils';
import { ScanService } from '../scan/scan.service';
import { DeviceWebDriverEndpointHandler, DeviceWebDriverNewSessionEndpointHandler } from './device-webdriver.endpoint.handler';

@Controller(DeviceWebDriver.controller)
export class DeviceWebDriverController {
  constructor(private readonly scanService: ScanService, private readonly logger: DoguLogger) {}

  @Post(DeviceWebDriver.relayHttp.path)
  async relayHttp(@Param('serial') serial: Serial, @Body() request: RelayRequest): Promise<Instance<typeof DeviceWebDriver.relayHttp.responseBody>> {
    try {
      const device = this.scanService.findChannel(serial);
      if (device === null) {
        return deviceNotFoundError(serial);
      }
      let context = await device.getAppiumContext();
      if (context === null) {
        return appiumContextNotFoundError(serial);
      }
      if (context.key !== 'remote') {
        context = await device.switchAppiumContext('remote');
      }
      if (!(request.method in methodHandlers)) {
        return apiNotFoundError(serial, request.method);
      }

      const endpoint = await WebDriverEndPoint.create(request);
      if (endpoint.info.type in endpointHandlers) {
        const handler = endpointHandlers[endpoint.info.type];
        const result = await handler.onRequest(endpoint, request, this.logger);
        if (result.error) {
          throw result.error;
        }
        request = result.request;
      }

      const url = `http://localhost:${context.getInfo().server.port}/${request.path}`;
      const res = await methodHandlers[request.method](url, request, this.logger);
      return {
        value: {
          $case: 'data',
          data: res,
        },
      };
    } catch (e) {
      this.logger.error(`Error while relaying http request: ${stringify(e)}`);
      return unknownError(serial, e);
    }
  }

  @Delete(DeviceWebDriver.sessionDeleted.path)
  async sessionDeleted(@Param('serial') serial: Serial, @Body() param: SessionDeletedParam): Promise<Instance<typeof DeviceWebDriver.sessionDeleted.responseBody>> {
    const device = this.scanService.findChannel(serial);
    if (device === null) {
      return deviceNotFoundError(serial);
    }
    let context = await device.getAppiumContext();
    if (context === null) {
      return appiumContextNotFoundError(serial);
    }
    if (context.key !== 'bulitin') {
      context = await device.switchAppiumContext('bulitin');
    }
    return {
      value: {
        $case: 'data',
        data: {},
      },
    };
  }
}

const endpointHandlers: {
  [key: string]: DeviceWebDriverEndpointHandler;
} = {
  'new-session': new DeviceWebDriverNewSessionEndpointHandler(),
};

const methodHandlers: {
  [key: string]: (url: string, request: RelayRequest, logger: DoguLogger) => Promise<RelayResponse>;
} = {
  GET: async (url, request, logger) => {
    const res = await axios.get(url);
    return convertResponse(res, logger);
  },
  POST: async (url, request, logger) => {
    const res = await axios.post(url, request.reqBody);
    return convertResponse(res, logger);
  },
  PUT: async (url, request, logger) => {
    const res = await axios.put(url, request.reqBody);
    return convertResponse(res, logger);
  },
  PATCH: async (url, request, logger) => {
    const res = await axios.patch(url, request.reqBody);
    return convertResponse(res, logger);
  },
  HEAD: async (url, request, logger) => {
    const res = await axios.head(url);
    return convertResponse(res, logger);
  },
  DELETE: async (url, request, logger) => {
    const res = await axios.delete(url);
    return convertResponse(res, logger);
  },
};

function convertResponse<T>(res: axios.AxiosResponse<any, any>, logger: DoguLogger): RelayResponse {
  if (!res) {
    throw new Error('Response is null');
  }
  const headers: HeaderRecord = {};
  for (const headKey of Object.keys(res.headers)) {
    headers[headKey] = stringify(res.headers[headKey]);
  }
  const response: RelayResponse = {
    headers: headers,
    status: res.status,
    resBody: res.data as object,
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

function axiosError(error: AxiosError): RelayResponse {
  const headers: HeaderRecord = {};
  if (error.response?.headers) {
    for (const headKey of Object.keys(error.response?.headers)) {
      headers[headKey] = stringify(error.response?.headers[headKey]);
    }
  }
  const status = error.response?.status ?? 500;
  const data = error.response?.data;

  const response: RelayResponse = {
    headers: headers,
    status: status,
    resBody: data as object,
  };
  return response;
}

export function unknownError(serial: Serial, error: unknown): DeviceServerResponseDto {
  if (error instanceof Error) {
    return {
      value: {
        $case: 'error',
        error: {
          code: Code.CODE_UNEXPECTED_ERROR,
          message: `Unknown Error: ${error.message}`,
          details: {
            serial,
            error,
          },
        },
      },
    };
  }
  return {
    value: {
      $case: 'error',
      error: {
        code: Code.CODE_UNEXPECTED_ERROR,
        message: `Unknown Error: ${stringify(error)}`,
        details: {
          serial,
          error,
        },
      },
    },
  };
}
