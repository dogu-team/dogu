import { Architecture, Host, HostId, OrganizationId, Platform } from '@dogu-private/types';
import { ControllerMethodSpec, ControllerSpec } from '@dogu-tech/common';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateHostRequestBody implements Pick<Partial<Host>, 'platform' | 'architecture' | 'rootWorkspace' | 'agentVersion'> {
  @IsEnum(Platform)
  @IsOptional()
  platform?: Platform;

  @IsEnum(Architecture)
  @IsOptional()
  architecture?: Architecture;

  @IsString()
  @IsOptional()
  rootWorkspace?: string;

  @IsNumber()
  @IsOptional()
  deviceServerPort?: number;

  @IsString()
  @IsOptional()
  agentVersion?: string;
}

const PrivateHostController = new ControllerSpec({
  path: '/private/organizations/:organizationId/hosts',
});

export const PrivateHost = {
  controller: PrivateHostController,

  updateHostHeartbeatNow: new ControllerMethodSpec({
    controllerSpec: PrivateHostController,
    method: 'PATCH',
    path: '/:hostId/heartbeat/now',
    pathProvider: class {
      constructor(readonly organizationId: OrganizationId, readonly hostId: HostId) {}
    },
  }),

  update: new ControllerMethodSpec({
    controllerSpec: PrivateHostController,
    method: 'PATCH',
    path: '/:hostId',
    pathProvider: class {
      constructor(readonly organizationId: OrganizationId, readonly hostId: HostId) {}
    },
    requestBody: UpdateHostRequestBody,
  }),
};
