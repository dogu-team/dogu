import { stringify } from '@dogu-tech/common';

export const BillingResultCodeMap = {
  // common
  ok: 0,
  'unexpected-error': 1,

  // organization
  'organization-not-found': 100,
  'organization-method-nice-not-found': 101,
  'organization-subscription-monthly-started-at-not-found': 102,
  'organization-subscription-monthly-expired-at-not-found': 103,
  'organization-subscription-yearly-started-at-not-found': 105,
  'organization-subscription-yearly-expired-at-not-found': 106,
  'organization-plan-infos-not-found': 107,
  'organization-method-paddle-not-found': 108,

  // coupon
  'coupon-not-found': 200,
  'coupon-expired': 201,
  'coupon-already-used': 202,
  'coupon-all-used': 203,
  'coupon-invalid-discount-percent': 204,
  'coupon-plan-type-not-matched': 205,
  'coupon-period-not-matched': 206,
  'coupon-invalid-apply-count': 207,

  // plan
  'plan-not-found': 300,
  'plan-currency-not-found': 301,
  'plan-period-not-found': 302,
  'plan-type-not-found': 303,
  'plan-option-not-found': 304,
  'plan-category-not-matched': 305,
  'plan-currency-not-matched': 306,
  'plan-duplicated': 307,
  'plan-unsubscribed': 308,
  'plan-price-source-not-found': 309,
  'plan-source-not-found': 310,

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
