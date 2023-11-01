import { Module } from '@nestjs/common';
import { BillingHistoryController } from './billing-history.controller';
import { BillingHistoryService } from './billing-history.service';

@Module({
  controllers: [BillingHistoryController],
  providers: [BillingHistoryService],
})
export class BillingHistoryModule {}
