import { GetAvailableBillingCouponsDto, ValidateBillingCouponDto, ValidateBillingCouponResponse } from '@dogu-private/console';
import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { BillingCoupon } from '../../db/entity/billing-coupon.entity';
import { BillingTokenPermission } from '../auth/guard/billing-token.guard';
import { BillingCouponService } from './billing-coupon.service';

@Controller('/billing/coupons')
export class BillingCouponController {
  constructor(private readonly billingCouponService: BillingCouponService) {}

  @Get('/validate')
  @BillingTokenPermission()
  async validateBillingCoupon(@Query() dto: ValidateBillingCouponDto): Promise<ValidateBillingCouponResponse> {
    const response = await this.billingCouponService.validateCoupon(dto);
    if (!response.ok) {
      throw new BadRequestException(response.resultCode);
    }

    return response;
  }

  @Get('/availables')
  @BillingTokenPermission()
  async getAvailableBillingCoupons(@Query() dto: GetAvailableBillingCouponsDto): Promise<BillingCoupon[]> {
    return await this.billingCouponService.getAvailableCoupons(dto);
  }
}
