import { GetBillingHistoriesDto } from '@dogu-private/console';
import { Controller, Get, Query } from '@nestjs/common';
import { BillingHistory } from '../../db/entity/billing-history.entity';
import { BillingTokenPermission } from '../auth/guard/billing-token.guard';
import { BillingHistoryService } from './billing-history.service';

@Controller('/billing/histories')
export class BillingHistoryController {
  constructor(private readonly billingHistoryService: BillingHistoryService) {}

  @Get()
  @BillingTokenPermission()
  async getHistories(@Query() dto: GetBillingHistoriesDto): Promise<BillingHistory[]> {
    return await this.billingHistoryService.getHistories(dto);
  }
}
