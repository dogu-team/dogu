import { Module } from '@nestjs/common';
import { BillingTokenModule } from '../billing-token/billing-token.module';
import { DateTimeSimulatorModule } from '../date-time-simulator/date-time-simulator.module';
import { BillingCouponSubscriber } from './billign-coupon.subscriber';
import { BillingCouponController } from './billing-coupon.controller';
import { BillingCouponService } from './billing-coupon.service';

@Module({
  imports: [BillingTokenModule, DateTimeSimulatorModule],
  controllers: [BillingCouponController],
  providers: [BillingCouponService, BillingCouponSubscriber],
})
export class BillingCouponModule {}
