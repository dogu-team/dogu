import { ControllerMethodSpec, ControllerSpec } from '@dogu-tech/common';
import { OrganizationId } from '@dogu-tech/types';
import { GetApplicationListQuery, GetApplicationListResponse, GetApplicationsWithUniquePackageQuery, GetApplicationUrlResponse, GetGitUrlQuery, GetGitUrlResponse } from './dtos';

const PublicActionController = new ControllerSpec({
  path: '/public/organizations/:organizationId',
});

export const PublicAction = {
  controller: PublicActionController,

  getGitUrl: new ControllerMethodSpec({
    controllerSpec: PublicActionController,
    method: 'GET',
    path: '/git-url',
    pathProvider: class {
      constructor(readonly organizationId: OrganizationId) {}
    },
    query: GetGitUrlQuery,
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
    query: GetApplicationsWithUniquePackageQuery,
    responseBody: GetApplicationListResponse,
  }),

  getApplicationDownloadUrl: new ControllerMethodSpec({
    controllerSpec: PublicActionController,
    method: 'GET',
    path: '/applications/:organizationApplicationId/url',
    pathProvider: class {
      constructor(
        readonly organizationId: OrganizationId,
        readonly organizationApplicationId: string,
      ) {}
    },
    responseBody: GetApplicationUrlResponse,
  }),
};
