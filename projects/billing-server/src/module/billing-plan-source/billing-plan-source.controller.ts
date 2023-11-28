import { FindAllBillingPlanSourcesDto } from '@dogu-private/console';
import { Controller, Get, Query } from '@nestjs/common';
import { BillingPlanSource } from '../../db/entity/billing-plan-source.entity';
import { BillingTokenPermission } from '../auth/guard/billing-token.guard';
import { BillingPlanSourceService } from './billing-plan-source.service';

@Controller('/billing-plan-sources')
export class BillingPlanSourceController {
  constructor(private readonly billingPlanSourceService: BillingPlanSourceService) {}

  @Get()
  @BillingTokenPermission()
  async findAll(@Query() dto: FindAllBillingPlanSourcesDto): Promise<BillingPlanSource[]> {
    return await this.billingPlanSourceService.findAll(dto);
  }
}
