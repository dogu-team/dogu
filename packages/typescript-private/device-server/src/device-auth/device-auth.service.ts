import { DeviceAdminToken } from '@dogu-private/types';
import { Injectable } from '@nestjs/common';
import { env } from '../env';
import { DoguLogger } from '../logger/logger';

@Injectable()
export class DeviceAuthService {
  private _adminToken: DeviceAdminToken;

  constructor(private readonly logger: DoguLogger) {
    this._adminToken = new DeviceAdminToken(env.DOGU_SECRET_INITIAL_ADMIN_TOKEN);
  }

  get adminToken(): DeviceAdminToken {
    return this._adminToken;
  }

  refreshAdminToken(value: string): void {
    this._adminToken = new DeviceAdminToken(value);
  }
}
