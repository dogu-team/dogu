export const BillingResultCodeMap = {
  // common
  ok: 0,
  'unexpected-error': 1,
  'division-by-zero': 2,

  // organization
  'organization-not-found': 100,
  'organization-method-nice-not-found': 101,
  'organization-monthly-started-at-not-found': 102,
  'organization-monthly-expired-at-not-found': 103,
  'organization-yearly-started-at-not-found': 104,
  'organization-yearly-expired-at-not-found': 105,

  // coupon
  'coupon-not-found': 200,
  'coupon-expired': 201,
  'coupon-already-used': 202,
  'coupon-all-used': 203,
  'coupon-invalid-monthly-apply-count': 204,
  'coupon-invalid-monthly-discount-percent': 205,
  'coupon-invalid-yearly-apply-count': 206,
  'coupon-invalid-yearly-discount-percent': 207,
  'coupon-multiple-proceeds-not-allowed': 208,

  // subscription plan
  'subscription-plan-not-found': 300,
  'subscription-plan-currency-not-found': 301,
  'subscription-plan-period-not-found': 302,
  'subscription-plan-type-not-found': 303,
  'subscription-plan-option-not-found': 304,
  'subscription-plan-category-not-matched': 305,
  'subscription-plan-currency-not-matched': 306,
  'subscription-plan-duplicated': 307,
  'subscription-plan-not-upgrade': 308,

  // method nice
  'method-nice-bid-not-found': 400,
};

export type BillingReason = keyof typeof BillingResultCodeMap;

export interface BillingResultCode {
  code: number;
  reason: BillingReason;
}

export function resultCode(reason: BillingReason): BillingResultCode {
  return { code: BillingResultCodeMap[reason], reason };
}
