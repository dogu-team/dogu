import { GetAvailableBillingPromotionsByOrganizationIdDto } from '@dogu-private/console';
import { Controller, Get, Query } from '@nestjs/common';
import { BillingPromotion } from '../../db/entity/billing-promotion.entity';
import { BillingPromotionService } from './billing-promotion.service';

@Controller('/billing-promotions')
export class BillingPromotionController {
  constructor(private readonly billingPromotionService: BillingPromotionService) {}

  @Get()
  async getAvailableBillingPromotionsByOrganizationId(@Query() dto: GetAvailableBillingPromotionsByOrganizationIdDto): Promise<BillingPromotion[]> {
    return await this.billingPromotionService.getAvailableBillingPromotionsByOrganizationId(dto);
  }
}
