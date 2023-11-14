import { BillingHistoryProp, BillingOrganizationProp, GetBillingHistoriesDto, PageBase } from '@dogu-private/console';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BillingHistory } from '../../db/entity/billing-history.entity';
import { BillingOrganization } from '../../db/entity/billing-organization.entity';
import { BillingSubscriptionPlanHistory } from '../../db/entity/billing-subscription-plan-history.entity';
import { retrySerialize } from '../../db/utils';
import { DoguLogger } from '../logger/logger';

@Injectable()
export class BillingHistoryService {
  constructor(
    private readonly logger: DoguLogger,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async getHistories(dto: GetBillingHistoriesDto): Promise<PageBase<BillingHistory>> {
    return await retrySerialize(this.logger, this.dataSource, async (context) => {
      const { manager } = context;
      const { organizationId, page, offset } = dto;
      const [histories, totalCount] = await manager
        .createQueryBuilder(BillingHistory, BillingHistory.name)
        .innerJoinAndSelect(`${BillingHistory.name}.${BillingHistoryProp.billingOrganization}`, BillingOrganization.name)
        .leftJoinAndSelect(`${BillingHistory.name}.${BillingHistoryProp.billingSubscriptionPlanHistories}`, BillingSubscriptionPlanHistory.name)
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
