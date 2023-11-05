import { BillingResultCode, resultCode } from '@dogu-private/console';
import { assertUnreachable } from '@dogu-tech/common';
import { BillingSubscriptionPlanInfo } from '../../db/entity/billing-subscription-plan-info.entity';

export interface CalculateNextPurchaseAmountResultFailure {
  ok: false;
  resultCode: BillingResultCode;
}

export interface CalculateNextPurchaseAmountResultSuccess {
  ok: true;
  amount: number;
}

export type CalculateNextPurchaseAmountResult = CalculateNextPurchaseAmountResultFailure | CalculateNextPurchaseAmountResultSuccess;

export function calculateNextPurchaseAmount(billingSubscriptionPlanInfo: BillingSubscriptionPlanInfo): CalculateNextPurchaseAmountResult {
  const { state, originPrice, discountedAmount, changeRequestedDiscountedAmount, changeRequestedOriginPrice } = billingSubscriptionPlanInfo;
  switch (state) {
    case 'subscribed': {
      return {
        ok: true,
        amount: originPrice - (discountedAmount ?? 0),
      };
    }
    case 'unsubscribed': {
      return {
        ok: true,
        amount: 0,
      };
    }
    case 'unsubscribe-requested': {
      return {
        ok: true,
        amount: 0,
      };
    }
    case 'change-option-requested': {
      if (changeRequestedOriginPrice === null) {
        return {
          ok: false,
          resultCode: resultCode('unexpected-error'),
        };
      }

      return {
        ok: true,
        amount: changeRequestedOriginPrice - (changeRequestedDiscountedAmount ?? 0),
      };
    }
    case 'change-period-requested': {
      if (changeRequestedOriginPrice === null) {
        return {
          ok: false,
          resultCode: resultCode('unexpected-error'),
        };
      }

      return {
        ok: true,
        amount: changeRequestedOriginPrice - (changeRequestedDiscountedAmount ?? 0),
      };
    }
    case 'change-option-and-period-requested': {
      if (changeRequestedOriginPrice === null) {
        return {
          ok: false,
          resultCode: resultCode('unexpected-error'),
        };
      }

      return {
        ok: true,
        amount: changeRequestedOriginPrice - (changeRequestedDiscountedAmount ?? 0),
      };
    }
    default:
      assertUnreachable(state);
  }
}
