import { Code, ErrorResultError, isErrorResultError, Serial } from '@dogu-private/types';
import { HeaderRecord, Instance, parseAxiosError, stringify } from '@dogu-tech/common';
import { DeviceWebDriver, RelayRequest, SessionDeletedParam } from '@dogu-tech/device-client-common';
import { Body, Controller, Delete, Headers, Param, Post } from '@nestjs/common';
import { isAxiosError } from 'axios';
import { deviceNotFoundError } from '../device/device.utils';
import { DoguLogger } from '../logger/logger';
import { ScanService } from '../scan/scan.service';

@Controller(DeviceWebDriver.controller)
export class DeviceWebDriverController {
  constructor(private readonly scanService: ScanService, private readonly logger: DoguLogger) {}

  @Post(DeviceWebDriver.relayHttp.path)
  async relayHttp(
    @Headers() headers: HeaderRecord,
    @Param('serial') serial: Serial,
    @Body() request: RelayRequest,
  ): Promise<Instance<typeof DeviceWebDriver.relayHttp.responseBody>> {
    try {
      const device = this.scanService.findChannel(serial);
      if (device === null) {
        return deviceNotFoundError(serial);
      }

      const handler = device.getWebDriverHandler();
      if (!handler) {
        throw toErrorResultError(serial, new Error('handler is null'));
      }

      const response = await handler.onRelayHttp(headers, request);
      return {
        value: {
          $case: 'data',
          data: response,
        },
      };
    } catch (error) {
      this.logger.error(`Error while relaying http request: ${stringify(parseAxiosError(error))}`);
      if (isErrorResultError(error)) {
        return {
          value: {
            $case: 'error',
            error,
          },
        };
      } else {
        return {
          value: {
            $case: 'error',
            error: toErrorResultError(serial, error),
          },
        };
      }
    }
  }

  @Delete(DeviceWebDriver.sessionDeleted.path)
  async sessionDeleted(
    @Headers() headers: HeaderRecord,
    @Param('serial') serial: Serial,
    @Body() param: SessionDeletedParam,
  ): Promise<Instance<typeof DeviceWebDriver.sessionDeleted.responseBody>> {
    try {
      const device = this.scanService.findChannel(serial);
      if (device === null) {
        return deviceNotFoundError(serial);
      }

      const handler = device.getWebDriverHandler();
      if (!handler) {
        throw toErrorResultError(serial, new Error('handler is null'));
      }

      await handler.onSessionDeleted(headers, param);
      return {
        value: {
          $case: 'data',
          data: {},
        },
      };
    } catch (error) {
      this.logger.error(`Error while deleting session: ${stringify(parseAxiosError(error))}`);
      if (isErrorResultError(error)) {
        return {
          value: {
            $case: 'error',
            error,
          },
        };
      } else {
        return {
          value: {
            $case: 'error',
            error: toErrorResultError(serial, error),
          },
        };
      }
    }
  }
}

export function toErrorResultError(serial: Serial, error: unknown): ErrorResultError {
  if (isErrorResultError(error)) {
    return new ErrorResultError(error.code, error.message, {
      ...error.details,
      serial,
    });
  } else if (isAxiosError(error)) {
    return new ErrorResultError(
      Code.CODE_UNEXPECTED_ERROR,
      `Axios Error: message: ${error.message}, code: ${stringify(error.response?.status, { colors: false })}, data: ${stringify(error.response?.data, { colors: false })}`,
      {
        serial,
        error,
      },
    );
  } else if (error instanceof Error) {
    return new ErrorResultError(Code.CODE_UNEXPECTED_ERROR, `Unknown Error: ${error.message}`, {
      serial,
      error,
    });
  } else {
    return new ErrorResultError(Code.CODE_UNEXPECTED_ERROR, `Unknown Error: ${stringify(error, { colors: false })}`, {
      serial,
      error,
    });
  }
}
