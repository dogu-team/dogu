import { FindBillingSubscriptionPlanSourcesDto } from '@dogu-private/console';
import { Controller, Get, Query } from '@nestjs/common';
import { BillingSubscriptionPlanSource } from '../../db/entity/billing-subscription-plan-source.entity';
import { BillingTokenPermission } from '../auth/guard/billing-token.guard';
import { BillingSubscriptionPlanSourceService } from './billing-subscription-plan-source.service';

@Controller('/billing-subscription-plan-sources')
export class BillingSubscriptionPlanSourceController {
  constructor(private readonly billingSubscriptionPlanSourceService: BillingSubscriptionPlanSourceService) {}

  @Get()
  @BillingTokenPermission()
  async findBillingSubscriptionPlanSources(@Query() dto: FindBillingSubscriptionPlanSourcesDto): Promise<BillingSubscriptionPlanSource[]> {
    return await this.billingSubscriptionPlanSourceService.findBillingSubscriptionPlanSources(dto);
  }
}
