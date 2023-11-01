import { ValidateBillingCouponByOrganizationIdDto, ValidateBillingCouponByOrganizationIdResponse } from '@dogu-private/console';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BillingCoupon } from '../../db/entity/billing-coupon.entity';
import { BillingInfoAndBillingCoupon } from '../../db/entity/billing-info-and-billing-coupon.entity';
import { BillingInfo } from '../../db/entity/billing-info.entity';
import { retrySerialize } from '../../db/utils';
import { DoguLogger } from '../logger/logger';

@Injectable()
export class BillingCouponService {
  constructor(
    private readonly logger: DoguLogger,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async validateBillingCouponByOrganizationId(dto: ValidateBillingCouponByOrganizationIdDto): Promise<ValidateBillingCouponByOrganizationIdResponse> {
    return await retrySerialize(this.logger, this.dataSource, async (manager) => {
      const { organizationId, billingCouponCode } = dto;
      const billingCoupon = await manager.getRepository(BillingCoupon).findOne({ where: { code: billingCouponCode } });
      if (!billingCoupon) {
        return { ok: false, reason: 'coupon-not-found' };
      }

      if (billingCoupon.expiredAt && billingCoupon.expiredAt < new Date()) {
        return { ok: false, reason: 'expired' };
      }

      const billingInfo = await manager.getRepository(BillingInfo).findOne({ where: { organizationId } });
      if (!billingInfo) {
        return { ok: true, reason: 'organization-not-found' };
      }

      const billingInfoAndBillingCoupon = await manager.getRepository(BillingInfoAndBillingCoupon).findOne({
        where: { billingCouponId: billingCoupon.billingCouponId, billingInfoId: billingInfo.billingInfoId },
      });
      if (billingInfoAndBillingCoupon) {
        return { ok: false, reason: 'already-used' };
      }

      return { ok: true, reason: 'not-used' };
    });
  }
}
