import { Module } from '@nestjs/common';
import { BillingTokenModule } from '../billing-token/billing-token.module';
import { DateTimeSimulatorModule } from '../date-time-simulator/date-time-simulator.module';
import { BillingHistoryController } from './billing-history.controller';
import { BillingHistoryService } from './billing-history.service';

@Module({
  imports: [BillingTokenModule, DateTimeSimulatorModule],
  controllers: [BillingHistoryController],
  providers: [BillingHistoryService],
  exports: [BillingHistoryService],
})
export class BillingHistoryModule {}
