export const BillingCurrency = ['krw'] as const;
export type BillingCurrency = (typeof BillingCurrency)[number];

export const BillingPeriod = ['monthly', 'yearly'] as const;
export type BillingPeriod = (typeof BillingPeriod)[number];

export interface SubscriptionPlanPrice {
  monthly: number;
  yearly: number;
}

export type SubscriptionPlanPriceMap = Record<BillingCurrency, SubscriptionPlanPrice>;
