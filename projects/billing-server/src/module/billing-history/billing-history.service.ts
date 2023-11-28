import { BillingHistoryProp, BillingOrganizationProp, GetBillingHistoriesDto, PageBase } from '@dogu-private/console';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BillingHistory } from '../../db/entity/billing-history.entity';
import { BillingOrganization } from '../../db/entity/billing-organization.entity';
import { BillingPlanHistory } from '../../db/entity/billing-plan-history.entity';
import { RetryTransaction } from '../../db/retry-transaction';
import { DoguLogger } from '../logger/logger';

@Injectable()
export class BillingHistoryService {
  private readonly retryTransaction: RetryTransaction;

  constructor(
    private readonly logger: DoguLogger,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {
    this.retryTransaction = new RetryTransaction(this.logger, this.dataSource);
  }

  async getHistories(dto: GetBillingHistoriesDto): Promise<PageBase<BillingHistory>> {
    return await this.retryTransaction.serializable(async (context) => {
      const { manager } = context;
      const { organizationId, page, offset } = dto;
      const [histories, totalCount] = await manager
        .createQueryBuilder(BillingHistory, BillingHistory.name)
        .innerJoinAndSelect(`${BillingHistory.name}.${BillingHistoryProp.billingOrganization}`, BillingOrganization.name)
        .leftJoinAndSelect(`${BillingHistory.name}.${BillingHistoryProp.billingPlanHistories}`, BillingPlanHistory.name)
        .where(`${BillingOrganization.name}.${BillingOrganizationProp.organizationId} = :organizationId`, { organizationId })
        .orderBy(`${BillingHistory.name}.${BillingHistoryProp.createdAt}`, 'DESC')
        .skip((page - 1) * offset)
        .take(offset)
        .getManyAndCount();

      return {
        page,
        offset,
        totalCount,
        totalPage: Math.ceil(totalCount / offset),
        items: histories,
      };
    });
  }
}
