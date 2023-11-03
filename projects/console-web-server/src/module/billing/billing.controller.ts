import { CallBillingApiResponse } from '@dogu-private/console';
import { Controller, Get, Query } from '@nestjs/common';

import { ORGANIZATION_ROLE } from '../auth/auth.types';
import { OrganizationPermission } from '../auth/decorators';
import { BillingCaller } from './billing.caller';
import { BillingService } from './billing.service';

@Controller('billing')
export class BillingController {
  constructor(
    private readonly billingService: BillingService,
    private readonly billingCaller: BillingCaller,
  ) {}

  // coupon
  @Get('/coupons/validate')
  @OrganizationPermission(ORGANIZATION_ROLE.ADMIN)
  async validateCoupon(@Query() query: object): Promise<CallBillingApiResponse> {
    return await this.billingCaller.callBillingApi({
      method: 'GET',
      path: 'billing/coupons/validate',
      query,
    });
  }

  @Get('/coupons/availables')
  @OrganizationPermission(ORGANIZATION_ROLE.ADMIN)
  async findAvailableCoupon(@Query() query: object): Promise<CallBillingApiResponse> {
    return await this.billingCaller.callBillingApi({
      method: 'GET',
      path: 'billing/coupons/availables',
      query,
    });
  }

  // purchase
  @Get('/purchase/preview')
  @OrganizationPermission(ORGANIZATION_ROLE.ADMIN)
  async getSubscriptionPreview(@Query() query: object): Promise<CallBillingApiResponse> {
    return await this.billingCaller.callBillingApi({
      method: 'GET',
      path: 'billing/purchase/preview',
      query,
    });
  }
}
