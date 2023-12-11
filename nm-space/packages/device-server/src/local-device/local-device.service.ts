import { LocalDeviceDetectToken } from '@dogu-private/types';
import { errorify } from '@dogu-tech/common';
import { Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { DoguLogger } from '../logger/logger';

interface LiveToken {
  token: LocalDeviceDetectToken;
  lifeTimeSeconds: number;
  creatTime: Date;
}

@Injectable()
export class LocalDeviceService {
  private readonly tokens: LiveToken[] = [];

  constructor(private readonly logger: DoguLogger) {}

  saveToken(token: LocalDeviceDetectToken, lifeTimeSeconds: number): void {
    this.removeInvalidTokens();
    this.tokens.push({ token, lifeTimeSeconds, creatTime: new Date() });
  }

  getTokens(): LocalDeviceDetectToken[] {
    this.removeInvalidTokens();
    return this.tokens.map((token) => token.token);
  }

  private isTokenValid(token: LiveToken): boolean {
    const now = new Date();
    return now.getTime() - token.creatTime.getTime() < token.lifeTimeSeconds * 1000;
  }

  private removeInvalidTokens(): void {
    this.tokens.forEach((token, index) => {
      if (!this.isTokenValid(token)) {
        this.tokens.splice(index, 1);
      }
    });
  }

  @Interval(10 * 1000)
  removeInvalidTokensInterval(): void {
    try {
      this.removeInvalidTokens();
    } catch (error) {
      this.logger.error('remove invalid tokens failed', { error: errorify(error) });
    }
  }
}
