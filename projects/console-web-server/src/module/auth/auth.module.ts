import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token, User, UserAndRefreshToken } from '../../db/entity/index';
import { env } from '../../env';
import { AuthHostService } from './service/auth-host.service';
import { AuthJwtService } from './service/auth-jwt.service';

import { FEATURE_CONFIG } from '../../feature.config';
import { AuthRemoteService } from './service/auth-remote.service';
import { AuthUserService } from './service/auth-user.service';
import { V1AuthOpenApiService } from './service/open-api/v1/auth-open-api.service';
import { GoogleStrategy } from './strategy/google-strategy';

const PROVIDERS = FEATURE_CONFIG.get('thirdPartyLogin')
  ? [AuthUserService, AuthJwtService, AuthHostService, AuthRemoteService, V1AuthOpenApiService, GoogleStrategy] //
  : [AuthUserService, AuthJwtService, AuthHostService, AuthRemoteService, V1AuthOpenApiService];

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([UserAndRefreshToken, Token, User]),
    JwtModule.register({
      secret: env.DOGU_SECRET,
    }),
  ],
  exports: [AuthUserService, AuthJwtService, AuthHostService, AuthRemoteService, V1AuthOpenApiService],
  providers: PROVIDERS,
  controllers: [],
})
export class AuthModule {}
