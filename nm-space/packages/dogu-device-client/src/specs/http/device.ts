import { ControllerSpec } from '../../common/specs.js';
import { Serial } from '../../types/types.js';
import { DeviceServerResponseDto } from '../../validations/types/responses.js';
import { DeviceServerControllerMethodSpec } from '../types.js';
import { GetAppiumCapabilitiesResponse } from './device-dtos.js';

const DeviceController = new ControllerSpec({ path: '/devices' });

export const Device = {
  controller: DeviceController,

  getAppiumCapabilities: new DeviceServerControllerMethodSpec({
    controllerSpec: DeviceController,
    method: 'GET',
    path: '/:serial/appium-capabilities',
    pathProvider: class {
      constructor(readonly serial: Serial) {}
    },
    responseBody: DeviceServerResponseDto,
    responseBodyData: GetAppiumCapabilitiesResponse,
  }),
};
