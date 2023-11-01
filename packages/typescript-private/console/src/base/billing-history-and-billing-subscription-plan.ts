import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';

export interface BillingHistoryAndBillingSubscriptionPlanBase {
  billingHistoryId: string;
  billingSubscriptionPlanId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export const BillingHistoryAndBillingSubscriptionPlanPropCamel = propertiesOf<BillingHistoryAndBillingSubscriptionPlanBase>();
export const BillingHistoryAndBillingSubscriptionPlanPropSnake = camelToSnakeCasePropertiesOf<BillingHistoryAndBillingSubscriptionPlanBase>();
