import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LicenseSelfHostedTier } from '../../db/entity/license-self-hosted-tier.enitiy';
import { LicenseToken } from '../../db/entity/license-token.enitiy';
import { License } from '../../db/entity/license.enitiy';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([License, LicenseToken, LicenseSelfHostedTier])],
  exports: [],
  providers: [],
  controllers: [],
})
export class AuthModule {}
