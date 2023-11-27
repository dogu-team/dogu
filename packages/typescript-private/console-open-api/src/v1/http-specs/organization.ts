import { OrganizationId } from '@dogu-private/types';
import { ControllerMethodSpec, ControllerSpec } from '@dogu-tech/common';
import { V1UploadApplicationRequestBody } from '../..';

const V1OrganizationController = new ControllerSpec({
  path: '/v1/organizations',
});

export const V1Organization = {
  controller: V1OrganizationController,

  uploadApplicatoin: new ControllerMethodSpec({
    controllerSpec: V1OrganizationController,
    method: 'POST',
    path: '/:organizationId/applications',
    pathProvider: class {
      constructor(readonly organizationId: OrganizationId) {}
    },
    responseBody: V1UploadApplicationRequestBody,
  }),
};
