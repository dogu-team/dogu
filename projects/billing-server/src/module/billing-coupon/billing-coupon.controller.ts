import { GetAvailableBillingCouponsDto, ValidateBillingCouponDto, ValidateBillingCouponResponse } from '@dogu-private/console';
import { Controller, Get, Query } from '@nestjs/common';
import { BillingCoupon } from '../../db/entity/billing-coupon.entity';
import { BillingTokenPermission } from '../auth/guard/billing-token.guard';
import { BillingCouponService } from './billing-coupon.service';

@Controller('/billing/coupons')
export class BillingCouponController {
  constructor(private readonly billingCouponService: BillingCouponService) {}

  @Get('/validate')
  @BillingTokenPermission()
  async validateBillingCoupon(@Query() dto: ValidateBillingCouponDto): Promise<ValidateBillingCouponResponse> {
    return await this.billingCouponService.validateBillingCoupon(dto);
  }

  @Get('/available')
  @BillingTokenPermission()
  async getAvailableBillingCoupons(@Query() dto: GetAvailableBillingCouponsDto): Promise<BillingCoupon[]> {
    return await this.billingCouponService.getAvailableBillingCoupons(dto);
  }
}
