import { DeviceAdminToken, DeviceTemporaryToken, Serial } from '@dogu-private/types';
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../env';
import { DoguLogger } from '../logger/logger';

interface SerialToToken {
  serial: Serial;
  token: DeviceTemporaryToken;
}

@Injectable()
export class AuthService {
  private adminToken: DeviceAdminToken;
  private temporaryTokens: SerialToToken[] = [];

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

  generateTemporaryToken(serial: Serial): DeviceTemporaryToken {
    const token: DeviceTemporaryToken = { value: uuidv4() };
    this.temporaryTokens.push({ serial, token });
    return token;
  }

  deleteTemporaryToken(token: DeviceTemporaryToken): void {
    this.temporaryTokens = this.temporaryTokens.filter((t) => t.token.value !== token.value);
  }

  validateTemporaryToken(serial: Serial, token: DeviceTemporaryToken): boolean {
    const found = this.temporaryTokens.find((t) => t.token.value === token.value && t.serial === serial);
    if (!found) {
      return false;
    }
    return true;
  }
}
