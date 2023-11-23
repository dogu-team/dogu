import { Module } from '@nestjs/common';
import { BillingHistoryModule } from '../billing-history/billing-history.module';
import { BillingMethodModule } from '../billing-method/billing-method.module';
import { BillingOrganizationModule } from '../billing-organization/billing-organization.module';
import { BillingTokenModule } from '../billing-token/billing-token.module';
import { ConsoleModule } from '../console/console.module';
import { DateTimeSimulatorModule } from '../date-time-simulator/date-time-simulator.module';
import { NiceModule } from '../nice/nice.module';
import { PaddleModule } from '../paddle/paddle.module';
import { SlackModule } from '../slack/slack.module';
import { BillingPurchaseController } from './billing-purchase.controller';
import { BillingPurchaseService } from './billing-purchase.service';

@Module({
  imports: [
    BillingTokenModule,
    BillingMethodModule,
    BillingOrganizationModule,
    BillingHistoryModule,
    ConsoleModule,
    DateTimeSimulatorModule,
    SlackModule,
    NiceModule,
    PaddleModule,
  ],
  controllers: [BillingPurchaseController],
  providers: [BillingPurchaseService],
})
export class BillingPurchaseModule {}
