import { BillingPlanInfoResponse, GetUpdatePaymentMethodTransactionResponse, UpdateBillingPlanInfoStateDto } from '@dogu-private/console';
import { OrganizationId } from '@dogu-private/types';
import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';

import { BillingPlanInfo } from '../../db/entity/billing-plan-info.entity';
import { BillingTokenPermission } from '../auth/guard/billing-token.guard';
import { BillingPlanInfoService } from './billing-plan-info.service';

@Controller('/billing/plan-infos')
export class BillingPlanInfoController {
  constructor(private readonly billingPlanInfoService: BillingPlanInfoService) {}

  @Get(':billingPlanInfoId')
  @BillingTokenPermission()
  async getBillingPlanInfo(@Param('billingPlanInfoId') billingPlanInfoId: string, @Query() organizationId: OrganizationId): Promise<BillingPlanInfo> {
    return await this.billingPlanInfoService.getBillingPlanInfo(billingPlanInfoId);
  }

  @Patch(':billingPlanInfoId/cancel-unsubscribe')
  @BillingTokenPermission()
  async cancelUnsubscribe(@Param('billingPlanInfoId') billingPlanInfoId: string, @Body() dto: UpdateBillingPlanInfoStateDto): Promise<BillingPlanInfoResponse> {
    return await this.billingPlanInfoService.cancelUnsubscribe(billingPlanInfoId, dto);
  }

  @Patch(':billingPlanInfoId/cancel-change-option-or-period')
  @BillingTokenPermission()
  async cancelChangeOptionOrPeriod(@Param('billingPlanInfoId') billingPlanInfoId: string, @Body() dto: UpdateBillingPlanInfoStateDto): Promise<BillingPlanInfoResponse> {
    return await this.billingPlanInfoService.cancelChangeOptionOrPeriod(billingPlanInfoId, dto);
  }

  @Patch(':billingPlanInfoId/unsubscribe')
  @BillingTokenPermission()
  async unsubscribe(@Param('billingPlanInfoId') billingPlanInfoId: string, @Body() dto: UpdateBillingPlanInfoStateDto): Promise<BillingPlanInfoResponse> {
    return await this.billingPlanInfoService.unsubscribe(billingPlanInfoId, dto);
  }

  @Get(':billingPlanInfoId/update-payment-method-transaction')
  @BillingTokenPermission()
  async getUpdatePaymentMethodTransaction(@Param('billingPlanInfoId') billingPlanInfoId: string): Promise<GetUpdatePaymentMethodTransactionResponse> {
    return await this.billingPlanInfoService.getUpdatePaymentMethodTransaction(billingPlanInfoId);
  }
}
