import { Module } from '@nestjs/common';
import { BillingTokenModule } from '../billing-token/billing-token.module';
import { DateTimeSimulatorModule } from '../date-time-simulator/date-time-simulator.module';
import { BillingSubscriptionPlanSourceController } from './billing-subscription-plan-source.controller';
import { BillingSubscriptionPlanSourceService } from './billing-subscription-plan-source.service';
import { BillingSubscriptionPlanSourceSubscriber } from './billing-subscription-plan-source.subscriber';

@Module({
  imports: [BillingTokenModule, DateTimeSimulatorModule],
  controllers: [BillingSubscriptionPlanSourceController],
  providers: [BillingSubscriptionPlanSourceService, BillingSubscriptionPlanSourceSubscriber],
})
export class BillingSubscriptionPlanSourceModule {}
