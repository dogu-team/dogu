import { DateTime, DurationLike } from 'luxon';

export class LicenseKeyService {
  static createKey(now: Date): string {
    return Math.random().toString(36).slice(2) + DateTime.fromJSDate(now).toMillis().toString(36).slice(2) + Math.random().toString(36).slice(2);
  }

  static createLicensKey(now: Date): string {
    const tokenBody = `dogu-license-${this.createKey(now)}`;
    return tokenBody;
  }

  static createExpiredAt(duration: DurationLike, now: Date): Date {
    return DateTime.fromJSDate(now).plus(duration).toJSDate();
  }
}
