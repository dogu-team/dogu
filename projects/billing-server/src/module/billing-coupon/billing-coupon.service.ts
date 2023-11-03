import { CreateBillingCouponDto, GetAvailableBillingCouponsDto, ValidateBillingCouponDto } from '@dogu-private/console';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BillingCoupon } from '../../db/entity/billing-coupon.entity';
import { retrySerialize } from '../../db/utils';
import { DoguLogger } from '../logger/logger';
import { createBillingCoupon, getAvailableCoupons, ValidateBillingCouponResponse, validateCoupon } from './billing-coupon.serializables';

@Injectable()
export class BillingCouponService {
  constructor(
    private readonly logger: DoguLogger,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async validateCoupon(dto: ValidateBillingCouponDto): Promise<ValidateBillingCouponResponse> {
    return await retrySerialize(this.logger, this.dataSource, async (context) => {
      return await validateCoupon(context, dto);
    });
  }

  async getAvailableCoupons(dto: GetAvailableBillingCouponsDto): Promise<BillingCoupon[]> {
    return await retrySerialize(this.logger, this.dataSource, async (context) => {
      return await getAvailableCoupons(context, dto);
    });
  }

  async createBillingCoupon(dto: CreateBillingCouponDto): Promise<BillingCoupon> {
    return await retrySerialize(this.logger, this.dataSource, async (context) => {
      return await createBillingCoupon(context, dto);
    });
  }
}
