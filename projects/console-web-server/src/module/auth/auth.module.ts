import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Token, User, UserAndRefreshToken } from '../../db/entity/index';
import { AuthLicenseService } from '../../enterprise/module/auth/service/auth-license.service';
import { V1AuthOpenApiService } from '../../enterprise/module/auth/service/open-api/v1/auth-open-api.service';
import { LicenseModule } from '../../enterprise/module/license/license.module';
import { env } from '../../env';
import { FEATURE_CONFIG } from '../../feature.config';
import { AuthHostService } from './service/auth-host.service';
import { AuthJwtService } from './service/auth-jwt.service';
import { AuthRemoteService } from './service/auth-remote.service';
import { AuthUserService } from './service/auth-user.service';
import { GoogleStrategy } from './strategy/google-strategy';

const PROVIDERS = FEATURE_CONFIG.get('thirdPartyLogin')
  ? [AuthUserService, AuthJwtService, AuthHostService, AuthRemoteService, V1AuthOpenApiService, AuthLicenseService, GoogleStrategy] //
  : [AuthUserService, AuthJwtService, AuthHostService, AuthRemoteService, V1AuthOpenApiService, AuthLicenseService];

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([UserAndRefreshToken, Token, User]),
    JwtModule.register({
      secret: env.DOGU_SECRET,
    }),
    LicenseModule,
  ],
  exports: PROVIDERS,
  providers: PROVIDERS,
  controllers: [],
})
export class AuthModule {}
