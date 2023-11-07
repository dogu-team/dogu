import { Module } from '@nestjs/common';
import { BillingTokenModule } from '../billing-token/billing-token.module';
import { BillingSubscriptionPlanInfoController } from './billing-subscription-plan-info.controller';
import { BillingSubscriptionPlanInfoService } from './billing-subscription-plan-info.service';

@Module({
  imports: [BillingTokenModule],
  controllers: [BillingSubscriptionPlanInfoController],
  providers: [BillingSubscriptionPlanInfoService],
})
export class BillingSubscriptionPlanInfoModule {}
