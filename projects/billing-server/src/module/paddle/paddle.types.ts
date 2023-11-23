import { BillingCategory, BillingCurrency, BillingPeriod, BillingSubscriptionPlanType, BillingUsdAmount } from '@dogu-private/console';

export namespace Paddle {
  const Status = ['active', 'archived'] as const;
  export type Status = (typeof Status)[number];

  export interface Meta {
    request_id?: string;
    pagination?: {
      per_page?: number;
      next?: string | null;
      has_more?: boolean;
      estimated_total?: number;
    };
  }

  export interface Error {
    type?: string;
    code?: string;
    detail?: string;
    documentation_url?: string;
  }

  export interface Response<T> {
    error?: Error;
    data?: T;
    meta?: Meta;
  }

  export interface Event {
    event_id?: string;
    event_type?: string;
    occurred_at?: string;
    notification_id?: string;
    data?: Record<string, unknown>;
  }

  export interface Customer {
    id?: string;
    name?: string | null;
    email?: string | null;
    status?: Status;
    custom_data?: Record<string, unknown> | null;
    locale?: string;
    created_at?: string;
    updated_at?: string;
  }

  export interface Product {
    id?: string;
    name?: string;
    description?: string | null;
    tax_category?: string;
    image_url?: string | null;
    custom_data?:
      | ({
          subscriptionPlanType?: BillingSubscriptionPlanType;
          category?: BillingCategory;
        } & Record<string, unknown>)
      | null;
    status?: Status;
    created_at?: string;
  }

  export interface Price {
    id?: string;
    product_id?: string;
    description?: string;
    name?: string | null;
    billing_cycle?: {
      interval?: string;
      frequency?: number;
    } | null;
    trial_period?: {
      interval?: string;
      frequency?: number;
    } | null;
    tax_mode?: string;
    unit_price?: {
      amount?: string;
      currency_code?: string;
    };
    unit_price_overrides?: {
      country_codes?: string[];
      unit_price?: {
        amount?: string;
        currency_code?: string;
      };
    };
    quantity?: {
      minimum?: number;
      maximum?: number;
    };
    status?: Status;
    custom_data?:
      | ({
          category?: BillingCategory;
          subscriptionPlanType?: BillingSubscriptionPlanType;
          option?: string;
          period?: BillingPeriod;
          currency?: BillingCurrency;
          amountInCents?: string;
          billingOrganizationId?: string;
        } & Record<string, unknown>)
      | null;
  }

  export interface ProductWithPrices extends Product {
    prices?: Price[];
  }

  export interface PriceFind {
    category: BillingCategory;
    subscriptionPlanType: BillingSubscriptionPlanType;
    option: string;
    period: BillingPeriod;
    currency: BillingCurrency;
    billingOrganizationId: string;
  }

  export interface PriceMatch extends PriceFind {
    amount: BillingUsdAmount;
  }

  export type PriceSource = PriceMatch;

  export interface ProductMatch {
    subscriptionPlanType: BillingSubscriptionPlanType;
    category: BillingCategory;
  }

  export interface ProductSource extends ProductMatch {
    name: string;
    prices: PriceSource[];
  }
}
