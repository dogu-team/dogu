import {
  BillingCouponProp,
  BillingOrganizationProp,
  BillingOrganizationUsedBillingCouponProp,
  BillingPlanType,
  BillingPromotionCouponResponse,
  BillingResult,
  CreateBillingCouponDto,
  GetAvailableBillingCouponsDto,
  resultCode,
  ValidateBillingCouponDto,
} from '@dogu-private/console';
import { assertUnreachable } from '@dogu-tech/common';
import { ConflictException } from '@nestjs/common';
import { Brackets, IsNull, MoreThan, Not } from 'typeorm';
import { v4 } from 'uuid';

import { BillingCoupon } from '../../db/entity/billing-coupon.entity';
import { BillingOrganizationUsedBillingCoupon } from '../../db/entity/billing-organization-used-billing-coupon.entity';
import { BillingOrganization } from '../../db/entity/billing-organization.entity';
import { BillingPlanSource } from '../../db/entity/billing-plan-source.entity';
import { RetryTransactionContext } from '../../db/retry-transaction';
import { registerUsedCoupon } from '../billing-organization/billing-organization.serializables';
import { findCloudLicense } from '../cloud-license/cloud-license.serializables';
import { ResolveCouponResultSuccess } from './billing-coupon.utils';

export interface ValidateCouponOptions extends ValidateBillingCouponDto {
  now: Date;
}

export type ValidateCouponResult = BillingResult<BillingCoupon>;

export async function validateCoupon(context: RetryTransactionContext, options: ValidateCouponOptions): Promise<ValidateCouponResult> {
  const { manager } = context;
  const { organizationId, code, period, planType, now } = options;
  const billingCoupon = await manager.getRepository(BillingCoupon).findOne({ where: { code } });
  if (!billingCoupon) {
    return {
      ok: false,
      resultCode: resultCode('coupon-not-found'),
    };
  }

  if (billingCoupon.period !== period) {
    return {
      ok: false,
      resultCode: resultCode('coupon-period-not-matched'),
    };
  }

  if (billingCoupon.planType !== null && billingCoupon.planType !== planType) {
    return {
      ok: false,
      resultCode: resultCode('coupon-plan-type-not-matched'),
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

  if (billingCoupon.discountPercent < 0 || billingCoupon.discountPercent > 100) {
    return {
      ok: false,
      resultCode: resultCode('coupon-invalid-discount-percent'),
    };
  }

  if (billingCoupon.applyCount !== null && billingCoupon.applyCount <= 0) {
    return {
      ok: false,
      resultCode: resultCode('coupon-invalid-apply-count'),
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

export interface GetAvailableBillingCouponsOptions extends GetAvailableBillingCouponsDto {
  now: Date;
}

export async function getAvailableCoupons(context: RetryTransactionContext, options: GetAvailableBillingCouponsOptions): Promise<BillingPromotionCouponResponse[]> {
  const { manager } = context;
  const { organizationId, type, planType, category, now } = options;

  if (type === 'promotion') {
    if (category === 'cloud') {
      const cloudLicense = await findCloudLicense(context, { organizationId });

      if (!cloudLicense) {
        return [];
      }

      if (planType) {
        const usingPlan = cloudLicense.billingOrganization?.billingPlanInfos?.find((info) => info.type === planType && info.state !== 'unsubscribed');
        if (usingPlan) {
          return [];
        }
      }
    } else {
      return [];
    }
  }

  const availableCoupons = await manager
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
    .andWhere(new Brackets((qb) => qb.where({ expiredAt: IsNull() }).orWhere({ expiredAt: MoreThan(now) })))
    .andWhere(planType ? { planType } : '1=1')
    .getMany();

  return availableCoupons.map((coupon) => ({
    code: coupon.code,
    type: coupon.type,
    period: coupon.period,
    discountPercent: coupon.discountPercent,
    applyCount: coupon.applyCount,
    planType: coupon.planType,
    createdAt: coupon.createdAt,
    expiredAt: coupon.expiredAt,
  }));
}

export interface FindAvailablePromotionCouponOptions {
  billingOrganizationId: string;
  planType: BillingPlanType;
  now: Date;
}

export async function findAvailablePromotionCoupon(context: RetryTransactionContext, options: FindAvailablePromotionCouponOptions): Promise<BillingCoupon | null> {
  const { manager } = context;
  const { billingOrganizationId, planType, now } = options;
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
    .andWhere({ type: 'promotion', planType })
    .andWhere(new Brackets((qb) => qb.where({ expiredAt: IsNull() }).orWhere({ expiredAt: MoreThan(now) })))
    .andWhere(new Brackets((qb) => qb.where({ remainingAvailableCount: IsNull() }).orWhere({ remainingAvailableCount: Not(0) })))
    .getOne();

  return coupon;
}

export async function createBillingCoupon(context: RetryTransactionContext, dto: CreateBillingCouponDto): Promise<BillingCoupon> {
  const { manager } = context;
  const { code, type, discountPercent, applyCount, remainingAvailableCount, planType, period } = dto;

  const exsitCoupon = await manager.getRepository(BillingCoupon).findOne({ where: { code } });
  if (exsitCoupon) {
    throw new ConflictException('Coupon already exist');
  }

  const coupon = manager.getRepository(BillingCoupon).create({
    billingCouponId: v4(),
    code,
    type,
    period,
    discountPercent,
    applyCount: applyCount ?? null,
    remainingAvailableCount: remainingAvailableCount ?? null,
    planType: planType ?? null,
    expiredAt: null,
  });
  return await manager.getRepository(BillingCoupon).save(coupon);
}

export interface ParseCouponOptions {
  couponCode: string | undefined;
  organization: BillingOrganization;
  planSource: BillingPlanSource;
  now: Date;
}

export type ParseCouponResult = BillingResult<BillingCoupon | null>;

export async function parseCoupon(context: RetryTransactionContext, options: ParseCouponOptions): Promise<ParseCouponResult> {
  const { couponCode, planSource, now, organization } = options;
  const { billingOrganizationId, organizationId } = organization;
  if (couponCode === undefined) {
    const subscribed = organization.billingPlanInfos?.find((plan) => plan.type === planSource.type && plan.state !== 'unsubscribed');
    if (!subscribed) {
      const promotionCoupon = await findAvailablePromotionCoupon(context, {
        billingOrganizationId,
        planType: planSource.type,
        now,
      });
      if (promotionCoupon) {
        const promotionResult = await validateCoupon(context, {
          organizationId,
          code: promotionCoupon.code,
          period: planSource.period,
          planType: planSource.type,
          now,
        });
        if (promotionResult.ok) {
          return {
            ok: true,
            value: promotionCoupon,
          };
        }
      }
    }

    return {
      ok: true,
      value: null,
    };
  }

  const validateResult = await validateCoupon(context, {
    organizationId,
    code: couponCode,
    period: planSource.period,
    planType: planSource.type,
    now,
  });

  return validateResult;
}

export interface UseCouponOptions {
  couponResult: ResolveCouponResultSuccess;
  billingOrganizationId: string;
}

export interface UseCouponResult {
  billingCouponId: string | null;
  couponRemainingApplyCount: number | null;
  couponApplied: boolean;
  coupon: BillingCoupon | null;
}

export async function useCoupon(context: RetryTransactionContext, options: UseCouponOptions): Promise<UseCouponResult> {
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
        coupon,
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
        coupon,
      };
    }
    case 'none':
      return {
        billingCouponId: null,
        couponRemainingApplyCount: null,
        couponApplied: false,
        coupon: null,
      };
    default: {
      assertUnreachable(type);
    }
  }
}
