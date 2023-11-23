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
export class BillingSubscriptionPlanSourceSubscriber implements OnModuleInit {
  constructor(
    private readonly logger: DoguLogger,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit(): Promise<void> {
    await subscribe(this.logger, this.dataSource, BillingSubscriptionPlanSourceTableName, (message) => {
      this.logger.info('BillingSubscriptionPlanSourceSubscriber.onModuleInit.subscribe', { message: JSON.stringify(message) });
    });
  }
}
