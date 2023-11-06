import { BillingOrganizationProp, BillingSubscriptionPlanSourceProp, FindBillingSubscriptionPlanSourcesDto } from '@dogu-private/console';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BillingOrganization } from '../../db/entity/billing-organization.entity';
import { BillingSubscriptionPlanSource } from '../../db/entity/billing-subscription-plan-source.entity';
import { retrySerialize } from '../../db/utils';
import { DoguLogger } from '../logger/logger';

@Injectable()
export class BillingSubscriptionPlanSourceService {
  constructor(
    private readonly logger: DoguLogger,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async findBillingSubscriptionPlanSources(dto: FindBillingSubscriptionPlanSourcesDto): Promise<BillingSubscriptionPlanSource[]> {
    return await retrySerialize(this.logger, this.dataSource, async (context) => {
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
