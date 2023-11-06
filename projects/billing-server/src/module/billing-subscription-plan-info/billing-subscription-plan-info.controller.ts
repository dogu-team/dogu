import { Controller } from '@nestjs/common';
import { BillingSubscriptionPlanInfoService } from './billing-subscription-plan-info.service';

@Controller('/billing-subscription-plan-infos')
export class BillingSubscriptionPlanInfoController {
  constructor(private readonly billingSubscriptionPlanInfoService: BillingSubscriptionPlanInfoService) {}

  // @Get(':billingSubscriptionPlanInfoId')
  // async getBillingSubscriptionPlanInfo(@Param('billingSubscriptionPlanInfoId') billingSubscriptionPlanInfoId: string): Promise<BillingSubscriptionPlanInfo {}
}
