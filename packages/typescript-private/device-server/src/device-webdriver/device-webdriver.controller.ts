import { Code, ErrorResultDto, isErrorResultError, Serial } from '@dogu-private/types';
import { HeaderRecord, Instance, isFilteredAxiosError, stringify } from '@dogu-tech/common';
import { DeviceWebDriver, RelayRequest, SessionDeletedParam } from '@dogu-tech/device-client-common';
import { Body, Controller, Delete, Headers, Param, Post } from '@nestjs/common';
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
        throw new Error('Internal Error - handler is null');
      }

      const response = await handler.onRelayHttp(headers, request);
      return {
        value: {
          $case: 'data',
          data: response,
        },
      };
    } catch (error) {
      this.logger.error(`Error while relaying http request: ${stringify(error)}`);
      return {
        value: {
          $case: 'error',
          error: toErrorResultDto(serial, error),
        },
      };
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
        throw new Error('Internal Error - handler is null');
      }

      await handler.onSessionDeleted(headers, param);
      return {
        value: {
          $case: 'data',
          data: {},
        },
      };
    } catch (error) {
      this.logger.error(`Error while deleting session: ${stringify(error)}`);
      return {
        value: {
          $case: 'error',
          error: toErrorResultDto(serial, error),
        },
      };
    }
  }
}

export function toErrorResultDto(serial: Serial, error: unknown): ErrorResultDto {
  if (isErrorResultError(error)) {
    return {
      code: error.code,
      message: error.message,
      details: error.details,
    };
  } else if (isFilteredAxiosError(error)) {
    return {
      code: Code.CODE_UNEXPECTED_ERROR,
      message: error.message,
      details: {
        serial,
      },
    };
  } else if (error instanceof Error) {
    return {
      code: Code.CODE_UNEXPECTED_ERROR,
      message: 'Unexpected Error',
      details: {
        serial,
        cause: error,
      },
    };
  } else {
    return {
      code: Code.CODE_UNEXPECTED_ERROR,
      message: `Unexpected Error`,
      details: {
        serial,
        cause: error,
      },
    };
  }
}
