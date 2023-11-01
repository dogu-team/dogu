import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { IsUUID } from 'class-validator';
import { BillingSubscriptionPlanBase } from '..';
import { BillingInfoBase } from './billing-info';

export interface BillingHistoryBase {
  billingHistoryId: string;
  purchasedAt: Date;
  billingInfoId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  billingInfo?: BillingInfoBase;
  billingSubscriptionPlans?: BillingSubscriptionPlanBase[];
}

export const BillingHistoryPropCamel = propertiesOf<BillingHistoryBase>();
export const BillingHistoryPropSnake = camelToSnakeCasePropertiesOf<BillingHistoryBase>();

export class GetBillingHistorieByOrganizationIdDto {
  @IsUUID()
  organizationId!: string;
}
