import { BillingCurrency, BillingSubscriptionPlanType } from '@dogu-private/console';

export interface SendPurchaseSuccessSlackMessageParam {
  isSucceeded: true;
  organizationId: string;
  amount: number;
  currency: BillingCurrency;
  purchasedAt: Date;
  historyId: string;
  plans: {
    option: string | number;
    type: BillingSubscriptionPlanType;
  }[];
}

export interface SendPurchaseFailSlackMessageParam {
  isSucceeded: false;
  organizationId: string;
  purchasedAt: Date;
  plans: {
    option: string | number;
    type: BillingSubscriptionPlanType;
  }[];
}

export type SendPurchaseSlackMessageParam = SendPurchaseSuccessSlackMessageParam | SendPurchaseFailSlackMessageParam;

export interface SendUnsubscribeSlackMessageParam {
  organizationId: string;
  plan: {
    option: string | number;
    type: BillingSubscriptionPlanType;
  };
}
