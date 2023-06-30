import { DeviceConnectionState, DeviceId, Serial } from '@dogu-private/types';
import { HeaderRecord, Method, transformAndValidate } from '@dogu-tech/common';
import { RelayRequest } from '@dogu-tech/device-client-common';
import { Request } from 'express';
import { DoguWebDriverOptions } from '../../types/webdriver-options';
import { DeviceStatusService } from '../organization/device/device-status.service';
import { FindDevicesByOrganizationIdDto } from '../organization/device/dto/device.dto';

export interface WebDriverDeviceAPIHandlerResultNotHandlable {
  isHandlable: false;
}

export interface WebDriverDeviceAPIHandlerResultError {
  isHandlable: true;
  // https://www.w3.org/TR/webdriver/#errors
  status: number;
  error: Error;
  data: Object;
}

export interface WebDriverDeviceAPIHandlerResultOk {
  isHandlable: true;
  error?: undefined;
  organizationId: string;
  deviceId: DeviceId;
  serial: Serial;
  request: RelayRequest;
}

export type WebDriverDeviceAPIHandlerResult = WebDriverDeviceAPIHandlerResultNotHandlable | WebDriverDeviceAPIHandlerResultError | WebDriverDeviceAPIHandlerResultOk;

export abstract class WebDriverAPIHandler {
  abstract process(deviceStatusService: DeviceStatusService, subpath: string, request: Request): Promise<WebDriverDeviceAPIHandlerResult>;
}

export class WebDriverNewSessionAPIHandler extends WebDriverAPIHandler {
  async process(deviceStatusService: DeviceStatusService, subpath: string, request: Request): Promise<WebDriverDeviceAPIHandlerResult> {
    if (subpath !== 'session') {
      return { isHandlable: false };
    }
    const alwaysMatchCaps = request.body?.capabilities?.alwaysMatch;
    if (!alwaysMatchCaps) {
      return { isHandlable: true, status: 400, error: new Error('alwaysMatch capabilities not found'), data: {} };
    }
    const platformName = alwaysMatchCaps['platformName'];
    if (!platformName) {
      return { isHandlable: true, status: 400, error: new Error('platformName not found'), data: { platformName: platformName } };
    }
    const doguOptions = alwaysMatchCaps['dogu:options'];
    if (!doguOptions) {
      return { isHandlable: true, status: 400, error: new Error('Dogu options not found'), data: {} };
    }

    const options = await transformAndValidate(DoguWebDriverOptions, doguOptions);
    const dto = new FindDevicesByOrganizationIdDto();
    dto.tagNames = [options.tag];
    dto.connectionStates = [DeviceConnectionState.DEVICE_CONNECTION_STATE_CONNECTED];
    dto.projectIds = options.projectId ? [options.projectId] : [];

    const page = await deviceStatusService.findDevicesByOrganizationId({ userId: doguOptions.userId }, doguOptions.organizationId, dto);
    if (page.items.length === 0) {
      return { isHandlable: true, status: 400, error: new Error('Device not found'), data: {} };
    }
    const headers: HeaderRecord = {};
    for (const key of Object.keys(request.headers)) {
      const value = request.headers[key]!;
      if (value instanceof Array) {
        throw new Error('Multiple headers not supported');
        headers[key] = value[0];
        continue;
      }
      headers[key] = value;
    }

    return {
      isHandlable: true,
      organizationId: doguOptions.organizationId,
      deviceId: page.items[0].deviceId,
      serial: page.items[0].serial,
      request: {
        path: subpath,
        headers: headers,
        method: request.method as Method,
        query: request.query,
        data: request.body,
      },
    };
  }
}

export class WebDriverEachSessionAPIHandler extends WebDriverAPIHandler {
  async process(deviceStatusService: DeviceStatusService, subpath: string, request: Request): Promise<WebDriverDeviceAPIHandlerResult> {
    if (!subpath.startsWith('session/')) {
      return { isHandlable: false };
    }
    console.log('a');

    return {
      isHandlable: true,
      organizationId: '',
      deviceId: '',
      serial: '',
      request: {
        path: subpath,
        headers: {},
        method: request.method as Method,
        query: request.query,
        data: request.body,
      },
    };
  }
}
