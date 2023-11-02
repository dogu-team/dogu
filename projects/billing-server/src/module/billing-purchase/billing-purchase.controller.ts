import { GetBillingSubscriptionPreviewDto, GetBillingSubscriptionPreviewResponse } from '@dogu-private/console';
import { Controller, Get, Query } from '@nestjs/common';
import { BillingTokenPermission } from '../auth/guard/billing-token.guard';
import { BillingPurchaseService } from './billing-purchase.service';

@Controller('/billing/purchase')
export class BillingPurchaseController {
  constructor(private readonly billingPurchaseService: BillingPurchaseService) {}

  @Get('/preview')
  @BillingTokenPermission()
  async getSubscriptionPreview(@Query() dto: GetBillingSubscriptionPreviewDto): Promise<GetBillingSubscriptionPreviewResponse> {
    return await this.billingPurchaseService.getSubscriptionPreview(dto);
  }
}
