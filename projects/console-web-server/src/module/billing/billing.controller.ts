import {
  BillingCouponType,
  BillingHistoryBase,
  BillingPromotionCouponResponse,
  CallBillingApiResponse,
  CreatePurchaseWithNewCardResponse,
  GetBillingPrecheckoutResponse,
  GetBillingPreviewResponse,
  GetUpdatePaymentMethodTransactionResponse,
  UpdateBillingAddressResponse,
  UpdateBillingMethodResponse,
  ValidateBillingCouponResponse,
} from '@dogu-private/console';
import { Body, Controller, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';

import { ORGANIZATION_ROLE } from '../auth/auth.types';
import { OrganizationPermission } from '../auth/decorators';
import { Page } from '../common/dto/pagination/page';
import { BillingCaller } from './billing.caller';

@Controller('billing')
export class BillingController {
  constructor(private readonly billingCaller: BillingCaller) {}

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

  @Get('/promotions')
  @OrganizationPermission(ORGANIZATION_ROLE.MEMBER)
  async findPromotions(@Query() query: object): Promise<CallBillingApiResponse<BillingPromotionCouponResponse[]>> {
    const promotionType: BillingCouponType = 'promotion';
    return await this.billingCaller.callBillingApi<BillingPromotionCouponResponse[]>({
      method: 'GET',
      path: 'billing/coupons/availables',
      query: {
        ...query,
        type: promotionType,
      },
    });
  }

  // purchase
  @Get('/purchase/preview')
  @OrganizationPermission(ORGANIZATION_ROLE.ADMIN)
  async getPreview(@Query() query: object): Promise<CallBillingApiResponse<GetBillingPreviewResponse>> {
    return await this.billingCaller.callBillingApi<GetBillingPreviewResponse>({
      method: 'GET',
      path: 'billing/purchase/preview',
      query,
    });
  }

  @Post('/purchase')
  @OrganizationPermission(ORGANIZATION_ROLE.ADMIN)
  async createPurchase(@Query() query: object, @Body() body: object): Promise<CallBillingApiResponse<CreatePurchaseWithNewCardResponse>> {
    return await this.billingCaller.callBillingApi<CreatePurchaseWithNewCardResponse>({
      method: 'POST',
      path: 'billing/purchase',
      query,
      body,
    });
  }

  @Post('/purchase/new-card')
  @OrganizationPermission(ORGANIZATION_ROLE.ADMIN)
  async createPurchaseWithNewCard(@Query() query: object, @Body() body: object): Promise<CallBillingApiResponse<CreatePurchaseWithNewCardResponse>> {
    return await this.billingCaller.callBillingApi<CreatePurchaseWithNewCardResponse>({
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

  @Patch('/address')
  @OrganizationPermission(ORGANIZATION_ROLE.ADMIN)
  async updateBillingAddress(@Body() body: object): Promise<CallBillingApiResponse<UpdateBillingAddressResponse>> {
    return await this.billingCaller.callBillingApi<UpdateBillingAddressResponse>({
      method: 'PATCH',
      path: 'billing/organizations/address',
      body,
    });
  }

  // subscription plan info
  @Patch('/plan-infos/:billingPlanInfoId/cancel-unsubscribe')
  @OrganizationPermission(ORGANIZATION_ROLE.ADMIN)
  async findSubscriptionPlans(@Param('billingPlanInfoId') billingPlanInfoId: string, @Body() body: object, @Query() query: object): Promise<CallBillingApiResponse> {
    return await this.billingCaller.callBillingApi({
      method: 'PATCH',
      path: `billing/plan-infos/${billingPlanInfoId}/cancel-unsubscribe`,
      query,
      body,
    });
  }

  @Patch('/plan-infos/:billingPlanInfoId/cancel-change-option-or-period')
  @OrganizationPermission(ORGANIZATION_ROLE.ADMIN)
  async cancelChangeOptionOrPeriod(@Param('billingPlanInfoId') billingPlanInfoId: string, @Body() body: object, @Query() query: object): Promise<CallBillingApiResponse> {
    return await this.billingCaller.callBillingApi({
      method: 'PATCH',
      path: `billing/plan-infos/${billingPlanInfoId}/cancel-change-option-or-period`,
      query,
      body,
    });
  }

  @Patch('/plan-infos/:billingPlanInfoId/unsubscribe')
  @OrganizationPermission(ORGANIZATION_ROLE.ADMIN)
  async unsubscribe(@Param('billingPlanInfoId') billingPlanInfoId: string, @Body() body: object, @Query() query: object): Promise<CallBillingApiResponse> {
    return await this.billingCaller.callBillingApi({
      method: 'PATCH',
      path: `billing/plan-infos/${billingPlanInfoId}/unsubscribe`,
      query,
      body,
    });
  }

  @Get('/plan-infos/:billingPlanInfoId/update-payment-method-transaction')
  @OrganizationPermission(ORGANIZATION_ROLE.ADMIN)
  async getUpdatePaymentMethodTransaction(@Param('billingPlanInfoId') billingPlanInfoId: string): Promise<CallBillingApiResponse<GetUpdatePaymentMethodTransactionResponse>> {
    return await this.billingCaller.callBillingApi({
      method: 'GET',
      path: `billing/plan-infos/${billingPlanInfoId}/update-payment-method-transaction`,
    });
  }

  @Get('/purchase/precheckout')
  @OrganizationPermission(ORGANIZATION_ROLE.ADMIN)
  async getSubscriptionPreviewPaddle(@Query() query: object): Promise<CallBillingApiResponse<GetBillingPrecheckoutResponse>> {
    return await this.billingCaller.callBillingApi({
      method: 'GET',
      path: 'billing/purchase/precheckout',
      query,
    });
  }
}
