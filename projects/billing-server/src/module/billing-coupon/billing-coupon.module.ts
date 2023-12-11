import { Module } from '@nestjs/common';
import { BillingTokenModule } from '../billing-token/billing-token.module';
import { DateTimeSimulatorModule } from '../date-time-simulator/date-time-simulator.module';
import { PaddleModule } from '../paddle/paddle.module';
import { BillingCouponSubscriber } from './billign-coupon.subscriber';
import { BillingCouponController } from './billing-coupon.controller';
import { BillingCouponService } from './billing-coupon.service';

@Module({
  imports: [BillingTokenModule, DateTimeSimulatorModule, PaddleModule],
  controllers: [BillingCouponController],
  providers: [BillingCouponService, BillingCouponSubscriber],
  exports: [BillingCouponSubscriber, BillingCouponService],
})
export class BillingCouponModule {}
