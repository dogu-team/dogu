import { stringify } from '@dogu-tech/common';

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
  'organization-subscription-plan-infos-not-found': 107,
  'organization-method-paddle-not-found': 108,

  // coupon
  'coupon-not-found': 200,
  'coupon-expired': 201,
  'coupon-already-used': 202,
  'coupon-all-used': 203,
  'coupon-invalid-monthly-apply-count': 204,
  'coupon-invalid-monthly-discount-percent': 205,
  'coupon-invalid-yearly-apply-count': 206,
  'coupon-invalid-yearly-discount-percent': 207,
  'coupon-subscription-plan-type-not-matched': 208,

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
  'subscription-plan-price-source-not-found': 309,

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

  // method paddle
  'method-paddle-list-events-failed': 700,
  'method-paddle-get-customer-failed': 701,
  'method-paddle-create-customer-failed': 702,
  'method-paddle-customer-id-not-found': 703,
  'method-paddle-update-customer-failed': 704,
  'method-paddle-list-products-failed': 705,
  'method-paddle-create-product-failed': 706,
  'method-paddle-create-price-failed': 707,
  'method-paddle-price-id-not-found': 708,
  'method-paddle-price-not-found': 709,
  'method-paddle-update-product-failed': 710,
  'method-paddle-update-price-failed': 711,
  'method-paddle-list-discounts-failed': 712,
  'method-paddle-create-discount-failed': 713,
  'method-paddle-update-discount-failed': 714,
};

export type BillingReason = keyof typeof BillingResultCodeMap;
export type BillingCode = (typeof BillingResultCodeMap)[BillingReason];

export type BillingResultCodeDetailsValue = undefined | null | boolean | number | string;
export type BillingResultCodeDetails = Record<string, BillingResultCodeDetailsValue>;

export interface BillingResultCode {
  code: BillingCode;
  reason: BillingReason;
  details?: BillingResultCodeDetails;
}

export function resultCode(reason: BillingReason, details?: BillingResultCodeDetails): BillingResultCode {
  const code = BillingResultCodeMap[reason];
  return { code, reason, details };
}

export interface BillingResultFailure {
  ok: false;
  resultCode: BillingResultCode;
}

export type BillingResultFailureWithExtras<Extras extends Record<string, unknown>> = BillingResultFailure & Extras;

export interface BillingResultSuccess<Value> {
  ok: true;
  value: Value;
}

export type BillingResultSuccessWithExtras<Value, Extras extends Record<string, unknown>> = BillingResultSuccess<Value> & Extras;

export type BillingResult<
  Value,
  FailureExtras extends Record<string, unknown> = Record<string, unknown>,
  SuccessExtras extends Record<string, unknown> = Record<string, unknown>,
> = BillingResultFailureWithExtras<FailureExtras> | BillingResultSuccessWithExtras<Value, SuccessExtras>;

export class BillingResultFailureError<Extras extends Record<string, unknown>> extends Error {
  constructor(readonly failure: BillingResultFailureWithExtras<Extras>) {
    super(`BillingResultFailure: ${stringify(failure)}`);
  }
}

export function throwFailure<Extras extends Record<string, unknown>>(failure: BillingResultFailureWithExtras<Extras>): never {
  throw new BillingResultFailureError(failure);
}

export function unwrap<Value, FailureExtras extends Record<string, unknown> = Record<string, unknown>, SuccessExtras extends Record<string, unknown> = Record<string, unknown>>(
  result: BillingResult<Value, FailureExtras, SuccessExtras>,
): Value {
  if (!result.ok) {
    throwFailure(result);
  }

  return result.value;
}
