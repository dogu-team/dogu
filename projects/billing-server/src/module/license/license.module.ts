import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LicenseSelfHostedTier } from '../../db/entity/license-self-hosted-tier.enitiy';
import { LicenseToken } from '../../db/entity/license-token.enitiy';
import { License } from '../../db/entity/license.enitiy';
import { LicenseController } from './license.controller';
import { LicenseService } from './license.service';

@Module({
  imports: [TypeOrmModule.forFeature([License, LicenseSelfHostedTier, LicenseToken])],
  controllers: [LicenseController],
  providers: [LicenseService],
})
export class LicenseModule {}
