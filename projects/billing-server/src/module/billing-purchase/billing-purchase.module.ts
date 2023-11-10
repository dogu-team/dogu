import { Module } from '@nestjs/common';
import { BillingHistoryModule } from '../billing-history/billing-history.module';
import { BillingMethodModule } from '../billing-method/billing-method.module';
import { BillingOrganizationModule } from '../billing-organization/billing-organization.module';
import { BillingTokenModule } from '../billing-token/billing-token.module';
import { ConsoleModule } from '../console/console.module';
import { DateTimeSimulatorModule } from '../date-time-simulator/date-time-simulator.module';
import { BillingPurchaseController } from './billing-purchase.controller';
import { BillingPurchaseService } from './billing-purchase.service';

@Module({
  imports: [BillingTokenModule, BillingMethodModule, BillingOrganizationModule, BillingHistoryModule, ConsoleModule, DateTimeSimulatorModule],
  controllers: [BillingPurchaseController],
  providers: [BillingPurchaseService],
})
export class BillingPurchaseModule {}
