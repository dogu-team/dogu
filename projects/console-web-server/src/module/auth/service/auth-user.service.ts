import {
  isUserAuthToken,
  UserAuthToken,
  UserId,
  UserPayload,
  USER_ACCESS_TOKEN_COOKIE_NAME,
  USER_REFRESH_TOKEN_COOKIE_NAME,
  USER_REFRESH_TOKEN_EXPIRE_TIME,
} from '@dogu-private/types';
import { stringify } from '@dogu-tech/common';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { Request, Response } from 'express';
import { IncomingMessage } from 'http';
import { DateTime } from 'luxon';
import { DataSource, EntityManager, In } from 'typeorm';
import { v4 } from 'uuid';
import { UserAndRefreshToken } from '../../../db/entity/relations/user-and-refresh-token.entity';
import { Token } from '../../../db/entity/token.entity';
import { clearSignCookiesInResponse, resetSignAccessTokenCookie } from '../../../utils/cookie';
import { DoguLogger } from '../../logger/logger';
import { TokenService } from '../../token/token.service';
import { AuthJwtService } from './auth-jwt.service';

@Injectable()
export class AuthUserService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly logger: DoguLogger,
    @Inject(AuthJwtService)
    private readonly authJwtService: AuthJwtService,
  ) {}

  async validateUser(req: Request, res: Response): Promise<UserPayload> {
    const userAuthToken = this.getUserAuthTokenByRequest(req);
    if (!userAuthToken) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    const { accessToken, refreshToken } = userAuthToken;

    const payload = await this.verifyUserAuthToken(res, accessToken, refreshToken);
    if (!payload) {
      clearSignCookiesInResponse(res);
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    return payload;
  }

  async verifyUserAuthToken(res: Response, accessToken: string, refreshToken: string): Promise<UserPayload | null> {
    try {
      const payload = this.authJwtService.verifyUserAccessToken(accessToken);
      return payload;
    } catch (error) {
      if (error instanceof Error && error.hasOwnProperty('name') && error.name === 'TokenExpiredError') {
        try {
          this.logger.info('getJwtTokenFromCookie. access token expired. reissue access token');

          // access token 만료시 토큰 재발급
          const userId: UserId = await this.veriyUserRefreshToken(refreshToken);

          // refresh token 유효시 access token 재발급
          const newAccessToken = this.authJwtService.makeUserAccessToken(userId);
          resetSignAccessTokenCookie(res, newAccessToken);
          return { userId };
        } catch (refreshTokenError) {
          this.logger.error('getJwtTokenFromCookie. refresh token error');
          this.logger.error(stringify(refreshTokenError));
          return null;
        }
      } else {
        this.logger.error('getJwtTokenFromCookie. invaild access token.');
        this.logger.error(stringify(error));
        return null;
      }
    }
  }

  getUserAuthTokenByWsConnection(incomingMessage: IncomingMessage): UserAuthToken | null {
    const cookies = incomingMessage.headers.cookie;
    if (!cookies) {
      this.logger.error('getUserAuthTokenByWsConnection. cookie not found');
      return null;
    }

    const accessToken = cookies
      .split('; ')
      .find((cookie: string) => cookie.startsWith(USER_ACCESS_TOKEN_COOKIE_NAME))
      ?.split('=')[1];
    if (!accessToken) {
      this.logger.error('getUserAuthTokenByWsConnection. access token not found');
      return null;
    }

    const refreshToken = cookies
      .split('; ')
      .find((cookie: string) => cookie.startsWith(USER_REFRESH_TOKEN_COOKIE_NAME))
      ?.split('=')[1];
    if (!refreshToken) {
      this.logger.error('getUserAuthTokenByWsConnection. refresh token not found');
      return null;
    }

    return { accessToken, refreshToken };
  }

  getUserAuthTokenByRequest(req: Request): UserAuthToken | null {
    const accessToken = req.cookies[USER_ACCESS_TOKEN_COOKIE_NAME];
    const refreshToken = req.cookies[USER_REFRESH_TOKEN_COOKIE_NAME];

    if (accessToken && refreshToken) {
      return { accessToken, refreshToken };
    }

    if (!accessToken && !refreshToken) {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return null;
      }

      const tokenJsonString = authHeader.split(' ')[1];
      const tokenJson = JSON.parse(tokenJsonString);
      if (!isUserAuthToken(tokenJson)) {
        return null;
      }
      return tokenJson;
    }

    this.logger.error('getUserAuthTokenByRequest. invalid token');

    return null;
  }

  async veriyUserRefreshToken(refreshToken: string): Promise<UserId> {
    const token = await this.dataSource.getRepository(Token).findOne({ where: { token: refreshToken } });
    if (!token) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    if (TokenService.isExpired(token)) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    const userAndRefreshToken = await this.dataSource.getRepository(UserAndRefreshToken).findOne({ where: { tokenId: token.tokenId } });
    if (!userAndRefreshToken) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    return userAndRefreshToken.userId;
  }

  async softDeleteUserRefreshToken(refreshToken: string): Promise<void> {
    const token = await this.dataSource.getRepository(Token).findOne({ where: { token: refreshToken } });
    if (!token) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    await this.dataSource.transaction(async (manager) => {
      await manager.getRepository(Token).softDelete({ tokenId: token.tokenId });
      await manager.getRepository(UserAndRefreshToken).softDelete({ tokenId: token.tokenId });
    });
  }

  async createRefreshToken(manager: EntityManager, userId: UserId): Promise<string> {
    const tokenString = TokenService.createToken();
    const expiredAt = DateTime.now().plus({ days: USER_REFRESH_TOKEN_EXPIRE_TIME }).toJSDate();

    const tokenData = manager.getRepository(Token).create({
      tokenId: v4(),
      token: tokenString,
      expiredAt,
    });
    const token = await manager.getRepository(Token).save(tokenData);
    const userAndRefreshToken = manager.getRepository(UserAndRefreshToken).create({
      userId,
      tokenId: token.tokenId,
    });
    await manager.getRepository(UserAndRefreshToken).save(userAndRefreshToken);

    return token.token;
  }

  async clearExpiredUserRefreshToken(userId: UserId): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const userAndRefreshTokens = await manager.getRepository(UserAndRefreshToken).find({ where: { userId } });
      if (userAndRefreshTokens.length === 0) {
        throw new HttpException(`This user has no refresh token. Please login again. userId: ${userId}`, HttpStatus.BAD_REQUEST);
      }

      const tokenIds = userAndRefreshTokens.map((userAndRefreshToken) => userAndRefreshToken.tokenId);
      const tokens = await manager.getRepository(Token).find({ where: { tokenId: In(tokenIds) } });

      const expiredTokens = tokens.filter((token) => TokenService.isExpired(token));
      if (expiredTokens.length === 0) {
        return;
      }

      await manager.getRepository(Token).softDelete({ tokenId: In(expiredTokens.map((token) => token.tokenId)) });
      await manager.getRepository(UserAndRefreshToken).softDelete({ tokenId: In(expiredTokens.map((token) => token.tokenId)) });
    });

    return;
  }
}
