export const BillingResultCodeMap = {
  // common
  ok: 0,
  'unexpected-error': 1,

  // organization
  'organization-not-found': 100,

  // coupon
  'coupon-not-found': 200,
  'coupon-expired': 201,
  'coupon-already-used': 202,
  'coupon-all-used': 203,
  'coupon-invalid-monthly-apply-count': 204,
  'coupon-invalid-yearly-apply-count': 205,
  'coupon-null-argument': 206,
  'coupon-invalid-monthly-discount-percent': 207,
  'coupon-invalid-yearly-discount-percent': 208,

  // subscription plan
  'subscription-plan-currency-not-found': 300,
  'subscription-plan-period-not-found': 301,
  'subscription-plan-type-not-found': 302,
  'subscription-plan-option-not-found': 303,
  'subscription-plan-category-not-matched': 304,
  'subscription-plan-currency-not-matched': 305,
  'subscription-plan-duplicated': 306,
};

export type BillingReason = keyof typeof BillingResultCodeMap;

export interface BillingResultCode {
  code: number;
  reason: BillingReason;
}

export function resultCode(reason: BillingReason): BillingResultCode {
  return { code: BillingResultCodeMap[reason], reason };
}
