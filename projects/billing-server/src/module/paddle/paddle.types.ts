import { BillingCategory, BillingCouponType, BillingPeriod, BillingPlanType } from '@dogu-private/console';

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
          type?: BillingPlanType;
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
          billingPlanSourceId?: number;
        } & Record<string, unknown>)
      | null;
  }

  export interface ProductWithPrices extends Product {
    prices?: Price[];
  }

  export interface PriceMatch {
    billingPlanSourceId: number;
  }

  export interface ProductMatch {
    category: BillingCategory;
    type: BillingPlanType;
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

  export const SubscriptionStatus = ['active', 'canceled', 'past_due', 'paused', 'trialing'] as const;
  export type SubscriptionStatus = (typeof SubscriptionStatus)[number];

  export const SubscriptionAction = ['cancel', 'pause', 'resume'] as const;
  export type SubscriptionAction = (typeof SubscriptionAction)[number];

  export const SubscriptionItemStatus = ['active', 'inactive', 'trialing'] as const;
  export type SubscriptionItemStatus = (typeof SubscriptionItemStatus)[number];

  export interface Subscription {
    id?: string;
    status?: SubscriptionStatus;
    customer_id?: string;
    address_id?: string;
    currency_code?: string;
    created_at?: string;
    updated_at?: string;
    started_at?: string | null;
    first_billed_at?: string | null;
    next_billed_at?: string | null;
    paused_at?: string | null;
    canceled_at?: string | null;
    discount?: {
      id?: string;
      starts_at?: string;
      ends_at?: string;
    } | null;
    current_billing_period?: {
      starts_at?: string;
      ends_at?: string;
    } | null;
    billing_cycle?: {
      interval?: string;
      frequency?: number;
    };
    scheduled_change?: {
      action?: SubscriptionAction;
      effective_at?: string;
      resume_at?: string | null;
    } | null;
    management_urls?: {
      update_payment_method?: string | null;
      cancel?: string | null;
    } | null;
    items?: {
      status?: SubscriptionItemStatus;
      quantity?: number;
      recurring?: boolean;
      created_at?: string;
      updated_at?: string;
      previously_billed_at?: string | null;
      next_billed_at?: string | null;
      trial_dates?: {
        starts_at?: string;
        ends_at?: string;
      } | null;
      price?: {
        id?: string;
        description?: string;
        product_id?: string;
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
      };
    }[];
    custom_data?:
      | ({
          billingPlanInfoId?: string;
        } & Record<string, unknown>)
      | null;
  }

  export interface Address {
    id?: string;
    description?: string | null;
    first_line?: string | null;
    second_line?: string | null;
    city?: string | null;
    postal_code?: string | null;
    region?: string | null;
    country_code?: string | null;
    custom_data?: Record<string, unknown> | null;
    status?: Status;
    created_at?: string;
    updated_at?: string;
  }

  export interface Transaction {
    id?: string;
    customer_id?: string | null;
    address_id?: string | null;
    business_id?: string | null;
    custom_data?: Record<string, unknown> | null;
    currency_code?: string;
    origin?: string;
    subscription_id?: string | null;
    invoice_id?: string | null;
    invoice_number?: string | null;
    collection_mode?: string;
    discount_id?: string | null;
    billing_details?: {
      enable_checkout?: boolean;
      purchase_order_number?: string;
      additional_information?: string;
      payment_terms?: {
        interval?: string;
        frequency?: number;
      };
    } | null;
    billing_period?: {
      starts_at?: string;
      ends_at?: string;
    } | null;
    items?: {
      price_id?: string;
      price?: Price;
      quantity?: number;
      proration?: {
        rate?: string;
        billing_period?: {
          starts_at?: string;
          ends_at?: string;
        };
      };
    }[];
    details?: {
      tax_rates_used?: {
        tax_rate?: string;
        totals?: {
          subtotal?: string;
          discount?: string;
          tax?: string;
          total?: string;
        };
      }[];
      totals?: {
        subtotal?: string;
        discount?: string;
        tax?: string;
        total?: string;
        credit?: string;
        balance?: string;
        grand_total?: string;
        fee?: string | null;
        earnings?: string | null;
        currency_code?: string;
      };
      adjusted_totals?: {
        subtotal?: string;
        tax?: string;
        total?: string;
        grand_total?: string;
        fee?: string | null;
        earnings?: string | null;
        currency_code?: string;
      } | null;
      payout_totals?: {
        subtotal?: string;
        discount?: string;
        tax?: string;
        total?: string;
        credit?: string;
        balance?: string;
        grand_total?: string;
        fee?: string;
        earnings?: string;
        currency_code?: string;
      } | null;
      adjusted_payout_totals?: {
        subtotal?: string;
        tax?: string;
        total?: string;
        fee?: string;
        chargeback_fee?: {
          amount?: string;
          original?: {
            amount?: string;
            currency_code?: string;
          } | null;
        };
        earnings?: string;
      };
      line_items?: {
        id?: string;
        price_id?: string;
        quantity?: number;
        proration?: {
          rate?: string;
          billing_period?: {
            starts_at?: string;
            ends_at?: string;
          };
        } | null;
        tax_rate?: string;
        unit_totals?: {
          subtotal?: string;
          discount?: string;
          tax?: string;
          total?: string;
        };
        totals: {
          subtotal?: string;
          discount?: string;
          tax?: string;
          total?: string;
        };
        product?: Product;
      }[];
    };
    payments?: {
      payment_attempt_id?: string;
      stored_payment_method_id?: string;
      amount?: string;
      status?: string;
      error_code?: string | null;
      method_details?: {
        type?: string;
        card?: {
          type?: string;
          last4?: string;
          expiry_month?: number;
          expiry_year?: number;
          cardholder_name?: string;
        } | null;
      };
      created_at?: string;
      captured_at?: string | null;
    }[];
    checkout?: {
      url?: string | null;
    } | null;
    created_at?: string;
    updated_at?: string;
    billed_at?: string | null;
  }
}
