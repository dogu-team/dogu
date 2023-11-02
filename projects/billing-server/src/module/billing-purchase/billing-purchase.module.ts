import { Module } from '@nestjs/common';
import { BillingPurchaseController } from './billing-purchase.controller';
import { BillingPurchaseService } from './billing-purchase.service';

@Module({
  controllers: [BillingPurchaseController],
  providers: [BillingPurchaseService],
})
export class BillingPurchaseModule {}
