import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BillingSubscriptionPlanSourceMigrator } from '../billing-subscription-plan-source/billing-subscription-plan-source.migrator';
import { DoguLogger } from '../logger/logger';
import { PaddleMigrator } from '../paddle/paddle.migrator';

@Injectable()
export class LeaderMigrator implements OnModuleInit {
  constructor(
    private readonly logger: DoguLogger,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly billingSubscriptionPlanSourceMigrator: BillingSubscriptionPlanSourceMigrator,
    private readonly paddleMigrator: PaddleMigrator,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.migrate();
  }

  async migrate(): Promise<void> {
    await this.billingSubscriptionPlanSourceMigrator.migrate();
    await this.paddleMigrator.migrate();
  }
}
