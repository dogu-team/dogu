import { ControllerMethodSpec, ControllerSpec } from '@dogu-tech/common';
import { ProjectId, RemoteDestId, RemoteDeviceJobId } from '@dogu-tech/types';
import { CreateRemoteDestRequestBody, UpdateRemoteDestStateRequestBody } from './request';

const RemoteDestController = new ControllerSpec({
  path: '/projects/:projectId/remote-device-jobs/:remoteDeviceJobId/remote-dest',
});

export const PublicRemoteDest = {
  controller: RemoteDestController,

  createRemoteDest: new ControllerMethodSpec({
    controllerSpec: RemoteDestController,
    method: 'POST',
    path: '/',
    pathProvider: class {
      constructor(readonly projectId: ProjectId, readonly remoteDeviceJobId: RemoteDeviceJobId) {}
    },
    requestBody: CreateRemoteDestRequestBody,
  }),

  updateRemoteDestState: new ControllerMethodSpec({
    controllerSpec: RemoteDestController,
    method: 'PATCH',
    path: '/:remoteDestId/state',
    pathProvider: class {
      constructor(readonly projectId: ProjectId, readonly remoteDeviceJobId: RemoteDeviceJobId, readonly remoteDestId: RemoteDestId) {}
    },
    requestBody: UpdateRemoteDestStateRequestBody,
  }),
};
