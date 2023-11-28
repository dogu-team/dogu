import { BillingOrganizationProp, BillingPlanSourceProp, FindAllBillingPlanSourcesDto } from '@dogu-private/console';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BillingOrganization } from '../../db/entity/billing-organization.entity';
import { BillingPlanSource } from '../../db/entity/billing-plan-source.entity';
import { RetryTransaction } from '../../db/retry-transaction';
import { DoguLogger } from '../logger/logger';

export interface FindPlanSourceOptions {
  billingPlanSourceId: number;
}

@Injectable()
export class BillingPlanSourceService {
  private readonly retryTransaction: RetryTransaction;

  constructor(
    private readonly logger: DoguLogger,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {
    this.retryTransaction = new RetryTransaction(this.logger, this.dataSource);
  }

  async findAll(dto: FindAllBillingPlanSourcesDto): Promise<BillingPlanSource[]> {
    return await this.retryTransaction.serializable(async (context) => {
      const { manager } = context;
      return await manager
        .getRepository(BillingPlanSource)
        .createQueryBuilder(BillingPlanSource.name)
        .leftJoinAndSelect(`${BillingPlanSource.name}.${BillingPlanSourceProp.billingOrganization}`, BillingOrganization.name)
        .where(`${BillingOrganization.name}.${BillingOrganizationProp.organizationId} = :organizationId`, { organizationId: dto.organizationId })
        .getMany();
    });
  }

  async find(options: FindPlanSourceOptions): Promise<BillingPlanSource | null> {
    const { billingPlanSourceId } = options;
    return await this.dataSource.getRepository(BillingPlanSource).findOne({
      where: {
        billingPlanSourceId,
      },
    });
  }
}
