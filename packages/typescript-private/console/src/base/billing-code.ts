import _ from 'lodash';

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
  'method-nice-subscribe-regist-failed': 601,
  'method-nice-subscribe-expire-failed': 602,
  'method-nice-subscribe-payments-failed': 603,
  'method-nice-network-error': 604,
  'method-nice-payments-cancel-failed': 605,
  'method-nice-payments-failed': 606,
  'method-nice-payments-netcancel-failed': 607,
  'method-nice-order-id-mismatch': 608,
  'method-nice-status-not-paid': 609,
  'method-nice-status-not-canceled-or-partial-cancelled': 610,
  'method-nice-not-found': 611,
};

export type BillingReason = keyof typeof BillingResultCodeMap;

export type BillingResultCodeDetailValue = undefined | null | boolean | number | string;
export type BillingResultCodeDetails = Record<string, BillingResultCodeDetailValue>;

export interface BillingResultCode<T = BillingReason> {
  code: number;
  reason: T;
  details?: BillingResultCodeDetails;
}

export function resultCode<T extends string = BillingReason>(reason: T, details?: BillingResultCodeDetails): BillingResultCode<T> {
  const code = _.get(BillingResultCodeMap, reason, 'unexpected-error') as number;
  return { code, reason, details };
}

export interface BillingResultFailure<Reason = BillingReason, Extras extends object = object> {
  ok: false;
  resultCode: BillingResultCode<Reason>;
  extras?: Extras;
}

export interface BillingResultSuccess<Value, Extras extends object = object> {
  ok: true;
  value: Value;
  extras?: Extras;
}

export type BillingResult<Value, Reason = BillingReason, Extras extends object = object> =
  | BillingResultFailure<Reason, Extras> //
  | BillingResultSuccess<Value, Extras>;
