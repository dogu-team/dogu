import { Module } from '@nestjs/common';
import { BillingTokenModule } from '../billing-token/billing-token.module';
import { BillingPromotionController } from './billing-promotion.controller';
import { BillingPromotionService } from './billing-promotion.service';

@Module({
  controllers: [BillingPromotionController],
  providers: [BillingPromotionService],
  imports: [BillingTokenModule],
})
export class BillingPromotionModule {}
