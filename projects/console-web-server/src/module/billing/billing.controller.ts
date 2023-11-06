import {
  BillingCouponBase,
  CallBillingApiResponse,
  CreatePurchaseSubscriptionWithNewCardResponse,
  FindBillingMethodResponse,
  GetBillingSubscriptionPreviewResponse,
  UpdateBillingMethodResponse,
  ValidateBillingCouponResponse,
} from '@dogu-private/console';
import { Body, Controller, Get, Post, Put, Query } from '@nestjs/common';

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
  async validateCoupon(@Query() query: object): Promise<CallBillingApiResponse<ValidateBillingCouponResponse>> {
    return await this.billingCaller.callBillingApi<ValidateBillingCouponResponse>({
      method: 'GET',
      path: 'billing/coupons/validate',
      query,
    });
  }

  @Get('/coupons/availables')
  @OrganizationPermission(ORGANIZATION_ROLE.ADMIN)
  async findAvailableCoupon(@Query() query: object): Promise<CallBillingApiResponse<BillingCouponBase[]>> {
    return await this.billingCaller.callBillingApi<BillingCouponBase[]>({
      method: 'GET',
      path: 'billing/coupons/availables',
      query,
    });
  }

  // purchase
  @Get('/purchase/preview')
  @OrganizationPermission(ORGANIZATION_ROLE.ADMIN)
  async getSubscriptionPreview(@Query() query: object): Promise<CallBillingApiResponse<GetBillingSubscriptionPreviewResponse>> {
    return await this.billingCaller.callBillingApi<GetBillingSubscriptionPreviewResponse>({
      method: 'GET',
      path: 'billing/purchase/preview',
      query,
    });
  }

  @Post('/purchase/new-card')
  @OrganizationPermission(ORGANIZATION_ROLE.ADMIN)
  async createPurchaseSubscriptionWithNewCard(@Query() query: object, @Body() body: object): Promise<CallBillingApiResponse<CreatePurchaseSubscriptionWithNewCardResponse>> {
    return await this.billingCaller.callBillingApi<CreatePurchaseSubscriptionWithNewCardResponse>({
      method: 'POST',
      path: 'billing/purchase/new-card',
      query,
      body,
    });
  }

  // methods
  @Get('/methods')
  @OrganizationPermission(ORGANIZATION_ROLE.ADMIN)
  async findBillingMethods(@Query() query: object): Promise<CallBillingApiResponse<FindBillingMethodResponse>> {
    return await this.billingCaller.callBillingApi<FindBillingMethodResponse>({
      method: 'GET',
      path: 'billing/methods',
      query,
    });
  }

  @Put('/methods')
  @OrganizationPermission(ORGANIZATION_ROLE.ADMIN)
  async updateBillingMethod(@Query() query: object, @Body() body: object): Promise<CallBillingApiResponse<UpdateBillingMethodResponse>> {
    return await this.billingCaller.callBillingApi<UpdateBillingMethodResponse>({
      method: 'PUT',
      path: 'billing/methods',
      query,
      body,
    });
  }
}
