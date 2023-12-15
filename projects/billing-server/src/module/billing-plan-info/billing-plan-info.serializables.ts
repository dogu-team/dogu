import { BillingResult } from '@dogu-private/console';
import { v4 } from 'uuid';
import { BillingPlanInfo } from '../../db/entity/billing-plan-info.entity';
import { BillingPlanSource } from '../../db/entity/billing-plan-source.entity';
import { RetryTransactionContext } from '../../db/utils';
import { UseCouponResult } from '../billing-coupon/billing-coupon.serializables';

export interface NewAndApplyPlanInfoOptions {
  billingOrganizationId: string;
  planInfos: BillingPlanInfo[];
  planSource: BillingPlanSource;
  discountedAmount: number;
  useCouponResult: UseCouponResult;
}

export type NewAndApplyPlanInfoResult = BillingResult<BillingPlanInfo>;

export function newAndApplyPlanInfo(context: RetryTransactionContext, options: NewAndApplyPlanInfoOptions): NewAndApplyPlanInfoResult {
  const { manager } = context;
  const { billingOrganizationId, planInfos, planSource, discountedAmount, useCouponResult } = options;
  const { currency, period, type, category, option, originPrice, billingPlanSourceId } = planSource;
  const { billingCouponId, couponRemainingApplyCount, couponApplied, coupon } = useCouponResult;

  const found = planInfos.find((info) => info.type === type);
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
    found.billingPlanSourceId = billingPlanSourceId;
    found.state = 'subscribed';
    found.billingCoupon = coupon ? coupon : found.billingCoupon;
    return {
      ok: true,
      value: found,
    };
  }

  const planInfo = manager.getRepository(BillingPlanInfo).create({
    billingPlanInfoId: v4(),
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
    billingPlanSourceId,
    state: 'subscribed',
    billingCoupon: coupon ? coupon : undefined,
  });
  planInfos.push(planInfo);
  return {
    ok: true,
    value: planInfo,
  };
}
