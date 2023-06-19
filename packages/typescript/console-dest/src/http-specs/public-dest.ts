import { ControllerMethodSpec, ControllerSpec } from '@dogu-tech/common';
import { DestId, DeviceId, OrganizationId } from '@dogu-tech/types';
import { CreateDestRequestBody, UpdateDestStatusRequestBody } from './request';
import { CreateDestResponse } from './response';

const PublicDestController = new ControllerSpec({
  path: '/public/organizations/:organizationId/devices/:deviceId/dests',
});

export const PublicDest = {
  controller: PublicDestController,

  updateDestState: new ControllerMethodSpec({
    controllerSpec: PublicDestController,
    method: 'PATCH',
    path: '/:destId/status',
    pathProvider: class {
      constructor(readonly organizationId: OrganizationId, readonly deviceId: DeviceId, readonly destId: DestId) {}
    },
    requestBody: UpdateDestStatusRequestBody,
  }),

  createDest: new ControllerMethodSpec({
    controllerSpec: PublicDestController,
    method: 'POST',
    path: '/',
    pathProvider: class {
      constructor(readonly organizationId: OrganizationId, readonly deviceId: DeviceId) {}
    },
    requestBody: CreateDestRequestBody,
    responseBody: CreateDestResponse,
  }),
};
