import { propertiesOf } from '@dogu-tech/common';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsUUID } from 'class-validator';
import { PageDtoBase } from '../dto/pagination/page.dto';
import { BillingCurrency, BillingMethod } from './billing';
import { BillingOrganizationBase } from './billing-organization';
import { BillingPlanHistoryBase } from './billing-plan-history';

export const BillingHistoryTypeRefund = ['full-refund', 'partial-refund'] as const;
export type BillingHistoryTypeRefund = (typeof BillingHistoryTypeRefund)[number];

export const BillingHistoryTypePurchase = ['immediate-purchase', 'periodic-purchase'] as const;
export type BillingHistoryTypePurchase = (typeof BillingHistoryTypePurchase)[number];

export const BillingHistoryType = [...BillingHistoryTypePurchase, ...BillingHistoryTypeRefund] as const;
export type BillingHistoryType = (typeof BillingHistoryType)[number];

export interface BillingHistoryBase {
  billingHistoryId: string;
  billingOrganizationId: string;
  historyType: BillingHistoryType;
  currency: BillingCurrency;
  purchasedAmount: number | null;
  goodsName: string;
  method: BillingMethod;
  cardCode: string | null;
  cardName: string | null;
  cardNumberLast4Digits: string | null;
  cardExpirationYear: string | null;
  cardExpirationMonth: string | null;
  cancelReason: string | null;
  refundedAmount: number | null;
  purchasedBillingHistoryId: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  billingOrganization?: BillingOrganizationBase;
  billingPlanHistories?: BillingPlanHistoryBase[];

  // nice only
  previewResponse: Record<string, unknown> | null;
  niceSubscribePaymentsResponse: Record<string, unknown> | null;
  niceTid: string | null;
  niceOrderId: string | null;
  nicePaymentsCancelResponse: Record<string, unknown> | null;

  // paddle only
  paddleMethodType: string | null;
  paddleTransactionId: string | null;
  paddleTransaction: Record<string, unknown> | null;
}

export const BillingHistoryProp = propertiesOf<BillingHistoryBase>();

export class GetBillingHistoriesDto implements PageDtoBase {
  @IsUUID()
  organizationId!: string;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  page = 1;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  offset = 10;
}
