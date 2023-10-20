import { LicenseType } from '@dogu-private/console';
import { DateTime, DurationLike } from 'luxon';
import { LicenseToken } from '../../db/entity/license-token.enitiy';

export class LicenseTokenService {
  static createToken(): string {
    return Math.random().toString(36).slice(2) + DateTime.now().toMillis().toString(36).slice(2) + Math.random().toString(36).slice(2);
  }

  static createLicensToken(licenseType: LicenseType): string {
    const tokenBody = this.createToken();
    const hostToken = `dogu-${licenseType}-token-${tokenBody}`;
    return hostToken;
  }

  static createExpiredAt(duration: DurationLike): Date {
    return DateTime.now().plus(duration).toJSDate();
  }

  static isExpired(token: LicenseToken): boolean {
    if (token.expiredAt !== null && token.expiredAt.getTime() < DateTime.now().toMillis()) {
      return true;
    }
    return false;
  }
}
