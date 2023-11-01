import { GetBillingHistorieByOrganizationIdDto } from '@dogu-private/console';
import { Controller, Get, Query } from '@nestjs/common';
import { BillingHistory } from '../../db/entity/billing-history.entity';
import { BillingHistoryService } from './billing-history.service';

@Controller('/billing-histories')
export class BillingHistoryController {
  constructor(private readonly billingHistoryService: BillingHistoryService) {}

  @Get()
  async getHistoriesByOrganizationId(@Query() dto: GetBillingHistorieByOrganizationIdDto): Promise<BillingHistory[]> {
    return await this.billingHistoryService.getHistoriesByOrganizationId(dto);
  }
}
