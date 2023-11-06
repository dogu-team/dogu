import {
  BillingCategory,
  BillingCurrency,
  BillingPeriod,
  BillingResultCode,
  BillingSubscriptionPlanData,
  BillingSubscriptionPlanMap,
  BillingSubscriptionPlanOptionInfo,
  BillingSubscriptionPlanPrice,
  BillingSubscriptionPlanPriceMap,
  BillingSubscriptionPlanType,
  resultCode,
} from '@dogu-private/console';
import _ from 'lodash';
import { BillingSubscriptionPlanSource } from '../../db/entity/billing-subscription-plan-source.entity';
import { RetrySerializeContext } from '../../db/utils';

export interface ParseBillingSubscriptionPlanDataOptions {
  context: RetrySerializeContext;
  billingOrganizationId: string;
  type: BillingSubscriptionPlanType;
  category: BillingCategory;
  option: number;
  currency: BillingCurrency;
  period: BillingPeriod;
}

export interface ParseBillingSubscriptionPlanDataResultFailure {
  ok: false;
  resultCode: BillingResultCode;
}

export interface ParseBillingSubscriptionPlanDataResultSuccess {
  ok: true;
  billingSubscriptionPlanData: BillingSubscriptionPlanData;
  billingSubscriptionPlanSource: BillingSubscriptionPlanSource | null;
}

export type ParseBillingSubscriptionPlanDataResult = ParseBillingSubscriptionPlanDataResultFailure | ParseBillingSubscriptionPlanDataResultSuccess;

export async function parseBillingSubscriptionPlanData(options: ParseBillingSubscriptionPlanDataOptions): Promise<ParseBillingSubscriptionPlanDataResult> {
  const { context, billingOrganizationId, type, category, option, currency, period } = options;
  const { manager } = context;
  const billingSubscriptionPlanSource = await manager.getRepository(BillingSubscriptionPlanSource).findOne({
    where: {
      billingOrganizationId,
      type,
      category,
      option,
      currency,
      period,
    },
  });

  if (billingSubscriptionPlanSource) {
    return {
      ok: true,
      billingSubscriptionPlanData: {
        type: billingSubscriptionPlanSource.type,
        category: billingSubscriptionPlanSource.category,
        option: billingSubscriptionPlanSource.option,
        currency: billingSubscriptionPlanSource.currency,
        period: billingSubscriptionPlanSource.period,
        originPrice: billingSubscriptionPlanSource.originPrice,
      },
      billingSubscriptionPlanSource,
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

  const originPrice = _.get(billingSubscriptionPlanPrice, period) as number | undefined;
  if (originPrice === undefined) {
    return {
      ok: false,
      resultCode: resultCode('subscription-plan-period-not-found'),
    };
  }

  return {
    ok: true,
    billingSubscriptionPlanData: {
      type,
      category,
      option,
      currency,
      period,
      originPrice,
    },
    billingSubscriptionPlanSource: null,
  };
}
