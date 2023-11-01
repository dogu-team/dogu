import { ValidateBillingCouponDto, ValidateBillingCouponResponse } from '@dogu-private/console';
import { Controller, Get, Query } from '@nestjs/common';
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
}
