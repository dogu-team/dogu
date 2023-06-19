import { ControllerMethodSpec, ControllerSpec, DefaultPathProvider } from '@dogu-tech/common';
import { GetConnectionStatusResponse } from './status.dto';

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
};
