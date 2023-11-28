import { Module } from '@nestjs/common';
import { BillingTokenModule } from '../billing-token/billing-token.module';
import { DateTimeSimulatorModule } from '../date-time-simulator/date-time-simulator.module';
import { PaddleModule } from '../paddle/paddle.module';
import { SlackModule } from '../slack/slack.module';
import { BillingPlanInfoController } from './billing-plan-info.controller';
import { BillingPlanInfoService } from './billing-plan-info.service';

@Module({
  imports: [BillingTokenModule, DateTimeSimulatorModule, SlackModule, PaddleModule],
  controllers: [BillingPlanInfoController],
  providers: [BillingPlanInfoService],
})
export class BillingPlanInfoModule {}
