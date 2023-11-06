import {
  BillingCouponProp,
  BillingOrganizationProp,
  BillingOrganizationUsedBillingCouponProp,
  BillingResultCode,
  CreateBillingCouponDto,
  GetAvailableBillingCouponsDto,
  resultCode,
  ValidateBillingCouponDto,
} from '@dogu-private/console';
import { FindOptionsWhere, IsNull, Not } from 'typeorm';
import { v4 } from 'uuid';
import { BillingCoupon } from '../../db/entity/billing-coupon.entity';
import { BillingOrganizationUsedBillingCoupon } from '../../db/entity/billing-organization-used-billing-coupon.entity';
import { BillingOrganization } from '../../db/entity/billing-organization.entity';
import { RetrySerializeContext } from '../../db/utils';

export interface ValidateBillingCouponResponseFailure {
  ok: false;
  resultCode: BillingResultCode;
}

export interface ValidateBillingCouponResponseSuccess {
  ok: true;
  resultCode: BillingResultCode;
  coupon: BillingCoupon;
}

export type ValidateBillingCouponResponse = ValidateBillingCouponResponseFailure | ValidateBillingCouponResponseSuccess;

export async function validateCoupon(context: RetrySerializeContext, dto: ValidateBillingCouponDto): Promise<ValidateBillingCouponResponse> {
  const { manager } = context;
  const { organizationId, code } = dto;
  const findWhereOption: FindOptionsWhere<BillingCoupon> =
    dto.period === 'monthly'
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

  if (billingCoupon.expiredAt && billingCoupon.expiredAt < new Date()) {
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
    resultCode: resultCode('ok'),
    coupon: billingCoupon,
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

export async function createBillingCoupon(context: RetrySerializeContext, dto: CreateBillingCouponDto): Promise<BillingCoupon> {
  const { manager } = context;
  const { code, type, monthlyApplyCount, monthlyDiscountPercent, yearlyApplyCount, yearlyDiscountPercent, remainingAvailableCount } = dto;
  const coupon = manager.getRepository(BillingCoupon).create({
    billingCouponId: v4(),
    code,
    type,
    monthlyDiscountPercent: monthlyDiscountPercent ?? null,
    monthlyApplyCount: monthlyApplyCount ?? null,
    yearlyDiscountPercent: yearlyDiscountPercent ?? null,
    yearlyApplyCount: yearlyApplyCount ?? null,
    remainingAvailableCount,
    expiredAt: null,
  });
  return await manager.getRepository(BillingCoupon).save(coupon);
}
