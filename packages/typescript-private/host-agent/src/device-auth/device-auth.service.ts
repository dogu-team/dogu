import { DeviceAdminToken, DeviceTemporaryToken, DOGU_DEVICE_AUTHORIZATION_HEADER_KEY } from '@dogu-private/types';
import { Injectable } from '@nestjs/common';
import { DeviceClientService } from '../device-client/device-client.service';
import { env } from '../env';
import { DoguLogger } from '../logger/logger';

@Injectable()
export class DeviceAuthService {
  private _adminToken: DeviceAdminToken;

  constructor(
    private readonly deviceClient: DeviceClientService,
    private readonly logger: DoguLogger,
  ) {
    this._adminToken = new DeviceAdminToken(env.DOGU_SECRET_INITIAL_ADMIN_TOKEN);
  }

  get adminToken(): DeviceAdminToken {
    return this._adminToken;
  }

  makeAuthHeader(): { [DOGU_DEVICE_AUTHORIZATION_HEADER_KEY]: string } {
    return {
      [DOGU_DEVICE_AUTHORIZATION_HEADER_KEY]: this._adminToken.value,
    };
  }

  validate(value: string): boolean {
    if (value !== this._adminToken.value) {
      return false;
    }
    return true;
  }

  refreshAdminToken(value: string): void {
    this._adminToken = new DeviceAdminToken(value);
  }

  async generateTemporaryToken(serial: string, lifetimeMs: number): Promise<DeviceTemporaryToken> {
    return await this.deviceClient.deviceClient.generateTemporaryToken(serial, { lifetimeMs });
  }

  async deleteTemporaryToken(token: DeviceTemporaryToken): Promise<void> {
    await this.deviceClient.deviceClient.deleteTemporaryToken({ token });
  }
}
