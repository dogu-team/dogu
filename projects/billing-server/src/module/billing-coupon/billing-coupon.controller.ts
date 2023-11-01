import { ValidateBillingCouponByOrganizationIdDto, ValidateBillingCouponByOrganizationIdResponse } from '@dogu-private/console';
import { Controller, Get, Query } from '@nestjs/common';
import { BillingCouponService } from './billing-coupon.service';

@Controller('/billing-coupons')
export class BillingCouponController {
  constructor(private readonly billingCouponService: BillingCouponService) {}

  @Get('/validate')
  async validateBillingCouponByOrganizationId(@Query() dto: ValidateBillingCouponByOrganizationIdDto): Promise<ValidateBillingCouponByOrganizationIdResponse> {
    return await this.billingCouponService.validateBillingCouponByOrganizationId(dto);
  }
}
