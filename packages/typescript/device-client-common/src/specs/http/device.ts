import { ControllerSpec, DefaultPathProvider } from '@dogu-tech/common';
import { GeoLocationDto, LocaleCodeDto, Serial } from '@dogu-tech/types';
import { DeviceConfigDto } from '../../validations/types/device-configs';
import { DeviceNotFoundErrorDetails, DeviceServerResponseDto } from '../../validations/types/responses';
import { DeviceServerControllerMethodSpec } from '../types';
import {
  CreateLocalDeviceDetectTokenRequest,
  GetAppiumCapabilitiesResponse,
  GetAppiumContextInfoResponse,
  GetDeviceGeoLocationResponse,
  GetDeviceLocaleResponse,
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

  getLocale: new DeviceServerControllerMethodSpec({
    controllerSpec: DeviceController,
    method: 'GET',
    path: '/:serial/locale',
    pathProvider: class {
      constructor(readonly serial: Serial) {}
    },
    responseBody: DeviceServerResponseDto,
    responseBodyData: GetDeviceLocaleResponse,
    responseBodyError: DeviceNotFoundErrorDetails,
  }),

  setLocale: new DeviceServerControllerMethodSpec({
    controllerSpec: DeviceController,
    method: 'POST',
    path: '/:serial/locale',
    pathProvider: class {
      constructor(readonly serial: Serial) {}
    },
    requestBody: LocaleCodeDto,
    responseBody: DeviceServerResponseDto,
    responseBodyData: GetDeviceLocaleResponse,
    responseBodyError: DeviceNotFoundErrorDetails,
  }),

  getGeoLocation: new DeviceServerControllerMethodSpec({
    controllerSpec: DeviceController,
    method: 'GET',
    path: '/:serial/geo-location',
    pathProvider: class {
      constructor(readonly serial: Serial) {}
    },
    responseBody: DeviceServerResponseDto,
    responseBodyData: GetDeviceGeoLocationResponse,
    responseBodyError: DeviceNotFoundErrorDetails,
  }),

  setGeoLocation: new DeviceServerControllerMethodSpec({
    controllerSpec: DeviceController,
    method: 'POST',
    path: '/:serial/geo-location',
    pathProvider: class {
      constructor(readonly serial: Serial) {}
    },
    requestBody: GeoLocationDto,
    responseBody: DeviceServerResponseDto,
    responseBodyData: GetDeviceGeoLocationResponse,
    responseBodyError: DeviceNotFoundErrorDetails,
  }),
};
