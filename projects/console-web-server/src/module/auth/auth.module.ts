import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token, UserAndRefreshToken } from '../../db/entity/index';
import { env } from '../../env';
import { AuthHostService } from './service/auth-host.service';
import { AuthJwtService } from './service/auth-jwt.service';

import { AuthUserService } from './service/auth-user.service';
import { GoogleStrategy } from './strategy/google-strategy';
import { FeatureConfig } from '../../feature.config';

const PROVIDERS = FeatureConfig.get('thirdPartyLogin')
  ? [AuthUserService, AuthJwtService, AuthHostService, GoogleStrategy] //
  : [AuthUserService, AuthJwtService, AuthHostService];

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([UserAndRefreshToken, Token]),
    JwtModule.register({
      secret: env.DOGU_SECRET,
    }),
  ],
  exports: [AuthUserService, AuthJwtService, AuthHostService],
  providers: PROVIDERS,
  controllers: [],
})
export class AuthModule {}
