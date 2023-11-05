export const BillingResultCodeMap = {
  // common
  ok: 0,
  'unexpected-error': 1,
  'division-by-zero': 2,

  // organization
  'organization-not-found': 100,
  'organization-method-nice-not-found': 101,
  'organization-monthly-calculation-started-at-not-found': 102,
  'organization-monthly-calculation-expired-at-not-found': 103,
  'organization-yearly-calculation-started-at-not-found': 104,
  'organization-yearly-calculation-expired-at-not-found': 105,

  // coupon
  'coupon-not-found': 200,
  'coupon-expired': 201,
  'coupon-already-used': 202,
  'coupon-all-used': 203,
  'coupon-invalid-monthly-apply-count': 204,
  'coupon-invalid-monthly-discount-percent': 205,
  'coupon-invalid-yearly-apply-count': 206,
  'coupon-invalid-yearly-discount-percent': 207,

  // subscription plan
  'subscription-plan-currency-not-found': 300,
  'subscription-plan-period-not-found': 301,
  'subscription-plan-type-not-found': 302,
  'subscription-plan-option-not-found': 303,
  'subscription-plan-category-not-matched': 304,
  'subscription-plan-currency-not-matched': 305,
  'subscription-plan-duplicated': 306,
  'subscription-plan-not-upgrade': 307,

  // method nice
  'method-nice-bid-not-found': 400,

  // timezone
  'timezone-offset-not-found': 500,
  'timezone-offset-not-matched': 501,
  'timezone-offset-sign-not-matched': 502,
  'timezone-offset-hours-not-matched': 503,
  'timezone-offset-minutes-not-matched': 504,
  'timezone-offset-hours-range-not-matched': 505,
  'timezone-offset-minutes-range-not-matched': 506,
  'timezone-offset-hours-not-number': 507,
  'timezone-offset-minutes-not-number': 508,
};

export type BillingReason = keyof typeof BillingResultCodeMap;

export interface BillingResultCode {
  code: number;
  reason: BillingReason;
}

export function resultCode(reason: BillingReason): BillingResultCode {
  return { code: BillingResultCodeMap[reason], reason };
}
