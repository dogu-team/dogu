import { Module } from '@nestjs/common';
import { BillingMethodModule } from '../billing-method/billing-method.module';
import { BillingTokenModule } from '../billing-token/billing-token.module';
import { BillingOrganizationController } from './billing-organization.controller';
import { BillingOrganizationService } from './billing-organization.service';

@Module({
  imports: [BillingTokenModule, BillingMethodModule],
  controllers: [BillingOrganizationController],
  providers: [BillingOrganizationService],
})
export class BillingOrganizationModule {}
