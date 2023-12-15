import {
  BillingPromotionCouponResponse,
  CreateBillingCouponDto,
  GetAvailableBillingCouponsDto,
  resultCode,
  ValidateBillingCouponDto,
  ValidateBillingCouponResponse,
} from '@dogu-private/console';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BillingCoupon } from '../../db/entity/billing-coupon.entity';
import { RetryTransaction } from '../../db/utils';
import { DateTimeSimulatorService } from '../date-time-simulator/date-time-simulator.service';
import { DoguLogger } from '../logger/logger';
import { createBillingCoupon, getAvailableCoupons, validateCoupon } from './billing-coupon.serializables';

@Injectable()
export class BillingCouponService {
  private readonly retryTransaction: RetryTransaction;

  constructor(
    private readonly logger: DoguLogger,
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly dateTimeSimulatorService: DateTimeSimulatorService,
  ) {
    this.retryTransaction = new RetryTransaction(this.logger, this.dataSource);
  }

  async validateCoupon(dto: ValidateBillingCouponDto): Promise<ValidateBillingCouponResponse> {
    return await this.retryTransaction.serializable(async (context) => {
      const now = this.dateTimeSimulatorService.now();
      const result = await validateCoupon(context, {
        ...dto,
        now,
      });
      if (!result.ok) {
        return {
          ok: false,
          resultCode: result.resultCode,
          coupon: null,
        };
      }

      return {
        ok: true,
        resultCode: resultCode('ok'),
        coupon: result.value,
      };
    });
  }

  async getAvailableCoupons(dto: GetAvailableBillingCouponsDto): Promise<BillingPromotionCouponResponse[]> {
    return await this.retryTransaction.serializable(async (context) => {
      const now = this.dateTimeSimulatorService.now();
      return await getAvailableCoupons(context, {
        ...dto,
        now,
      });
    });
  }

  async createBillingCoupon(dto: CreateBillingCouponDto): Promise<BillingCoupon> {
    return await this.retryTransaction.serializable(async (context) => {
      return await createBillingCoupon(context, dto);
    });
  }

  async findByCouponCode(couponCode: string): Promise<BillingCoupon | null> {
    return await this.dataSource.getRepository(BillingCoupon).findOne({
      where: {
        code: couponCode,
      },
    });
  }
}
