// import { LicenseType } from '@dogu-private/console';
import { DateTime, DurationLike } from 'luxon';
// import { LicenseToken } from '../../db/entity/license-token.enitiy';

export class LicenseTokenService {
  static createToken(): string {
    return Math.random().toString(36).slice(2) + DateTime.now().toMillis().toString(36).slice(2) + Math.random().toString(36).slice(2);
  }

  static createLicensToken(): string {
    const tokenBody = this.createToken();
    return tokenBody;
  }

  static createExpiredAt(duration: DurationLike): Date {
    return DateTime.now().plus(duration).toJSDate();
  }
}
