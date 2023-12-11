import { Module } from '@nestjs/common';
import { BillingTokenModule } from '../billing-token/billing-token.module';
import { DateTimeSimulatorModule } from '../date-time-simulator/date-time-simulator.module';
import { PaddleModule } from '../paddle/paddle.module';
import { BillingPlanSourceController } from './billing-plan-source.controller';
import { BillingPlanSourceMigrator } from './billing-plan-source.migrator';
import { BillingPlanSourceService } from './billing-plan-source.service';
import { BillingPlanSourceSubscriber } from './billing-plan-source.subscriber';

@Module({
  imports: [BillingTokenModule, DateTimeSimulatorModule, PaddleModule],
  controllers: [BillingPlanSourceController],
  providers: [BillingPlanSourceService, BillingPlanSourceSubscriber, BillingPlanSourceMigrator],
  exports: [BillingPlanSourceSubscriber, BillingPlanSourceMigrator, BillingPlanSourceService],
})
export class BillingPlanSourceModule {}
