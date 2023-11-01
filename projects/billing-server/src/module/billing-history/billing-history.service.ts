import { BillingHistoryPropCamel, BillingInfoPropCamel, GetBillingHistorieByOrganizationIdDto } from '@dogu-private/console';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BillingHistory } from '../../db/entity/billing-history.entity';
import { DoguLogger } from '../logger/logger';

@Injectable()
export class BillingHistoryService {
  constructor(
    private readonly logger: DoguLogger,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async getHistoriesByOrganizationId(dto: GetBillingHistorieByOrganizationIdDto): Promise<BillingHistory[]> {
    const { organizationId } = dto;
    return await this.dataSource.manager
      .createQueryBuilder(BillingHistory, BillingHistory.name)
      .innerJoinAndSelect(`${BillingHistory.name}.${BillingHistoryPropCamel.billingInfo}`, BillingHistoryPropCamel.billingInfo)
      .innerJoinAndSelect(`${BillingHistory.name}.${BillingHistoryPropCamel.billingSubscriptionPlans}`, BillingHistoryPropCamel.billingSubscriptionPlans)
      .where(`${BillingHistoryPropCamel.billingInfo}.${BillingInfoPropCamel.organizationId} = :organizationId`, { organizationId })
      .getMany();
  }
}
