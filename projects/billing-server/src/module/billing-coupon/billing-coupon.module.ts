import { Module } from '@nestjs/common';
import { BillingTokenModule } from '../billing-token/billing-token.module';
import { BillingCouponController } from './billing-coupon.controller';
import { BillingCouponService } from './billing-coupon.service';

@Module({
  controllers: [BillingCouponController],
  providers: [BillingCouponService],
  imports: [BillingTokenModule],
})
export class BillingCouponModule {}
