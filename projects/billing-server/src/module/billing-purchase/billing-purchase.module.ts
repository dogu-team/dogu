import { Module } from '@nestjs/common';
import { BillingTokenModule } from '../billing-token/billing-token.module';
import { BillingPurchaseController } from './billing-purchase.controller';
import { BillingPurchaseService } from './billing-purchase.service';

@Module({
  controllers: [BillingPurchaseController],
  providers: [BillingPurchaseService],
  imports: [BillingTokenModule],
})
export class BillingPurchaseModule {}
