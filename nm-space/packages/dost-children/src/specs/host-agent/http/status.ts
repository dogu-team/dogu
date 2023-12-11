import { ControllerMethodSpec, ControllerSpec, DefaultPathProvider } from '@dogu-tech/common';
import { GetConnectionStatusResponse, GetLatestVersionResponse, UpdateLatestVersionRequest, UpdateLatestVersionResponse } from './status.dto';

const StatusController = new ControllerSpec({ path: '/status' });

export const Status = {
  controller: StatusController,

  getConnectionStatus: new ControllerMethodSpec({
    controllerSpec: StatusController,
    method: 'GET',
    path: '/connection',
    pathProvider: DefaultPathProvider,
    responseBody: GetConnectionStatusResponse,
  }),

  getLatestVersion: new ControllerMethodSpec({
    controllerSpec: StatusController,
    method: 'GET',
    path: '/update',
    pathProvider: DefaultPathProvider,
    responseBody: GetLatestVersionResponse,
  }),

  updateLatestVersion: new ControllerMethodSpec({
    controllerSpec: StatusController,
    method: 'POST',
    path: '/update',
    pathProvider: DefaultPathProvider,
    requestBody: UpdateLatestVersionRequest,
    responseBody: UpdateLatestVersionResponse,
  }),
};
