import { UserId, USER_ACCESS_TOKEN_COOKIE_NAME, USER_ID_COOKIE_NAME, USER_REFRESH_TOKEN_COOKIE_NAME } from '@dogu-private/types';
import { CookieOptions, Response } from 'express';
import { env } from '../env';
import { FeatureConfig } from '../feature.config';

export const resetSignAccessTokenCookie = (response: Response, accessToken: string): Response => {
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14);

  const options: CookieOptions = {
    httpOnly: false,
    expires,
    domain: env.DOGU_CONSOLE_DOMAIN,
  };

  return response.cookie(USER_ACCESS_TOKEN_COOKIE_NAME, accessToken, options);
};

export const setSignCookiesInResponse = (response: Response, accessToken: string, refreshToken: string, userId: UserId): Response => {
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14);

  return response
    .cookie(USER_ACCESS_TOKEN_COOKIE_NAME, accessToken, {
      httpOnly: false,
      expires,
      domain: env.DOGU_CONSOLE_DOMAIN,
    })
    .cookie(USER_REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      expires,
      domain: env.DOGU_CONSOLE_DOMAIN,
      secure: FeatureConfig.get('cookieSecure') ? true : false,
      sameSite: 'lax',
    })
    .cookie(USER_ID_COOKIE_NAME, userId, {
      httpOnly: false,
      expires,
      domain: env.DOGU_CONSOLE_DOMAIN,
    });
};

export const clearSignCookiesInResponse = (response: Response): Response => {
  return response
    .clearCookie(USER_ACCESS_TOKEN_COOKIE_NAME, {
      httpOnly: false,
      domain: env.DOGU_CONSOLE_DOMAIN,
      expires: new Date(),
    })
    .clearCookie(USER_REFRESH_TOKEN_COOKIE_NAME, {
      httpOnly: true,
      expires: new Date(),
      domain: env.DOGU_CONSOLE_DOMAIN,
      secure: FeatureConfig.get('cookieSecure') ? true : false,
      sameSite: 'lax',
    })
    .clearCookie(USER_ID_COOKIE_NAME, {
      httpOnly: false,
      expires: new Date(),
      domain: env.DOGU_CONSOLE_DOMAIN,
    });
};
