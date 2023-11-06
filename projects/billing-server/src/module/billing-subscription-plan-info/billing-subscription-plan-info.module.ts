import { Module } from '@nestjs/common';
import { BillingSubscriptionPlanInfoController } from './billing-subscription-plan-info.controller';
import { BillingSubscriptionPlanInfoService } from './billing-subscription-plan-info.service';

@Module({
  controllers: [BillingSubscriptionPlanInfoController],
  providers: [BillingSubscriptionPlanInfoService],
})
export class BillingSubscriptionPlanInfoModule {}
