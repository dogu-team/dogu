import { DateTime, DurationLike } from 'luxon';
import { Token } from '../../db/entity/token.entity';

export class TokenService {
  static createToken(): string {
    return Math.random().toString(36).slice(2) + DateTime.now().toMillis().toString(36).slice(2) + Math.random().toString(36).slice(2);
  }

  static createOrganizationAccessToken(): string {
    const tokenBody = this.createToken();
    const orgApiToken = `dogu-org-token-${tokenBody}`;
    return orgApiToken;
  }

  static createProjectAccessToken(): string {
    const tokenBody = this.createToken();
    const orgApiToken = `dogu-project-token-${tokenBody}`;
    return orgApiToken;
  }

  static createPersonalAccessToken(): string {
    const tokenBody = this.createToken();
    const orgApiToken = `dogu-personal-token-${tokenBody}`;
    return orgApiToken;
  }

  static createHostToken(): string {
    const tokenBody = this.createToken();
    const hostToken = `dogu-agent-token-${tokenBody}`;
    return hostToken;
  }

  static createExpiredAt(duration: DurationLike): Date {
    return DateTime.now().plus(duration).toJSDate();
  }

  static isExpired(token: Token): boolean {
    if (token.expiredAt !== null && token.expiredAt.getTime() < DateTime.now().toMillis()) {
      return true;
    }
    return false;
  }
}
