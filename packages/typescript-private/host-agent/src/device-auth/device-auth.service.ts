import { DeviceAdminToken } from '@dogu-private/types';
import { Injectable } from '@nestjs/common';
import { env } from '../env';
import { DoguLogger } from '../logger/logger';

@Injectable()
export class DeviceAuthService {
  private adminToken: DeviceAdminToken;

  constructor(private readonly logger: DoguLogger) {
    this.adminToken = new DeviceAdminToken(env.DOGU_SECRET_INITIAL_ADMIN_TOKEN);
  }

  validate(value: string): boolean {
    if (value !== this.adminToken.value) {
      return false;
    }
    return true;
  }

  refreshAdminToken(value: string): void {
    this.adminToken = new DeviceAdminToken(value);
  }
}
