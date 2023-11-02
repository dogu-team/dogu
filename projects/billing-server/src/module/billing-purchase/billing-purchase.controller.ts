import {
  CreatePurchaseSubscriptionDto,
  CreatePurchaseSubscriptionResponse,
  CreatePurchaseSubscriptionWithNewCardDto,
  CreatePurchaseSubscriptionWithNewCardResponse,
  GetBillingSubscriptionPreviewDto,
  GetBillingSubscriptionPreviewResponse,
} from '@dogu-private/console';
import { Body, Controller, Get, Post, Query } from '@nestjs/common';
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

  @Post()
  @BillingTokenPermission()
  async createPurchaseSubscription(@Body() dto: CreatePurchaseSubscriptionDto): Promise<CreatePurchaseSubscriptionResponse> {
    return await this.billingPurchaseService.createPurchaseSubscription(dto);
  }

  @Post('/new-card')
  @BillingTokenPermission()
  async createPurchaseSubscriptionWithNewCard(@Body() dto: CreatePurchaseSubscriptionWithNewCardDto): Promise<CreatePurchaseSubscriptionWithNewCardResponse> {
    return await this.billingPurchaseService.createPurchaseSubscriptionWithNewCard(dto);
  }
}
