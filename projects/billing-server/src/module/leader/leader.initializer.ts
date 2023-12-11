import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BillingCouponSubscriber } from '../billing-coupon/billign-coupon.subscriber';
import { BillingPlanSourceMigrator } from '../billing-plan-source/billing-plan-source.migrator';
import { BillingPlanSourceSubscriber } from '../billing-plan-source/billing-plan-source.subscriber';
import { DoguLogger } from '../logger/logger';
import { PaddleMigrator } from '../paddle/paddle.migrator';

@Injectable()
export class LeaderInitializer implements OnModuleInit {
  constructor(
    private readonly logger: DoguLogger,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly billingPlanSourceMigrator: BillingPlanSourceMigrator,
    private readonly paddleMigrator: PaddleMigrator,
    private readonly billingPlanSourceSubscriber: BillingPlanSourceSubscriber,
    private readonly billingCouponSubscriber: BillingCouponSubscriber,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.initialize();
  }

  async initialize(): Promise<void> {
    await this.billingPlanSourceMigrator.migrate();
    await this.paddleMigrator.migrate();
    await this.billingPlanSourceSubscriber.subscribe();
    await this.billingCouponSubscriber.subscribe();
  }
}
