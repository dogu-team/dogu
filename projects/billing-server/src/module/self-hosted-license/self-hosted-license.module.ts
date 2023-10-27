import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SelfHostedLicense } from '../../db/entity/self-hosted-license.entity';
import { BillingTokenModule } from '../billing-token/billing-token.module';
import { SelfHostedLicenseController } from './self-hosted-license.controller';
import { SelfHostedLicenseService } from './self-hosted-license.service';

@Module({
  imports: [TypeOrmModule.forFeature([SelfHostedLicense]), BillingTokenModule],
  controllers: [SelfHostedLicenseController],
  providers: [SelfHostedLicenseService],
})
export class SelfHostedLicenseModule {}
