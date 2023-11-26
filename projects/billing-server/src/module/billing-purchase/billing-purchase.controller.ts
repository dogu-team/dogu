import {
  CreatePurchaseSubscriptionDto,
  CreatePurchaseSubscriptionResponse,
  CreatePurchaseSubscriptionWithNewCardDto,
  CreatePurchaseSubscriptionWithNewCardResponse,
  GetBillingSubscriptionPreviewDto,
  GetBillingSubscriptionPreviewResponse,
  RefundFullDto,
  RefundSubscriptionPlanDto,
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

  @Post('/refund/subscription-plan')
  @BillingTokenPermission()
  async refundPurchaseSubscription(@Body() dto: RefundSubscriptionPlanDto): Promise<void> {
    return await this.billingPurchaseService.refundSubscriptionPlan(dto);
  }

  @Post('/refund/full')
  @BillingTokenPermission()
  async refundFull(@Body() dto: RefundFullDto): Promise<void> {
    return await this.billingPurchaseService.refundFull(dto);
  }
}
