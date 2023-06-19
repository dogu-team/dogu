import { GOOGLE, GoogleOAuthPayload, SNS_TYPE } from '@dogu-private/types';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { config } from '../../../config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, GOOGLE) {
  constructor() {
    super({
      clientID: config.google.oauth.login.clientId,
      clientSecret: config.google.oauth.login.clientSecret,
      callbackURL: config.google.oauth.login.callbackUrl,
      scope: ['email', 'profile'],
    });
  }

  override authorizationParams(options: any): any {
    return {
      ...options,
      prompt: 'select_account',
    };
  }

  validate(accessToken: string, refreshToken: string, profile: Profile): GoogleOAuthPayload {
    const { id, emails, name } = profile;
    const email = emails?.[0].value;

    if (!email) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    const user: GoogleOAuthPayload = {
      userSnsId: id,
      email,
      name: name?.givenName,
      snsType: SNS_TYPE.GOOGLE,
    };

    return user;
  }
}
