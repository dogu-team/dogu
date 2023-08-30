import { ControllerSpec, DefaultPathProvider } from '@dogu-tech/common';
import { Serial } from '@dogu-tech/types';
import { DeviceConfigDto } from '../../validations/types/device-configs';
import { DeviceNotFoundErrorDetails, DeviceServerResponseDto } from '../../validations/types/responses';
import { RTCPeerDescription, StreamingOfferDto } from '../../validations/types/streaming-recordings';
import { DeviceServerControllerMethodSpec } from '../types';
import {
  CreateLocalDeviceDetectTokenRequest,
  GetAppiumContextInfoResponse,
  GetDevicePlatformSerialsResponse,
  GetDeviceSerialsResponse,
  GetDeviceSystemInfoResponse,
  GetLocalDeviceDetectResponse,
  GetSystemBarVisibility,
} from './device-dtos';

const DeviceController = new ControllerSpec({ path: '/devices' });

export const Device = {
  controller: DeviceController,

  getDeviceSerials: new DeviceServerControllerMethodSpec({
    controllerSpec: DeviceController,
    method: 'GET',
    path: '/',
    pathProvider: DefaultPathProvider,
    responseBody: DeviceServerResponseDto,
    responseBodyData: GetDeviceSerialsResponse,
  }),

  getDevicePlatformSerials: new DeviceServerControllerMethodSpec({
    controllerSpec: DeviceController,
    method: 'GET',
    path: '/platform-serials',
    pathProvider: DefaultPathProvider,
    responseBody: DeviceServerResponseDto,
    responseBodyData: GetDevicePlatformSerialsResponse,
  }),

  getDeviceSystemInfo: new DeviceServerControllerMethodSpec({
    controllerSpec: DeviceController,
    method: 'GET',
    path: '/:serial/system-info',
    pathProvider: class {
      constructor(readonly serial: Serial) {}
    },
    responseBody: DeviceServerResponseDto,
    responseBodyData: GetDeviceSystemInfoResponse,
    responseBodyError: DeviceNotFoundErrorDetails,
  }),

  rebootDevice: new DeviceServerControllerMethodSpec({
    controllerSpec: DeviceController,
    method: 'POST',
    path: '/:serial/reboot',
    pathProvider: class {
      constructor(readonly serial: Serial) {}
    },
    responseBody: DeviceServerResponseDto,
    responseBodyError: DeviceNotFoundErrorDetails,
  }),

  startDeviceStreaming: new DeviceServerControllerMethodSpec({
    controllerSpec: DeviceController,
    method: 'POST',
    path: '/:serial/streaming',
    pathProvider: class {
      constructor(readonly serial: Serial) {}
    },
    requestBody: StreamingOfferDto,
    responseBody: DeviceServerResponseDto,
    responseBodyData: RTCPeerDescription,
    responseBodyError: DeviceNotFoundErrorDetails,
  }),

  updateDeviceConfig: new DeviceServerControllerMethodSpec({
    controllerSpec: DeviceController,
    method: 'PATCH',
    path: '/:serial/config',
    pathProvider: class {
      constructor(readonly serial: Serial) {}
    },
    requestBody: DeviceConfigDto,
    responseBody: DeviceServerResponseDto,
    responseBodyError: DeviceNotFoundErrorDetails,
  }),

  createLocalDeviceDetectToken: new DeviceServerControllerMethodSpec({
    controllerSpec: DeviceController,
    method: 'POST',
    path: '/:serial/local-device-detect-token',
    pathProvider: class {
      constructor(readonly serial: Serial) {}
    },
    requestBody: CreateLocalDeviceDetectTokenRequest,
    responseBody: DeviceServerResponseDto,
    responseBodyError: DeviceNotFoundErrorDetails,
  }),

  getLocalDeviceDetectToken: new DeviceServerControllerMethodSpec({
    controllerSpec: DeviceController,
    method: 'GET',
    path: '/:serial/local-device-detect-token',
    pathProvider: class {
      constructor(readonly serial: Serial) {}
    },
    responseBody: DeviceServerResponseDto,
    responseBodyData: GetLocalDeviceDetectResponse,
    responseBodyError: DeviceNotFoundErrorDetails,
  }),

  getAppiumContextInfo: new DeviceServerControllerMethodSpec({
    controllerSpec: DeviceController,
    method: 'GET',
    path: '/:serial/appium-channel-info',
    pathProvider: class {
      constructor(readonly serial: Serial) {}
    },
    responseBody: DeviceServerResponseDto,
    responseBodyData: GetAppiumContextInfoResponse,
  }),

  getSystemBarVisibility: new DeviceServerControllerMethodSpec({
    controllerSpec: DeviceController,
    method: 'GET',
    path: '/:serial/system-bar-visibility',
    pathProvider: class {
      constructor(readonly serial: Serial) {}
    },
    responseBody: DeviceServerResponseDto,
    responseBodyData: GetSystemBarVisibility,
  }),
};
