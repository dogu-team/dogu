import { Instance } from '@dogu-tech/common';
import { DeviceAuth, RefreshAdminTokenRequestBody } from '@dogu-tech/device-client-common';
import { Body, Controller, Post } from '@nestjs/common';
import { DoguLogger } from '../logger/logger';
import { DeviceAuthService } from './device-auth.service';

@Controller(DeviceAuth.controller)
export class DeviceAuthController {
  constructor(
    private readonly authService: DeviceAuthService,
    private readonly logger: DoguLogger,
  ) {}

  @Post(DeviceAuth.refreshAdminToken.path)
  refreshAdminToken(@Body() request: RefreshAdminTokenRequestBody): Instance<typeof DeviceAuth.refreshAdminToken.responseBody> {
    if (request.beforeToken.value !== this.authService.adminToken.value) {
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
}
