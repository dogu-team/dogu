import { Serial } from '@dogu-private/types';
import { Instance } from '@dogu-tech/common';
import { DeviceAuth } from '@dogu-tech/device-client-common';
import { Body, Controller, Delete, Param, Post } from '@nestjs/common';
import { DoguLogger } from '../logger/logger';
import { AuthService } from './auth.service';
import { DeviceAdminPermission } from './decorators';

@Controller(DeviceAuth.controller)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly logger: DoguLogger,
  ) {}

  @Post(DeviceAuth.refreshAdminToken.path)
  @DeviceAdminPermission()
  refreshAdminToken(@Body() request: Instance<typeof DeviceAuth.refreshAdminToken.requestBody>): Instance<typeof DeviceAuth.refreshAdminToken.responseBody> {
    this.authService.refreshAdminToken(request.newToken.value);
    return {
      value: {
        $case: 'data',
        data: {},
      },
    };
  }

  @Post(DeviceAuth.createToken.path)
  @DeviceAdminPermission()
  createToken(@Param('serial') serial: Serial, @Body() request: Instance<typeof DeviceAuth.createToken.requestBody>): Instance<typeof DeviceAuth.createToken.responseBody> {
    const token = this.authService.generateTemporaryToken(serial);
    return {
      value: {
        $case: 'data',
        data: {
          token,
        },
      },
    };
  }

  @Delete(DeviceAuth.deleteToken.path)
  @DeviceAdminPermission()
  deleteToken(@Body() request: Instance<typeof DeviceAuth.deleteToken.requestBody>): Instance<typeof DeviceAuth.deleteToken.responseBody> {
    this.authService.deleteTemporaryToken(request.token);
    return {
      value: {
        $case: 'data',
        data: {},
      },
    };
  }
}
