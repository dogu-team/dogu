import { isUserPayload, UserId, UserPayload, USER_ACCESS_TOKEN_EXPIRE_TIME } from '@dogu-private/types';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { env } from '../../../env';
import { DoguLogger } from '../../logger/logger';

@Injectable()
export class AuthJwtService {
  constructor(
    @Inject(JwtService)
    private readonly jwtService: JwtService,
    private readonly logger: DoguLogger,
  ) {}

  makeUserAccessToken(userId: UserId): string {
    const payload: UserPayload = { userId };
    const accessTokenOptions: JwtSignOptions = {
      expiresIn: USER_ACCESS_TOKEN_EXPIRE_TIME,
    };
    const accessToken = this.jwtService.sign(payload, accessTokenOptions);

    return accessToken;
  }

  verifyUserAccessToken(accessToken: string): UserPayload {
    const payload = this.jwtService.verify(accessToken, { secret: env.DOGU_SECRET });
    if (!isUserPayload(payload)) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    return payload;
  }
}
