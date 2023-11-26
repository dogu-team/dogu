import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BillingCouponSubscriber } from '../billing-coupon/billign-coupon.subscriber';
import { BillingSubscriptionPlanSourceMigrator } from '../billing-subscription-plan-source/billing-subscription-plan-source.migrator';
import { BillingSubscriptionPlanSourceSubscriber } from '../billing-subscription-plan-source/billing-subscription-plan-source.subscriber';
import { DoguLogger } from '../logger/logger';
import { PaddleMigrator } from '../paddle/paddle.migrator';

@Injectable()
export class LeaderInitializer implements OnModuleInit {
  constructor(
    private readonly logger: DoguLogger,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly billingSubscriptionPlanSourceMigrator: BillingSubscriptionPlanSourceMigrator,
    private readonly paddleMigrator: PaddleMigrator,
    private readonly billingSubscriptionPlanSourceSubscriber: BillingSubscriptionPlanSourceSubscriber,
    private readonly billingCouponSubscriber: BillingCouponSubscriber,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.initialize();
  }

  async initialize(): Promise<void> {
    await this.billingSubscriptionPlanSourceMigrator.migrate();
    await this.paddleMigrator.migrate();
    await this.billingSubscriptionPlanSourceSubscriber.subscribe();
    await this.billingCouponSubscriber.subscribe();
  }
}
