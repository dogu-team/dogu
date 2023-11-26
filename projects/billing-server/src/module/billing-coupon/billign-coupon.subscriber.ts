import { unwrap } from '@dogu-private/console';
import { errorify } from '@dogu-tech/common';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BillingCoupon, BillingCouponTableName } from '../../db/entity/billing-coupon.entity';
import { subscribe } from '../../db/retry-transaction';
import { DoguLogger } from '../logger/logger';
import { PaddleCaller } from '../paddle/paddle.caller';
import { matchDiscount } from '../paddle/paddle.utils';

@Injectable()
export class BillingCouponSubscriber {
  constructor(
    private readonly logger: DoguLogger,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly paddleCaller: PaddleCaller,
  ) {}

  async subscribe(): Promise<void> {
    await subscribe(this.logger, this.dataSource, BillingCouponTableName, (message) => {
      this.logger.info('BillingCouponSubscriber.onModuleInit.subscribe', { message: JSON.stringify(message) });
      (async (): Promise<void> => {
        const coupon = message.data as unknown as BillingCoupon;
        if (message.event === 'created') {
          if (coupon.monthlyDiscountPercent !== null) {
            const created = await this.paddleCaller
              .createDiscount({
                code: coupon.code,
                type: coupon.type,
                period: 'monthly',
                discountPercent: coupon.monthlyDiscountPercent,
                applyCount: coupon.monthlyApplyCount,
                expiredAt: coupon.expiredAt,
                billingCouponId: coupon.billingCouponId,
              })
              .then(unwrap);

            this.logger.info('BillingCouponSubscriber.onModuleInit.subscribe.created', { created });
          } else if (coupon.yearlyDiscountPercent !== null) {
            const created = await this.paddleCaller
              .createDiscount({
                code: coupon.code,
                type: coupon.type,
                period: 'yearly',
                discountPercent: coupon.yearlyDiscountPercent,
                applyCount: coupon.yearlyApplyCount,
                expiredAt: coupon.expiredAt,
                billingCouponId: coupon.billingCouponId,
              })
              .then(unwrap);

            this.logger.info('BillingCouponSubscriber.onModuleInit.subscribe.created', { created });
          } else {
            throw new Error(`Not supported event ${JSON.stringify(message)}`);
          }
        } else if (message.event === 'updated') {
          const discounts = await this.paddleCaller.listDiscountsAll().then(unwrap);
          const discount = discounts.find((discount) => matchDiscount(coupon, discount));
          if (!discount) {
            throw new Error(`Discount not found for code ${coupon.billingCouponId}`);
          }

          if (!discount.id) {
            throw new Error(`Discount id not found for code ${coupon.billingCouponId}`);
          }

          if (coupon.monthlyDiscountPercent !== null) {
            const updated = await this.paddleCaller
              .updateDiscount({
                id: discount.id,
                code: coupon.code,
                type: coupon.type,
                period: 'monthly',
                discountPercent: coupon.monthlyDiscountPercent,
                applyCount: coupon.monthlyApplyCount,
                expiredAt: coupon.expiredAt,
                billingCouponId: coupon.billingCouponId,
              })
              .then(unwrap);

            this.logger.info('BillingCouponSubscriber.onModuleInit.subscribe.updated', { updated });
          } else if (coupon.yearlyDiscountPercent !== null) {
            const updated = await this.paddleCaller
              .updateDiscount({
                id: discount.id,
                code: coupon.code,
                type: coupon.type,
                period: 'yearly',
                discountPercent: coupon.yearlyDiscountPercent,
                applyCount: coupon.yearlyApplyCount,
                expiredAt: coupon.expiredAt,
                billingCouponId: coupon.billingCouponId,
              })
              .then(unwrap);

            this.logger.info('BillingCouponSubscriber.onModuleInit.subscribe.updated', { updated });
          } else {
            throw new Error(`Not supported event ${JSON.stringify(message)}`);
          }
        } else {
          throw new Error(`Not supported event ${JSON.stringify(message)}`);
        }
      })().catch((e) => {
        this.logger.error('BillingCouponSubscriber.onModuleInit.subscribe', { error: errorify(e) });
      });
    });
  }
}
