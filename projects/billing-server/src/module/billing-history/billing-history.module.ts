import { Module } from '@nestjs/common';
import { BillingTokenModule } from '../billing-token/billing-token.module';
import { BillingHistoryController } from './billing-history.controller';
import { BillingHistoryService } from './billing-history.service';

@Module({
  controllers: [BillingHistoryController],
  providers: [BillingHistoryService],
  imports: [BillingTokenModule],
})
export class BillingHistoryModule {}
