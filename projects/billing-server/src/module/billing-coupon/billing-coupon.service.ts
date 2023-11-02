import {
  BillingCouponProp,
  BillingOrganizationProp,
  BillingOrganizationUsedBillingCouponProp,
  GetAvailableBillingCouponsDto,
  ValidateBillingCouponDto,
  ValidateBillingCouponResponse,
} from '@dogu-private/console';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { BillingCoupon } from '../../db/entity/billing-coupon.entity';
import { BillingOrganizationUsedBillingCoupon } from '../../db/entity/billing-organization-used-billing-coupon.entity';
import { BillingOrganization } from '../../db/entity/billing-organization.entity';
import { retrySerialize } from '../../db/utils';
import { DoguLogger } from '../logger/logger';

@Injectable()
export class BillingCouponService {
  constructor(
    private readonly logger: DoguLogger,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async validateBillingCoupon(dto: ValidateBillingCouponDto): Promise<ValidateBillingCouponResponse> {
    return await retrySerialize(this.logger, this.dataSource, async (manager) => {
      return await BillingCouponService.validateBillingCoupon(manager, dto);
    });
  }

  async getAvailableBillingCoupons(dto: GetAvailableBillingCouponsDto): Promise<BillingCoupon[]> {
    const { organizationId, type } = dto;
    const billingCoupons = await this.dataSource.manager
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
      .andWhere(`${BillingCoupon.name}.${BillingCouponProp.type} = :type`, { type })
      .getMany();
    return billingCoupons;
  }

  static async validateBillingCoupon(manager: EntityManager, dto: ValidateBillingCouponDto): Promise<ValidateBillingCouponResponse> {
    const { organizationId, code } = dto;
    const billingCoupon = await manager.getRepository(BillingCoupon).findOne({ where: { code } });
    if (!billingCoupon) {
      return { ok: false, reason: 'coupon-not-found', coupon: null };
    }

    if (billingCoupon.expiredAt && billingCoupon.expiredAt < new Date()) {
      return { ok: false, reason: 'coupon-expired', coupon: null };
    }

    if (billingCoupon.remainingAvailableCount !== null && billingCoupon.remainingAvailableCount <= 0) {
      return { ok: false, reason: 'coupon-all-used', coupon: null };
    }

    if (billingCoupon.monthlyDiscountPercent !== null && (0 > billingCoupon.monthlyDiscountPercent || billingCoupon.monthlyDiscountPercent > 100)) {
      return { ok: false, reason: 'coupon-invalid-monthly-discount-percent', coupon: null };
    }

    if (billingCoupon.monthlyDiscountPercent !== null && billingCoupon.monthlyApplyCount === 0) {
      return { ok: false, reason: 'coupon-invalid-monthly-apply-count', coupon: null };
    }

    if (billingCoupon.yearlyDiscountPercent !== null && (0 > billingCoupon.yearlyDiscountPercent || billingCoupon.yearlyDiscountPercent > 100)) {
      return { ok: false, reason: 'coupon-invalid-yearly-discount-percent', coupon: null };
    }

    if (billingCoupon.yearlyDiscountPercent !== null && billingCoupon.yearlyApplyCount === 0) {
      return { ok: false, reason: 'coupon-invalid-yearly-apply-count', coupon: null };
    }

    const billingOrganization = await manager.getRepository(BillingOrganization).findOne({ where: { organizationId } });
    if (!billingOrganization) {
      return { ok: true, reason: 'organization-not-found', coupon: null };
    }

    const billingOrganizationUsedBillingCoupon = await manager.getRepository(BillingOrganizationUsedBillingCoupon).findOne({
      where: { billingCouponId: billingCoupon.billingCouponId, billingOrganizationId: billingOrganization.billingOrganizationId },
    });
    if (billingOrganizationUsedBillingCoupon) {
      return { ok: false, reason: 'coupon-already-used', coupon: null };
    }

    return { ok: true, reason: 'coupon-not-used', coupon: billingCoupon };
  }
}
