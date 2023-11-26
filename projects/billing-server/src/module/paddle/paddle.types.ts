import { BillingCategory, BillingCouponType, BillingPeriod, BillingSubscriptionPlanType } from '@dogu-private/console';

export namespace Paddle {
  export const Status = ['active', 'archived'] as const;
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
    custom_data?:
      | ({
          organizationId?: string;
          ownerUserId?: string;
          billingOrganizationId?: string;
        } & Record<string, unknown>)
      | null;
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
          category?: BillingCategory;
          type?: BillingSubscriptionPlanType;
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
          billingSubscriptionPlanSourceId?: number;
        } & Record<string, unknown>)
      | null;
  }

  export interface ProductWithPrices extends Product {
    prices?: Price[];
  }

  export interface PriceMatch {
    billingSubscriptionPlanSourceId: number;
  }

  export interface ProductMatch {
    category: BillingCategory;
    type: BillingSubscriptionPlanType;
  }

  export interface ProductOrigin extends ProductMatch {
    name: string;
  }

  export const DiscountStatus = ['active', 'archived', 'expired', 'used'] as const;
  export type DiscountStatus = (typeof DiscountStatus)[number];

  export const DiscountType = ['flat', 'flat_per_seat', 'percentage'] as const;
  export type DiscountType = (typeof DiscountType)[number];

  export interface Discount {
    id?: string;
    status?: DiscountStatus;
    external_id?: string;
    description?: string;
    enabled_for_checkout?: boolean;
    code?: string | null;
    type?: DiscountType;
    amount?: string;
    currency_code?: string | null;
    recur?: boolean;
    maximum_recurring_intervals?: number | null;
    usage_limit?: number | null;
    restrict_to?: string[] | null;
    expires_at?: string | null;
    custom_data?:
      | ({
          billingCouponId?: string;
          type?: BillingCouponType;
          period?: BillingPeriod;
        } & Record<string, unknown>)
      | null;
    times_used?: number;
    created_at?: string;
    updated_at?: string;
  }

  export interface DiscountMatch {
    billingCouponId: string;
  }
}
