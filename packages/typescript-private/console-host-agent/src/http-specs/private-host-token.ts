import { Host, HostId, OrganizationId, Platform } from '@dogu-private/types';
import { ControllerMethodSpec, ControllerSpec, DefaultPathProvider } from '@dogu-tech/common';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class FindHostByTokenResponse implements Pick<Required<Host>, 'hostId' | 'organizationId' | 'platform' | 'rootWorkspace'> {
  @IsString()
  @IsNotEmpty()
  hostId!: HostId;

  @IsString()
  @IsNotEmpty()
  organizationId!: OrganizationId;

  @IsEnum(Platform)
  platform!: Platform;

  @IsString()
  rootWorkspace!: string;

  @IsNumber()
  deviceServerPort!: number;
}

const PrivateHostTokenController = new ControllerSpec({
  path: '/private/hostToken',
});

export const PrivateHostToken = {
  controller: PrivateHostTokenController,

  findHostByToken: new ControllerMethodSpec({
    controllerSpec: PrivateHostTokenController,
    method: 'POST',
    path: '/',
    pathProvider: DefaultPathProvider,
    responseBody: FindHostByTokenResponse,
  }),
};
