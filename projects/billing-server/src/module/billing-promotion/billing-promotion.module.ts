import { Module } from '@nestjs/common';
import { BillingPromotionController } from './billing-promotion.controller';
import { BillingPromotionService } from './billing-promotion.service';

@Module({
  controllers: [BillingPromotionController],
  providers: [BillingPromotionService],
})
export class BillingPromotionModule {}
