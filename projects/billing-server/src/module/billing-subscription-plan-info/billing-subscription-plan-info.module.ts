import { Module } from '@nestjs/common';
import { BillingTokenModule } from '../billing-token/billing-token.module';
import { DateTimeSimulatorModule } from '../date-time-simulator/date-time-simulator.module';
import { SlackModule } from '../slack/slack.module';
import { BillingSubscriptionPlanInfoController } from './billing-subscription-plan-info.controller';
import { BillingSubscriptionPlanInfoService } from './billing-subscription-plan-info.service';

@Module({
  imports: [BillingTokenModule, DateTimeSimulatorModule, SlackModule],
  controllers: [BillingSubscriptionPlanInfoController],
  providers: [BillingSubscriptionPlanInfoService],
})
export class BillingSubscriptionPlanInfoModule {}
