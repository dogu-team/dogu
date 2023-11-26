import { Module } from '@nestjs/common';
import { BillingCouponModule } from '../billing-coupon/billing-coupon.module';
import { BillingSubscriptionPlanSourceModule } from '../billing-subscription-plan-source/billing-subscription-plan-source.module';
import { PaddleModule } from '../paddle/paddle.module';
import { LeaderInitializer } from './leader.initializer';

@Module({
  imports: [BillingSubscriptionPlanSourceModule, PaddleModule, BillingCouponModule],
  providers: [LeaderInitializer],
})
export class LeaderModule {}
