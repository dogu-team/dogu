import { ControllerSpec, DefaultPathProvider } from '@dogu-tech/common';
import { DeviceAdminToken, DeviceTemporaryTokenDto, Serial } from '@dogu-tech/types';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { DeviceServerResponseDto } from '../..';
import { DeviceServerControllerMethodSpec } from '../types';

export class RefreshAdminTokenRequestBody {
  @ValidateNested()
  @Type(() => DeviceAdminToken)
  newToken!: DeviceAdminToken;
}

export class RefreshAdminTokenReponseBodyData {}

export class CreateTokenRequestBody {}

export class CreateTokenReponseBodyData {
  @ValidateNested()
  @Type(() => DeviceTemporaryTokenDto)
  token!: DeviceTemporaryTokenDto;
}

export class DeleteTokenRequestBody {
  @ValidateNested()
  @Type(() => DeviceTemporaryTokenDto)
  token!: DeviceTemporaryTokenDto;
}

export class DeleteTokenReponseBodyData {}

const DeviceAuthController = new ControllerSpec({ path: '/device-auth' });
export const DeviceAuth = {
  controller: DeviceAuthController,

  refreshAdminToken: new DeviceServerControllerMethodSpec({
    controllerSpec: DeviceAuthController,
    method: 'POST',
    path: '/admin-token',
    pathProvider: DefaultPathProvider,
    requestBody: RefreshAdminTokenRequestBody,
    responseBody: DeviceServerResponseDto<RefreshAdminTokenReponseBodyData>,
    responseBodyData: RefreshAdminTokenReponseBodyData,
  }),

  createToken: new DeviceServerControllerMethodSpec({
    controllerSpec: DeviceAuthController,
    method: 'POST',
    path: '/:serial//token',
    pathProvider: class {
      constructor(readonly serial: Serial) {}
    },
    requestBody: CreateTokenRequestBody,
    responseBody: DeviceServerResponseDto<CreateTokenReponseBodyData>,
    responseBodyData: CreateTokenReponseBodyData,
  }),

  deleteToken: new DeviceServerControllerMethodSpec({
    controllerSpec: DeviceAuthController,
    method: 'DELETE',
    path: '/token',
    pathProvider: DefaultPathProvider,
    requestBody: DeleteTokenRequestBody,
    responseBody: DeviceServerResponseDto<DeleteTokenReponseBodyData>,
    responseBodyData: DeleteTokenReponseBodyData,
  }),
};
