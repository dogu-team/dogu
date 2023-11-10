import {
  BillingCouponProp,
  BillingOrganizationProp,
  BillingOrganizationUsedBillingCouponProp,
  BillingPeriod,
  BillingResult,
  BillingSubscriptionPlanType,
  CreateBillingCouponDto,
  GetAvailableBillingCouponsDto,
  resultCode,
  ValidateBillingCouponDto,
} from '@dogu-private/console';
import { assertUnreachable } from '@dogu-tech/common';
import { ConflictException } from '@nestjs/common';
import { Brackets, FindOptionsWhere, IsNull, Not } from 'typeorm';
import { v4 } from 'uuid';
import { BillingCoupon } from '../../db/entity/billing-coupon.entity';
import { BillingOrganizationUsedBillingCoupon } from '../../db/entity/billing-organization-used-billing-coupon.entity';
import { BillingOrganization } from '../../db/entity/billing-organization.entity';
import { RetrySerializeContext } from '../../db/utils';
import { registerUsedCoupon } from '../billing-organization/billing-organization.serializables';
import { ResolveCouponResultSuccess } from './billing-coupon.utils';

export interface ValidateCouponOptions extends ValidateBillingCouponDto {
  now: Date;
}

export type ValidateCouponResult = BillingResult<BillingCoupon>;

export async function validateCoupon(context: RetrySerializeContext, options: ValidateCouponOptions): Promise<ValidateCouponResult> {
  const { manager } = context;
  const { organizationId, code, period, subscriptionPlanType, now } = options;
  const findWhereOption: FindOptionsWhere<BillingCoupon> =
    period === 'monthly'
      ? {
          code,
          monthlyApplyCount: Not(IsNull()),
          monthlyDiscountPercent: Not(IsNull()),
        }
      : {
          code,
          yearlyApplyCount: Not(IsNull()),
          yearlyDiscountPercent: Not(IsNull()),
        };
  const billingCoupon = await manager.getRepository(BillingCoupon).findOne({ where: findWhereOption });

  if (!billingCoupon) {
    return {
      ok: false,
      resultCode: resultCode('coupon-not-found'),
    };
  }

  if (billingCoupon.subscriptionPlanType !== null && billingCoupon.subscriptionPlanType !== subscriptionPlanType) {
    return {
      ok: false,
      resultCode: resultCode('coupon-subscription-plan-type-not-matched'),
    };
  }

  if (billingCoupon.expiredAt && billingCoupon.expiredAt < now) {
    return {
      ok: false,
      resultCode: resultCode('coupon-expired'),
    };
  }

  if (billingCoupon.remainingAvailableCount !== null && billingCoupon.remainingAvailableCount <= 0) {
    return {
      ok: false,
      resultCode: resultCode('coupon-all-used'),
    };
  }

  if (billingCoupon.monthlyDiscountPercent !== null && (0 > billingCoupon.monthlyDiscountPercent || billingCoupon.monthlyDiscountPercent > 100)) {
    return {
      ok: false,
      resultCode: resultCode('coupon-invalid-monthly-discount-percent'),
    };
  }

  if (billingCoupon.monthlyDiscountPercent !== null && billingCoupon.monthlyApplyCount === 0) {
    return {
      ok: false,
      resultCode: resultCode('coupon-invalid-monthly-apply-count'),
    };
  }

  if (billingCoupon.yearlyDiscountPercent !== null && (0 > billingCoupon.yearlyDiscountPercent || billingCoupon.yearlyDiscountPercent > 100)) {
    return {
      ok: false,
      resultCode: resultCode('coupon-invalid-yearly-discount-percent'),
    };
  }

  if (billingCoupon.yearlyDiscountPercent !== null && billingCoupon.yearlyApplyCount === 0) {
    return {
      ok: false,
      resultCode: resultCode('coupon-invalid-yearly-apply-count'),
    };
  }

  const billingOrganization = await manager.getRepository(BillingOrganization).findOne({ where: { organizationId } });
  if (!billingOrganization) {
    return {
      ok: false,
      resultCode: resultCode('organization-not-found'),
    };
  }

  const billingOrganizationUsedBillingCoupon = await manager.getRepository(BillingOrganizationUsedBillingCoupon).findOne({
    where: {
      billingCouponId: billingCoupon.billingCouponId,
      billingOrganizationId: billingOrganization.billingOrganizationId,
    },
  });

  if (billingOrganizationUsedBillingCoupon) {
    return {
      ok: false,
      resultCode: resultCode('coupon-already-used'),
    };
  }

  return {
    ok: true,
    value: billingCoupon,
  };
}

export async function getAvailableCoupons(context: RetrySerializeContext, dto: GetAvailableBillingCouponsDto): Promise<BillingCoupon[]> {
  const { manager } = context;
  const { organizationId, type } = dto;
  return await manager
    .getRepository(BillingCoupon)
    .createQueryBuilder(BillingCoupon.name)
    .where((qb) => {
      const subQuery = qb
        .subQuery()
        .select(`${BillingOrganizationUsedBillingCoupon.name}.${BillingOrganizationUsedBillingCouponProp.billingCouponId}`)
        .from(BillingOrganizationUsedBillingCoupon, BillingOrganizationUsedBillingCoupon.name)
        .innerJoin(
          BillingOrganization,
          BillingOrganization.name,
          `${BillingOrganization.name}.${BillingOrganizationProp.billingOrganizationId} = ${BillingOrganizationUsedBillingCoupon.name}.${BillingOrganizationUsedBillingCouponProp.billingOrganizationId}`,
        )
        .where(`${BillingOrganization.name}.${BillingOrganizationProp.organizationId} = :organizationId`, { organizationId })
        .getQuery();
      return `${BillingCoupon.name}.${BillingCouponProp.billingCouponId} NOT IN ${subQuery}`;
    })
    .andWhere({ type })
    .getMany();
}

export interface FindAvailablePromotionCouponOptions {
  billingOrganizationId: string;
  subscriptionPlanType: BillingSubscriptionPlanType;
}

export async function findAvailablePromotionCoupon(context: RetrySerializeContext, options: FindAvailablePromotionCouponOptions): Promise<BillingCoupon | null> {
  const { manager } = context;
  const { billingOrganizationId, subscriptionPlanType } = options;
  const coupon = await manager
    .getRepository(BillingCoupon)
    .createQueryBuilder(BillingCoupon.name)
    .where((qb) => {
      const subQuery = qb
        .subQuery()
        .select(`${BillingOrganizationUsedBillingCoupon.name}.${BillingOrganizationUsedBillingCouponProp.billingCouponId}`)
        .from(BillingOrganizationUsedBillingCoupon, BillingOrganizationUsedBillingCoupon.name)
        .innerJoin(
          BillingOrganization,
          BillingOrganization.name,
          `${BillingOrganization.name}.${BillingOrganizationProp.billingOrganizationId} = ${BillingOrganizationUsedBillingCoupon.name}.${BillingOrganizationUsedBillingCouponProp.billingOrganizationId}`,
        )
        .where(`${BillingOrganization.name}.${BillingOrganizationProp.billingOrganizationId} = :billingOrganizationId`, { billingOrganizationId })
        .getQuery();
      return `${BillingCoupon.name}.${BillingCouponProp.billingCouponId} NOT IN ${subQuery}`;
    })
    .andWhere({ type: 'promotion', subscriptionPlanType, expiredAt: IsNull() })
    .andWhere(new Brackets((qb) => qb.where({ remainingAvailableCount: IsNull() }).orWhere({ remainingAvailableCount: Not(0) })))
    .getOne();
  return coupon;
}

export async function createBillingCoupon(context: RetrySerializeContext, dto: CreateBillingCouponDto): Promise<BillingCoupon> {
  const { manager } = context;
  const { code, type, monthlyApplyCount, monthlyDiscountPercent, yearlyApplyCount, yearlyDiscountPercent, remainingAvailableCount, subscriptionPlanType } = dto;

  const exsitCoupon = await manager.getRepository(BillingCoupon).findOne({ where: { code } });

  if (exsitCoupon) {
    throw new ConflictException('Coupon already exist');
  }

  const coupon = manager.getRepository(BillingCoupon).create({
    billingCouponId: v4(),
    code,
    type,
    monthlyDiscountPercent: monthlyDiscountPercent ?? null,
    monthlyApplyCount: monthlyApplyCount ?? null,
    yearlyDiscountPercent: yearlyDiscountPercent ?? null,
    yearlyApplyCount: yearlyApplyCount ?? null,
    remainingAvailableCount: remainingAvailableCount ?? null,
    subscriptionPlanType: subscriptionPlanType ?? null,
    expiredAt: null,
  });
  return await manager.getRepository(BillingCoupon).save(coupon);
}

export interface ParseCouponOptions {
  context: RetrySerializeContext;
  organizationId: string;
  couponCode: string | undefined;
  period: BillingPeriod;
  subscriptionPlanType: BillingSubscriptionPlanType;
  now: Date;
}

export type ParseCouponResult = BillingResult<BillingCoupon | null>;

export async function parseCoupon(options: ParseCouponOptions): Promise<ParseCouponResult> {
  const { context, organizationId, couponCode, period, subscriptionPlanType, now } = options;
  if (couponCode === undefined) {
    return {
      ok: true,
      value: null,
    };
  }

  const validateResult = await validateCoupon(context, { organizationId, code: couponCode, period, subscriptionPlanType, now });
  if (!validateResult.ok) {
    return {
      ok: false,
      resultCode: validateResult.resultCode,
    };
  }

  return {
    ok: true,
    value: validateResult.value,
  };
}

export interface UseCouponOptions {
  couponResult: ResolveCouponResultSuccess;
  billingOrganizationId: string;
}

export interface UseCouponResult {
  billingCouponId: string | null;
  couponRemainingApplyCount: number | null;
  couponApplied: boolean;
}

export async function useCoupon(context: RetrySerializeContext, options: UseCouponOptions): Promise<UseCouponResult> {
  const { manager } = context;
  const { couponResult, billingOrganizationId } = options;
  const { coupon, type } = couponResult;
  switch (type) {
    case 'new': {
      if (coupon.remainingAvailableCount && coupon.remainingAvailableCount > 0) {
        coupon.remainingAvailableCount -= 1;
      }

      await manager.getRepository(BillingCoupon).save(coupon);

      await registerUsedCoupon(context, {
        billingOrganizationId,
        billingCouponId: coupon.billingCouponId,
      });

      let couponApplied = false;
      if (couponResult.couponRemainingApplyCount === null) {
        couponApplied = true;
      } else if (couponResult.couponRemainingApplyCount > 0) {
        couponApplied = true;
      }

      let couponRemainingApplyCount: number | null = null;
      if (couponResult.couponRemainingApplyCount !== null) {
        const count = couponResult.couponRemainingApplyCount - 1;
        couponRemainingApplyCount = count > 0 ? count : 0;
      }

      return {
        billingCouponId: coupon.billingCouponId,
        couponRemainingApplyCount,
        couponApplied,
      };
    }
    case 'old': {
      let couponApplied = false;
      if (couponResult.couponRemainingApplyCount === null) {
        couponApplied = true;
      } else if (couponResult.couponRemainingApplyCount > 0) {
        couponApplied = true;
      }

      let couponRemainingApplyCount = couponResult.couponRemainingApplyCount;
      if (couponResult.couponRemainingApplyCount !== null) {
        const count = couponResult.couponRemainingApplyCount - 1;
        couponRemainingApplyCount = count > 0 ? count : 0;
      }

      return {
        billingCouponId: coupon.billingCouponId,
        couponRemainingApplyCount,
        couponApplied,
      };
    }
    case 'none':
      return {
        billingCouponId: null,
        couponRemainingApplyCount: null,
        couponApplied: false,
      };
      break;
    default: {
      assertUnreachable(type);
    }
  }
}
