import {
  BillingCouponBase,
  BillingHistoryBase,
  CallBillingApiResponse,
  CreatePurchaseSubscriptionWithNewCardResponse,
  GetBillingSubscriptionPreviewResponse,
  UpdateBillingMethodResponse,
  ValidateBillingCouponResponse,
} from '@dogu-private/console';
import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';

import { ORGANIZATION_ROLE } from '../auth/auth.types';
import { OrganizationPermission } from '../auth/decorators';
import { Page } from '../common/dto/pagination/page';
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

  @Post('/purchase')
  @OrganizationPermission(ORGANIZATION_ROLE.ADMIN)
  async createPurchaseSubscription(@Query() query: object, @Body() body: object): Promise<CallBillingApiResponse<CreatePurchaseSubscriptionWithNewCardResponse>> {
    return await this.billingCaller.callBillingApi<CreatePurchaseSubscriptionWithNewCardResponse>({
      method: 'POST',
      path: 'billing/purchase',
      query,
      body,
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

  // history
  @Get('/histories')
  @OrganizationPermission(ORGANIZATION_ROLE.ADMIN)
  async findBillingHistories(@Query() query: object): Promise<CallBillingApiResponse<Page<BillingHistoryBase>>> {
    return await this.billingCaller.callBillingApi<Page<BillingHistoryBase>>({
      method: 'GET',
      path: 'billing/histories',
      query,
    });
  }

  // subscription plan info
  @Get('/subscription-plan-infos/:billingSubscriptionPlanInfoId')
  @OrganizationPermission(ORGANIZATION_ROLE.ADMIN)
  async getBillingSubscriptionPlanInfo(@Param('billingSubscriptionPlanInfoId') billingSubscriptionPlanInfoId: string): Promise<CallBillingApiResponse<BillingHistoryBase>> {
    return await this.billingCaller.callBillingApi<BillingHistoryBase>({
      method: 'GET',
      path: `billing/subscription-plan-infos/${billingSubscriptionPlanInfoId}`,
    });
  }

  @Get('/subscription-plan-infos/:billingSubscriptionPlanInfoId/cancel-unsubscribe')
  @OrganizationPermission(ORGANIZATION_ROLE.ADMIN)
  async findSubscriptionPlans(@Param('billingSubscriptionPlanInfoId') billingSubscriptionPlanInfoId: string): Promise<CallBillingApiResponse<Page<BillingHistoryBase>>> {
    return await this.billingCaller.callBillingApi<Page<BillingHistoryBase>>({
      method: 'GET',
      path: `billing/subscription-plan-infos/${billingSubscriptionPlanInfoId}/cancel-unsubscribe`,
    });
  }

  @Get('/subscription-plan-infos/:billingSubscriptionPlanInfoId/cancel-change-option-or-period')
  @OrganizationPermission(ORGANIZATION_ROLE.ADMIN)
  async cancelChangeOptionOrPeriod(@Param('billingSubscriptionPlanInfoId') billingSubscriptionPlanInfoId: string): Promise<CallBillingApiResponse<Page<BillingHistoryBase>>> {
    return await this.billingCaller.callBillingApi<Page<BillingHistoryBase>>({
      method: 'GET',
      path: `billing/subscription-plan-infos/${billingSubscriptionPlanInfoId}/cancel-change-option-or-period`,
    });
  }

  @Get('/subscription-plan-infos/:billingSubscriptionPlanInfoId/unsubscribe')
  @OrganizationPermission(ORGANIZATION_ROLE.ADMIN)
  async unsubscribe(@Param('billingSubscriptionPlanInfoId') billingSubscriptionPlanInfoId: string): Promise<CallBillingApiResponse<Page<BillingHistoryBase>>> {
    return await this.billingCaller.callBillingApi<Page<BillingHistoryBase>>({
      method: 'GET',
      path: `billing/subscription-plan-infos/${billingSubscriptionPlanInfoId}/unsubscribe`,
    });
  }
}
