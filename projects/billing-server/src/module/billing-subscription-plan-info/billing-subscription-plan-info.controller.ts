import { Controller, Get, Param, Patch } from '@nestjs/common';
import { BillingSubscriptionPlanInfo } from '../../db/entity/billing-subscription-plan-info.entity';
import { BillingSubscriptionPlanInfoService } from './billing-subscription-plan-info.service';

@Controller('/billing/subscription-plan-infos')
export class BillingSubscriptionPlanInfoController {
  constructor(private readonly billingSubscriptionPlanInfoService: BillingSubscriptionPlanInfoService) {}

  @Get(':billingSubscriptionPlanInfoId')
  async getBillingSubscriptionPlanInfo(@Param('billingSubscriptionPlanInfoId') billingSubscriptionPlanInfoId: string): Promise<BillingSubscriptionPlanInfo> {
    return await this.billingSubscriptionPlanInfoService.getBillingSubscriptionPlanInfo(billingSubscriptionPlanInfoId);
  }

  @Patch(':billingSubscriptionPlanInfoId/cancel-unsubscribe')
  async cancelUnsubscribe(@Param('billingSubscriptionPlanInfoId') billingSubscriptionPlanInfoId: string): Promise<BillingSubscriptionPlanInfo> {
    return await this.billingSubscriptionPlanInfoService.cancelUnsubscribe(billingSubscriptionPlanInfoId);
  }

  @Patch(':billingSubscriptionPlanInfoId/cancel-change-option-or-period')
  async cancelChangeOptionOrPeriod(@Param('billingSubscriptionPlanInfoId') billingSubscriptionPlanInfoId: string): Promise<BillingSubscriptionPlanInfo> {
    return await this.billingSubscriptionPlanInfoService.cancelChangeOptionOrPeriod(billingSubscriptionPlanInfoId);
  }

  @Patch(':billingSubscriptionPlanInfoId/unsubscribe')
  async unsubscribe(@Param('billingSubscriptionPlanInfoId') billingSubscriptionPlanInfoId: string): Promise<BillingSubscriptionPlanInfo> {
    return await this.billingSubscriptionPlanInfoService.unsubscribe(billingSubscriptionPlanInfoId);
  }
}
