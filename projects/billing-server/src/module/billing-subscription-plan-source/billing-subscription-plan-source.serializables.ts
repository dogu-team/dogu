import {
  BillingCategory,
  BillingCurrency,
  BillingPeriod,
  BillingResult,
  BillingSubscriptionPlanData,
  BillingSubscriptionPlanMap,
  BillingSubscriptionPlanOptionInfo,
  BillingSubscriptionPlanPrice,
  BillingSubscriptionPlanPriceMap,
  BillingSubscriptionPlanPriceSource,
  BillingSubscriptionPlanType,
  resultCode,
} from '@dogu-private/console';
import _ from 'lodash';
import { BillingSubscriptionPlanSource } from '../../db/entity/billing-subscription-plan-source.entity';
import { RetryTransactionContext } from '../../db/retry-transaction';

export interface ParseSubscriptionPlanDataOptions {
  billingOrganizationId: string;
  type: BillingSubscriptionPlanType;
  category: BillingCategory;
  option: number;
  currency: BillingCurrency;
  period: BillingPeriod;
}

export interface ParseSubscriptionPlanDataResultValue {
  planData: BillingSubscriptionPlanData;
  planSource: BillingSubscriptionPlanSource | null;
}

export type ParseSubscriptionPlanDataResult = BillingResult<ParseSubscriptionPlanDataResultValue>;

export async function parseSubscriptionPlanData(context: RetryTransactionContext, options: ParseSubscriptionPlanDataOptions): Promise<ParseSubscriptionPlanDataResult> {
  const { billingOrganizationId, type, category, option, currency, period } = options;
  const { manager } = context;
  const planSource = await manager.getRepository(BillingSubscriptionPlanSource).findOne({
    where: {
      billingOrganizationId,
      type,
      category,
      option,
      currency,
      period,
    },
  });

  if (planSource) {
    return {
      ok: true,
      value: {
        planData: {
          type: planSource.type,
          category: planSource.category,
          option: planSource.option,
          currency: planSource.currency,
          period: planSource.period,
          originPrice: planSource.originPrice,
        },
        planSource,
      },
    };
  }

  // validate subscription plan type
  const billingSubscriptionPlanOptionInfo = _.get(BillingSubscriptionPlanMap, type) as BillingSubscriptionPlanOptionInfo | undefined;
  if (!billingSubscriptionPlanOptionInfo) {
    return {
      ok: false,
      resultCode: resultCode('subscription-plan-type-not-found'),
    };
  }

  if (billingSubscriptionPlanOptionInfo.category !== category) {
    return {
      ok: false,
      resultCode: resultCode('subscription-plan-category-not-matched'),
    };
  }

  const billingSubscriptionPlanPriceMap = _.get(billingSubscriptionPlanOptionInfo.optionMap, option) as BillingSubscriptionPlanPriceMap | undefined;
  if (!billingSubscriptionPlanPriceMap) {
    return {
      ok: false,
      resultCode: resultCode('subscription-plan-option-not-found'),
    };
  }

  const billingSubscriptionPlanPrice = _.get(billingSubscriptionPlanPriceMap, currency) as BillingSubscriptionPlanPrice | undefined;
  if (!billingSubscriptionPlanPrice) {
    return {
      ok: false,
      resultCode: resultCode('subscription-plan-currency-not-found'),
    };
  }

  const planPriceSource = _.get(billingSubscriptionPlanPrice, period) as BillingSubscriptionPlanPriceSource | undefined;
  if (!planPriceSource) {
    return {
      ok: false,
      resultCode: resultCode('subscription-plan-price-source-not-found'),
    };
  }

  const originPrice = planPriceSource.originPrice;
  return {
    ok: true,
    value: {
      planData: {
        type,
        category,
        option,
        currency,
        period,
        originPrice,
      },
      planSource: null,
    },
  };
}
