import { propertiesOf } from '@dogu-tech/common';
import { IsUUID } from 'class-validator';
import { BillingMethod } from './billing';
import { BillingOrganizationBase } from './billing-organization';

export interface BillingHistoryBase {
  billingHistoryId: string;
  billingOrganizationId: string;
  purchasedAt: Date;
  method: BillingMethod;
  niceSubscribePaymentsResponse: Record<string, unknown> | null;
  previewResponse: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  billingOrganization?: BillingOrganizationBase;
}

export const BillingHistoryProp = propertiesOf<BillingHistoryBase>();

export class GetBillingHistoriesDto {
  @IsUUID()
  organizationId!: string;
}
