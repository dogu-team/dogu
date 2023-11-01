import {
  BillingCouponPropCamel,
  BillingOrganizationAndBillingCouponPropCamel,
  BillingOrganizationPropCamel,
  GetAvailableBillingCouponsDto,
  ValidateBillingCouponDto,
  ValidateBillingCouponResponse,
} from '@dogu-private/console';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BillingCoupon } from '../../db/entity/billing-coupon.entity';
import { BillingOrganizationAndBillingCoupon } from '../../db/entity/billing-organization-and-billing-coupon.entity';
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
      const { organizationId, billingCouponCode } = dto;
      const billingCoupon = await manager.getRepository(BillingCoupon).findOne({ where: { code: billingCouponCode } });
      if (!billingCoupon) {
        return { ok: false, reason: 'coupon-not-found' };
      }

      if (billingCoupon.expiredAt && billingCoupon.expiredAt < new Date()) {
        return { ok: false, reason: 'expired' };
      }

      const billingOrganization = await manager.getRepository(BillingOrganization).findOne({ where: { organizationId } });
      if (!billingOrganization) {
        return { ok: true, reason: 'organization-not-found' };
      }

      const billingOrganizationAndBillingCoupon = await manager.getRepository(BillingOrganizationAndBillingCoupon).findOne({
        where: { billingCouponId: billingCoupon.billingCouponId, billingOrganizationId: billingOrganization.billingOrganizationId },
      });
      if (billingOrganizationAndBillingCoupon) {
        return { ok: false, reason: 'already-used' };
      }

      return { ok: true, reason: 'not-used' };
    });
  }

  async getAvailableBillingCoupons(dto: GetAvailableBillingCouponsDto): Promise<BillingCoupon[]> {
    const { organizationId } = dto;
    const billingCoupons = await this.dataSource.manager
      .getRepository(BillingCoupon)
      .createQueryBuilder(BillingCoupon.name)
      .where((qb) => {
        const subQuery = qb
          .subQuery()
          .select(`${BillingOrganizationAndBillingCoupon.name}.${BillingOrganizationAndBillingCouponPropCamel.billingCouponId}`)
          .from(BillingOrganizationAndBillingCoupon, BillingOrganizationAndBillingCoupon.name)
          .innerJoin(
            BillingOrganization,
            BillingOrganization.name,
            `${BillingOrganization.name}.${BillingOrganizationPropCamel.billingOrganizationId} = ${BillingOrganizationAndBillingCoupon.name}.${BillingOrganizationAndBillingCouponPropCamel.billingOrganizationId}`,
          )
          .where(`${BillingOrganization.name}.${BillingOrganizationPropCamel.organizationId} = :organizationId`, { organizationId })
          .getQuery();
        return `${BillingCoupon.name}.${BillingCouponPropCamel.billingCouponId} NOT IN ${subQuery}`;
      })
      .getMany();
    return billingCoupons;
  }
}
