import { propertiesOf } from '@dogu-tech/common';
import { BillingSubscriptionPlanData } from './billing';
import { BillingPurchaseHistoryBase } from './billing-purchase-history';

export interface BillingSubscriptionPlanHistoryBase extends BillingSubscriptionPlanData {
  billingSubscriptionPlanHistoryId: string;
  billingOrganizationId: string;
  billingPurchaseHistoryId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  billingPurchaseHistory?: BillingPurchaseHistoryBase;
}

export const BillingSubscriptionPlanHistoryProp = propertiesOf<BillingSubscriptionPlanHistoryBase>();
