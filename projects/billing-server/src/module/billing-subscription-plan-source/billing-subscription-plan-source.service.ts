import { BillingOrganizationProp, BillingSubscriptionPlanSourceProp, FindBillingSubscriptionPlanSourcesDto } from '@dogu-private/console';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { Client } from 'pg';
import { DataSource } from 'typeorm';
import { BillingOrganization } from '../../db/entity/billing-organization.entity';
import { BillingSubscriptionPlanSource, BillingSubscriptionPlanSourceTableName } from '../../db/entity/billing-subscription-plan-source.entity';
import { getClient, RetryTransaction, subscribe } from '../../db/retry-transaction';
import { DoguLogger } from '../logger/logger';

@Injectable()
export class BillingSubscriptionPlanSourceService {
  private readonly retryTransaction: RetryTransaction;

  constructor(
    private readonly logger: DoguLogger,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {
    this.retryTransaction = new RetryTransaction(this.logger, this.dataSource);
  }

  async findBillingSubscriptionPlanSources(dto: FindBillingSubscriptionPlanSourcesDto): Promise<BillingSubscriptionPlanSource[]> {
    return await this.retryTransaction.serializable(async (context) => {
      const { manager } = context;
      return await manager
        .getRepository(BillingSubscriptionPlanSource)
        .createQueryBuilder(BillingSubscriptionPlanSource.name)
        .leftJoinAndSelect(`${BillingSubscriptionPlanSource.name}.${BillingSubscriptionPlanSourceProp.billingOrganization}`, BillingOrganization.name)
        .where(`${BillingOrganization.name}.${BillingOrganizationProp.organizationId} = :organizationId`, { organizationId: dto.organizationId })
        .getMany();
    });
  }
}
