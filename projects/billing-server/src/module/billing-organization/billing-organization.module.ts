import { Module } from '@nestjs/common';
import { BillingMethodNiceModule } from '../billing-method-nice/billing-method-nice.module';
import { BillingTokenModule } from '../billing-token/billing-token.module';
import { BillingOrganizationController } from './billing-organization.controller';
import { BillingOrganizationService } from './billing-organization.service';

@Module({
  imports: [BillingTokenModule, BillingMethodNiceModule],
  controllers: [BillingOrganizationController],
  providers: [BillingOrganizationService],
})
export class BillingOrganizationModule {}
