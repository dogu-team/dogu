import {
  CreatePurchaseDto,
  CreatePurchaseResponse,
  CreatePurchaseWithNewCardDto,
  CreatePurchaseWithNewCardResponse,
  GetBillingPreviewDto,
  GetBillingPreviewResponse,
  PrecheckoutDto,
  PrecheckoutResponse,
  RefundFullDto,
  RefundPlanDto,
} from '@dogu-private/console';
import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { BillingTokenPermission } from '../auth/guard/billing-token.guard';
import { BillingPurchaseService } from './billing-purchase.service';

@Controller('/billing/purchase')
export class BillingPurchaseController {
  constructor(private readonly billingPurchaseService: BillingPurchaseService) {}

  @Get('/preview')
  @BillingTokenPermission()
  async getPreview(@Query() dto: GetBillingPreviewDto): Promise<GetBillingPreviewResponse> {
    return await this.billingPurchaseService.getPreview(dto);
  }

  @Post()
  @BillingTokenPermission()
  async createPurchase(@Body() dto: CreatePurchaseDto): Promise<CreatePurchaseResponse> {
    return await this.billingPurchaseService.createPurchase(dto);
  }

  @Post('/new-card')
  @BillingTokenPermission()
  async createPurchaseWithNewCard(@Body() dto: CreatePurchaseWithNewCardDto): Promise<CreatePurchaseWithNewCardResponse> {
    return await this.billingPurchaseService.createPurchaseWithNewCard(dto);
  }

  @Post('/refund/plan')
  @BillingTokenPermission()
  async refundPurchase(@Body() dto: RefundPlanDto): Promise<void> {
    return await this.billingPurchaseService.refundPlan(dto);
  }

  @Post('/refund/full')
  @BillingTokenPermission()
  async refundFull(@Body() dto: RefundFullDto): Promise<void> {
    return await this.billingPurchaseService.refundFull(dto);
  }

  @Get('/precheckout')
  @BillingTokenPermission()
  async precheckout(@Query() dto: PrecheckoutDto): Promise<PrecheckoutResponse> {
    return await this.billingPurchaseService.precheckout(dto);
  }
}
