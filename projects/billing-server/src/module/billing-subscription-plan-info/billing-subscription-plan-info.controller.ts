import { UpdateBillingSubscriptionPlanInfoDto } from '@dogu-private/console';
import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { BillingSubscriptionPlanInfo } from '../../db/entity/billing-subscription-plan-info.entity';
import { BillingSubscriptionPlanInfoService } from './billing-subscription-plan-info.service';

@Controller('/billing-subscription-plan-infos')
export class BillingSubscriptionPlanInfoController {
  constructor(private readonly billingSubscriptionPlanInfoService: BillingSubscriptionPlanInfoService) {}

  @Get(':billingSubscriptionPlanInfoId')
  async getBillingSubscriptionPlanInfo(@Param('billingSubscriptionPlanInfoId') billingSubscriptionPlanInfoId: string): Promise<BillingSubscriptionPlanInfo> {
    return await this.billingSubscriptionPlanInfoService.getBillingSubscriptionPlanInfo(billingSubscriptionPlanInfoId);
  }

  @Patch(':billingSubscriptionPlanInfoId')
  async updateBillingSubscriptionPlanInfo(
    @Param('billingSubscriptionPlanInfoId') billingSubscriptionPlanInfoId: string,
    @Body() dto: UpdateBillingSubscriptionPlanInfoDto,
  ): Promise<BillingSubscriptionPlanInfo> {
    return await this.billingSubscriptionPlanInfoService.updateBillingSubscriptionPlanInfo(billingSubscriptionPlanInfoId, dto);
  }
}
