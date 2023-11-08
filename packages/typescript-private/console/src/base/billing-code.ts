export const BillingResultCodeMap = {
  // common
  ok: 0,
  'unexpected-error': 1,
  'division-by-zero': 2,

  // organization
  'organization-not-found': 100,
  'organization-method-nice-not-found': 101,
  'organization-subscription-monthly-started-at-not-found': 102,
  'organization-subscription-monthly-expired-at-not-found': 103,
  'organization-subscription-yearly-started-at-not-found': 105,
  'organization-subscription-yearly-expired-at-not-found': 106,

  // coupon
  'coupon-not-found': 200,
  'coupon-expired': 201,
  'coupon-already-used': 202,
  'coupon-all-used': 203,
  'coupon-invalid-monthly-apply-count': 204,
  'coupon-invalid-monthly-discount-percent': 205,
  'coupon-invalid-yearly-apply-count': 206,
  'coupon-invalid-yearly-discount-percent': 207,
  'coupon-invalid-process': 208,

  // subscription plan
  'subscription-plan-not-found': 300,
  'subscription-plan-currency-not-found': 301,
  'subscription-plan-period-not-found': 302,
  'subscription-plan-type-not-found': 303,
  'subscription-plan-option-not-found': 304,
  'subscription-plan-category-not-matched': 305,
  'subscription-plan-currency-not-matched': 306,
  'subscription-plan-duplicated': 307,
  'subscription-plan-unsubscribed': 308,

  // cloud license
  'cloud-license-not-found': 400,

  // self-hosted license
  'self-hosted-license-not-found': 500,

  // method nice
  'method-nice-bid-not-found': 600,
};

export type BillingReason = keyof typeof BillingResultCodeMap;

export type BillingResultCodeDetailValue = undefined | null | boolean | number | string;
export type BillingResultCodeDetails = Record<string, BillingResultCodeDetailValue>;

export interface BillingResultCode {
  code: number;
  reason: BillingReason;
  details?: BillingResultCodeDetails;
}

export function resultCode(reason: BillingReason, details?: BillingResultCodeDetails): BillingResultCode {
  return { code: BillingResultCodeMap[reason], reason, details };
}
