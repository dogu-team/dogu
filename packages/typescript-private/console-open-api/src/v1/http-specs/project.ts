import { ProjectId } from '@dogu-private/types';
import { ControllerMethodSpec, ControllerSpec } from '@dogu-tech/common';
import { V1UploadApplicationRequestBody } from '../dto/project.dto';

const V1ProjectController = new ControllerSpec({
  path: '/v1/projects',
});

export const V1Project = {
  controller: V1ProjectController,

  uploadApplicatoin: new ControllerMethodSpec({
    controllerSpec: V1ProjectController,
    method: 'POST',
    path: '/:projectId/applications',
    pathProvider: class {
      constructor(readonly projectId: ProjectId) {}
    },
    responseBody: V1UploadApplicationRequestBody,
  }),
};
