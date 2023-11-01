import { GetAvailableBillingPromotionsDto } from '@dogu-private/console';
import { Controller, Get, Query } from '@nestjs/common';
import { BillingPromotion } from '../../db/entity/billing-promotion.entity';
import { BillingTokenPermission } from '../auth/guard/billing-token.guard';
import { BillingPromotionService } from './billing-promotion.service';

@Controller('/billing/promotions')
export class BillingPromotionController {
  constructor(private readonly billingPromotionService: BillingPromotionService) {}

  @Get('/available')
  @BillingTokenPermission()
  async getAvailableBillingPromotions(@Query() dto: GetAvailableBillingPromotionsDto): Promise<BillingPromotion[]> {
    return await this.billingPromotionService.getAvailableBillingPromotions(dto);
  }
}
