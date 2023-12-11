import { Module } from '@nestjs/common';
import { BillingCouponModule } from '../billing-coupon/billing-coupon.module';
import { BillingPlanSourceModule } from '../billing-plan-source/billing-plan-source.module';
import { PaddleModule } from '../paddle/paddle.module';
import { LeaderInitializer } from './leader.initializer';

@Module({
  imports: [BillingPlanSourceModule, PaddleModule, BillingCouponModule],
  providers: [LeaderInitializer],
})
export class LeaderModule {}
