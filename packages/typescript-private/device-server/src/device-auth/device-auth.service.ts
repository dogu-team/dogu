import { DeviceAdminToken, DeviceTemporaryToken } from '@dogu-private/types';
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../env';
import { DoguLogger } from '../logger/logger';

@Injectable()
export class DeviceAuthService {
  private adminToken: DeviceAdminToken;
  private temporaryTokens: DeviceTemporaryToken[] = [];

  constructor(private readonly logger: DoguLogger) {
    this.adminToken = new DeviceAdminToken(env.DOGU_SECRET_INITIAL_ADMIN_TOKEN);
  }

  validateAdmin(value: string): boolean {
    if (value !== this.adminToken.value) {
      return false;
    }
    return true;
  }

  refreshAdminToken(value: string): void {
    this.adminToken = new DeviceAdminToken(value);
  }

  generateTemporaryToken(): DeviceTemporaryToken {
    const token = new DeviceTemporaryToken(uuidv4());
    this.temporaryTokens.push(token);
    return token;
  }

  deleteTemporaryToken(token: DeviceTemporaryToken): void {
    this.temporaryTokens = this.temporaryTokens.filter((t) => t.value !== token.value);
  }
}
