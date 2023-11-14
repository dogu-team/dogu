import { BillingSubscriptionPlanInfoResponse, UpdateBillingSubscriptionPlanInfoStateDto } from '@dogu-private/console';
import { OrganizationId } from '@dogu-private/types';
import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';

import { BillingSubscriptionPlanInfo } from '../../db/entity/billing-subscription-plan-info.entity';
import { BillingTokenPermission } from '../auth/guard/billing-token.guard';
import { BillingSubscriptionPlanInfoService } from './billing-subscription-plan-info.service';

@Controller('/billing/subscription-plan-infos')
export class BillingSubscriptionPlanInfoController {
  constructor(private readonly billingSubscriptionPlanInfoService: BillingSubscriptionPlanInfoService) {}

  @Get(':billingSubscriptionPlanInfoId')
  @BillingTokenPermission()
  async getBillingSubscriptionPlanInfo(
    @Param('billingSubscriptionPlanInfoId') billingSubscriptionPlanInfoId: string,
    @Query() organizationId: OrganizationId,
  ): Promise<BillingSubscriptionPlanInfo> {
    return await this.billingSubscriptionPlanInfoService.getBillingSubscriptionPlanInfo(billingSubscriptionPlanInfoId);
  }

  @Patch(':billingSubscriptionPlanInfoId/cancel-unsubscribe')
  @BillingTokenPermission()
  async cancelUnsubscribe(
    @Param('billingSubscriptionPlanInfoId') billingSubscriptionPlanInfoId: string,
    @Body() dto: UpdateBillingSubscriptionPlanInfoStateDto,
  ): Promise<BillingSubscriptionPlanInfoResponse> {
    return await this.billingSubscriptionPlanInfoService.cancelUnsubscribe(billingSubscriptionPlanInfoId, dto);
  }

  @Patch(':billingSubscriptionPlanInfoId/cancel-change-option-or-period')
  @BillingTokenPermission()
  async cancelChangeOptionOrPeriod(
    @Param('billingSubscriptionPlanInfoId') billingSubscriptionPlanInfoId: string,
    @Body() dto: UpdateBillingSubscriptionPlanInfoStateDto,
  ): Promise<BillingSubscriptionPlanInfoResponse> {
    return await this.billingSubscriptionPlanInfoService.cancelChangeOptionOrPeriod(billingSubscriptionPlanInfoId, dto);
  }

  @Patch(':billingSubscriptionPlanInfoId/unsubscribe')
  @BillingTokenPermission()
  async unsubscribe(
    @Param('billingSubscriptionPlanInfoId') billingSubscriptionPlanInfoId: string,
    @Body() dto: UpdateBillingSubscriptionPlanInfoStateDto,
  ): Promise<BillingSubscriptionPlanInfoResponse> {
    return await this.billingSubscriptionPlanInfoService.unsubscribe(billingSubscriptionPlanInfoId, dto);
  }
}
