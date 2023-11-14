import { Module } from '@nestjs/common';
import { BillingSubscriptionPlanSourceController } from './billing-subscription-plan-source.controller';

@Module({
  controllers: [BillingSubscriptionPlanSourceController],
})
export class BillingSubscriptionPlanSourceModule {}
