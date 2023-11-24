import { Instance } from '@dogu-tech/common';
import { DeviceAuth } from '@dogu-tech/device-client-common';
import { Body, Controller, Delete, Post } from '@nestjs/common';
import { DoguLogger } from '../logger/logger';
import { DeviceAuthService } from './device-auth.service';

@Controller(DeviceAuth.controller)
export class DeviceAuthController {
  constructor(
    private readonly authService: DeviceAuthService,
    private readonly logger: DoguLogger,
  ) {}

  @Post(DeviceAuth.refreshAdminToken.path)
  refreshAdminToken(@Body() request: Instance<typeof DeviceAuth.refreshAdminToken.requestBody>): Instance<typeof DeviceAuth.refreshAdminToken.responseBody> {
    if (!this.authService.validateAdmin(request.beforeToken.value)) {
      throw new Error('Invalid token');
    }
    this.authService.refreshAdminToken(request.newToken.value);
    return {
      value: {
        $case: 'data',
        data: {},
      },
    };
  }

  @Post(DeviceAuth.createToken.path)
  createToken(@Body() request: Instance<typeof DeviceAuth.createToken.requestBody>): Instance<typeof DeviceAuth.createToken.responseBody> {
    if (!this.authService.validateAdmin(request.adminToken.value)) {
      throw new Error('Invalid token');
    }
    const token = this.authService.generateTemporaryToken();
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
  deleteToken(@Body() request: Instance<typeof DeviceAuth.deleteToken.requestBody>): Instance<typeof DeviceAuth.deleteToken.responseBody> {
    if (!this.authService.validateAdmin(request.adminToken.value)) {
      throw new Error('Invalid token');
    }
    this.authService.deleteTemporaryToken(request.token);
    return {
      value: {
        $case: 'data',
        data: {},
      },
    };
  }
}
