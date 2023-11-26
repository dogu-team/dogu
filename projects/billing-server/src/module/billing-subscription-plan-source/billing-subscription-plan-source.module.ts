import { Module } from '@nestjs/common';
import { BillingTokenModule } from '../billing-token/billing-token.module';
import { DateTimeSimulatorModule } from '../date-time-simulator/date-time-simulator.module';
import { PaddleModule } from '../paddle/paddle.module';
import { BillingSubscriptionPlanSourceController } from './billing-subscription-plan-source.controller';
import { BillingSubscriptionPlanSourceMigrator } from './billing-subscription-plan-source.migrator';
import { BillingSubscriptionPlanSourceService } from './billing-subscription-plan-source.service';
import { BillingSubscriptionPlanSourceSubscriber } from './billing-subscription-plan-source.subscriber';

@Module({
  imports: [BillingTokenModule, DateTimeSimulatorModule, PaddleModule],
  controllers: [BillingSubscriptionPlanSourceController],
  providers: [BillingSubscriptionPlanSourceService, BillingSubscriptionPlanSourceSubscriber, BillingSubscriptionPlanSourceMigrator],
  exports: [BillingSubscriptionPlanSourceSubscriber, BillingSubscriptionPlanSourceMigrator],
})
export class BillingSubscriptionPlanSourceModule {}
