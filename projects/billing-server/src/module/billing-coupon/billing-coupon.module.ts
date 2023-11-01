import { Module } from '@nestjs/common';
import { BillingCouponController } from './billing-coupon.controller';
import { BillingCouponService } from './billing-coupon.service';

@Module({
  controllers: [BillingCouponController],
  providers: [BillingCouponService],
})
export class BillingCouponModule {}
