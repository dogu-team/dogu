import { ControllerMethodSpec, ControllerSpec } from '@dogu-tech/common';
import { OrganizationId, ProjectApplicationId, ProjectId } from '@dogu-tech/types';
import { GetApplicationListQuery, GetApplicationListResponse, GetApplicationUrlResponse, GetGitUrlResponse } from './dtos';

const PublicActionController = new ControllerSpec({
  path: '/public/organizations/:organizationId/projects',
});

export const PublicAction = {
  controller: PublicActionController,

  getGitUrl: new ControllerMethodSpec({
    controllerSpec: PublicActionController,
    method: 'GET',
    path: '/:projectId/git-url',
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
    path: '/:projectId/applications',
    pathProvider: class {
      constructor(
        readonly organizationId: OrganizationId,
        readonly projectId: ProjectId,
      ) {}
    },
    query: GetApplicationListQuery,
    responseBody: GetApplicationListResponse,
  }),

  getApplicationsWithUniquePackage: new ControllerMethodSpec({
    controllerSpec: PublicActionController,
    method: 'GET',
    path: '/:projectId/applications/packages',
    pathProvider: class {
      constructor(
        readonly organizationId: OrganizationId,
        readonly projectId: ProjectId,
      ) {}
    },
    query: GetApplicationListQuery,
    responseBody: GetApplicationListResponse,
  }),

  getApplicationDownloadUrl: new ControllerMethodSpec({
    controllerSpec: PublicActionController,
    method: 'GET',
    path: '/:projectId/applications/:projectApplicationId/download-url',
    pathProvider: class {
      constructor(
        readonly organizationId: OrganizationId,
        readonly projectId: ProjectId,
        readonly projectApplicationId: ProjectApplicationId,
      ) {}
    },
    responseBody: GetApplicationUrlResponse,
  }),
};
