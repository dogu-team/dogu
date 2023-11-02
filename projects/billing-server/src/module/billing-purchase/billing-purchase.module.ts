import { Module } from '@nestjs/common';
import { BillingMethodModule } from '../billing-method/billing-method.module';
import { BillingOrganizationModule } from '../billing-organization/billing-organization.module';
import { BillingTokenModule } from '../billing-token/billing-token.module';
import { BillingPurchaseController } from './billing-purchase.controller';
import { BillingPurchaseService } from './billing-purchase.service';

@Module({
  imports: [BillingTokenModule, BillingMethodModule, BillingOrganizationModule],
  controllers: [BillingPurchaseController],
  providers: [BillingPurchaseService],
})
export class BillingPurchaseModule {}
