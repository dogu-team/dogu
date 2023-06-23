import { ControllerSpec } from '@dogu-tech/common';
import { Serial } from '@dogu-tech/types';
import { DeviceServerResponseDto } from '../../validations/types/responses';
import { DeviceServerControllerMethodSpec } from '../types';
import {
  GetContextPageSourcesResponse,
  GetContextResponse,
  GetContextsResponse,
  GetHitPointQuery,
  GetHitPointResponse,
  GetPageSourceResponse,
  SwitchContextAndGetPageSourceRequest,
  SwitchContextAndGetPageSourceResponse,
  SwitchContextRequest,
  TryConnectGamiumInspectorRequest,
  TryConnectGamiumInspectorResponse,
} from './device-dtos';

const DeviceInspectorController = new ControllerSpec({ path: '/device-inspector' });

export const DeviceInspector = {
  controller: DeviceInspectorController,

  getPageSource: new DeviceServerControllerMethodSpec({
    controllerSpec: DeviceInspectorController,
    method: 'GET',
    path: '/:serial/get-page-source',
    pathProvider: class {
      constructor(readonly serial: Serial) {}
    },
    responseBody: DeviceServerResponseDto,
    responseBodyData: GetPageSourceResponse,
  }),

  getContexts: new DeviceServerControllerMethodSpec({
    controllerSpec: DeviceInspectorController,
    method: 'GET',
    path: '/:serial/get-contexts',
    pathProvider: class {
      constructor(readonly serial: Serial) {}
    },
    responseBody: DeviceServerResponseDto,
    responseBodyData: GetContextsResponse,
  }),

  getContext: new DeviceServerControllerMethodSpec({
    controllerSpec: DeviceInspectorController,
    method: 'GET',
    path: '/:serial/get-context',
    pathProvider: class {
      constructor(readonly serial: Serial) {}
    },
    responseBody: DeviceServerResponseDto,
    responseBodyData: GetContextResponse,
  }),

  switchContext: new DeviceServerControllerMethodSpec({
    controllerSpec: DeviceInspectorController,
    method: 'POST',
    path: '/:serial/switch-context',
    pathProvider: class {
      constructor(readonly serial: Serial) {}
    },
    requestBody: SwitchContextRequest,
    responseBody: DeviceServerResponseDto,
  }),

  switchContextAndGetPageSource: new DeviceServerControllerMethodSpec({
    controllerSpec: DeviceInspectorController,
    method: 'POST',
    path: '/:serial/switch-context-and-get-page-source',
    pathProvider: class {
      constructor(readonly serial: Serial) {}
    },
    requestBody: SwitchContextAndGetPageSourceRequest,
    responseBody: DeviceServerResponseDto,
    responseBodyData: SwitchContextAndGetPageSourceResponse,
  }),

  getContextPageSources: new DeviceServerControllerMethodSpec({
    controllerSpec: DeviceInspectorController,
    method: 'GET',
    path: '/:serial/get-context-page-sources',
    pathProvider: class {
      constructor(readonly serial: Serial) {}
    },
    responseBody: DeviceServerResponseDto,
    responseBodyData: GetContextPageSourcesResponse,
  }),

  tryConnectGamiumInspector: new DeviceServerControllerMethodSpec({
    controllerSpec: DeviceInspectorController,
    method: 'POST',
    path: '/:serial/try-connect-gamium-inspector',
    pathProvider: class {
      constructor(readonly serial: Serial) {}
    },
    requestBody: TryConnectGamiumInspectorRequest,
    responseBody: DeviceServerResponseDto,
    responseBodyData: TryConnectGamiumInspectorResponse,
  }),

  getHitPoint: new DeviceServerControllerMethodSpec({
    controllerSpec: DeviceInspectorController,
    method: 'GET',
    path: '/:serial/get-hit-point',
    pathProvider: class {
      constructor(readonly serial: Serial) {}
    },
    query: GetHitPointQuery,
    responseBody: DeviceServerResponseDto,
    responseBodyData: GetHitPointResponse,
  }),
};
