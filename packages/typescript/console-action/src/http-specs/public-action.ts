import { ControllerMethodSpec, ControllerSpec } from '@dogu-tech/common';
import { OrganizationId, ProjectId } from '@dogu-tech/types';
import { GetApplicationListQuery, GetApplicationListResponse, GetApplicationUrlResponse, GetGitUrlResponse } from './dtos';

const PublicActionController = new ControllerSpec({
  path: '/public/organizations/:organizationId',
});

export const PublicAction = {
  controller: PublicActionController,

  getGitUrl: new ControllerMethodSpec({
    controllerSpec: PublicActionController,
    method: 'GET',
    path: '/projects/:projectId/git-url',
    pathProvider: class {
      constructor(
        readonly organizationId: OrganizationId,
        readonly projectId: ProjectId,
      ) {}
    },
    responseBody: GetGitUrlResponse,
  }),

  getApplicationList: new ControllerMethodSpec({
    controllerSpec: PublicActionController,
    method: 'GET',
    path: '/applications',
    pathProvider: class {
      constructor(readonly organizationId: OrganizationId) {}
    },
    query: GetApplicationListQuery,
    responseBody: GetApplicationListResponse,
  }),

  getApplicationsWithUniquePackage: new ControllerMethodSpec({
    controllerSpec: PublicActionController,
    method: 'GET',
    path: '/applications/packages',
    pathProvider: class {
      constructor(readonly organizationId: OrganizationId) {}
    },
    query: GetApplicationListQuery,
    responseBody: GetApplicationListResponse,
  }),

  getApplicationDownloadUrl: new ControllerMethodSpec({
    controllerSpec: PublicActionController,
    method: 'GET',
    path: '/applications/:applicationId/url',
    pathProvider: class {
      constructor(
        readonly organizationId: OrganizationId,
        readonly applicationId: string,
      ) {}
    },
    responseBody: GetApplicationUrlResponse,
  }),
};
