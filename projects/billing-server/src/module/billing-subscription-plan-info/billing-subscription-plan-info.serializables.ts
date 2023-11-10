import { BillingResult, BillingSubscriptionPlanData } from '@dogu-private/console';
import { v4 } from 'uuid';
import { BillingSubscriptionPlanInfo } from '../../db/entity/billing-subscription-plan-info.entity';
import { RetrySerializeContext } from '../../db/utils';
import { UseCouponResult } from '../billing-coupon/billing-coupon.serializables';

export interface NewAndApplySubscriptionPlanInfoOptions {
  billingOrganizationId: string;
  subscriptionPlanInfos: BillingSubscriptionPlanInfo[];
  planData: BillingSubscriptionPlanData;
  discountedAmount: number;
  useCouponResult: UseCouponResult;
  billingSubscriptionPlanSourceId: string | null;
}

export type NewAndApplySubscriptionPlanInfoResult = BillingResult<BillingSubscriptionPlanInfo>;

export function newAndApplySubscriptionPlanInfo(context: RetrySerializeContext, options: NewAndApplySubscriptionPlanInfoOptions): NewAndApplySubscriptionPlanInfoResult {
  const { manager } = context;
  const { billingOrganizationId, subscriptionPlanInfos, planData, discountedAmount, billingSubscriptionPlanSourceId, useCouponResult } = options;
  const { currency, period, type, category, option, originPrice } = planData;
  const { billingCouponId, couponRemainingApplyCount, couponApplied, coupon } = useCouponResult;

  const found = subscriptionPlanInfos.find((info) => info.type === type);
  if (found) {
    found.category = category;
    found.option = option;
    found.currency = currency;
    found.period = period;
    found.originPrice = originPrice;
    found.discountedAmount = discountedAmount;
    found.billingCouponId = billingCouponId;
    found.couponRemainingApplyCount = couponRemainingApplyCount;
    found.couponApplied = couponApplied;
    found.billingSubscriptionPlanSourceId = billingSubscriptionPlanSourceId;
    found.state = 'subscribed';
    found.billingCoupon = coupon ? coupon : found.billingCoupon;
    return {
      ok: true,
      value: found,
    };
  }

  const planInfo = manager.getRepository(BillingSubscriptionPlanInfo).create({
    billingSubscriptionPlanInfoId: v4(),
    billingOrganizationId,
    category,
    type,
    option,
    currency,
    period,
    originPrice,
    discountedAmount,
    billingCouponId,
    couponRemainingApplyCount,
    couponApplied,
    billingSubscriptionPlanSourceId,
    state: 'subscribed',
    billingCoupon: coupon ? coupon : undefined,
  });
  subscriptionPlanInfos.push(planInfo);
  return {
    ok: true,
    value: planInfo,
  };
}
