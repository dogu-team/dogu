import { ControllerSpec, DefaultPathProvider } from '@dogu-tech/common';
import { DeviceAdminToken } from '@dogu-tech/types';
import { ValidateNested } from 'class-validator';
import { DeviceServerResponseDto } from '../..';
import { DeviceServerControllerMethodSpec } from '../types';

export class RefreshAdminTokenRequestBody {
  @ValidateNested()
  beforeToken!: DeviceAdminToken;

  @ValidateNested()
  netToken!: DeviceAdminToken;
}

export class RefreshAdminTokenReponseBodyData {}

const DeviceAuthController = new ControllerSpec({ path: '/device-auth' });
export const DeviceAuth = {
  controller: DeviceAuthController,

  refreshAdminToken: new DeviceServerControllerMethodSpec({
    controllerSpec: DeviceAuthController,
    method: 'POST',
    path: '/:serial',
    pathProvider: DefaultPathProvider,
    requestBody: RefreshAdminTokenRequestBody,
    responseBody: DeviceServerResponseDto<RefreshAdminTokenReponseBodyData>,
    responseBodyData: RefreshAdminTokenReponseBodyData,
  }),
};
