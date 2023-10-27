// import { LicenseType } from '@dogu-private/console';
import { DateTime, DurationLike } from 'luxon';
// import { LicenseToken } from '../../db/entity/license-token.enitiy';

export class LicenseKeyService {
  static createKey(): string {
    return Math.random().toString(36).slice(2) + DateTime.now().toMillis().toString(36).slice(2) + Math.random().toString(36).slice(2);
  }

  static createLicensKey(): string {
    const tokenBody = `dogu-license-${this.createKey()}`;
    return tokenBody;
  }

  static createExpiredAt(duration: DurationLike): Date {
    return DateTime.now().plus(duration).toJSDate();
  }
}
