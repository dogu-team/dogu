import { errorify, stringify, transform } from '@dogu-tech/common';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BillingCoupon, BillingCouponTableName } from '../../db/entity/billing-coupon.entity';
import { subscribe } from '../../db/retry-transaction';
import { DoguLogger } from '../logger/logger';
import { PaddleCaller } from '../paddle/paddle.caller';
import { matchDiscount, matchDiscountCode } from '../paddle/paddle.utils';

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
      this.logger.info('BillingCouponSubscriber.subscribe', { message: stringify(message) });
      (async (): Promise<void> => {
        const coupon = transform(BillingCoupon, message.data);
        if (message.event === 'created' || message.event === 'updated') {
          const discounts = await this.paddleCaller.listDiscountsAll();
          const codeMatched = discounts.find((discount) => matchDiscountCode({ code: coupon.code }, discount));
          if (codeMatched) {
            const idMatched = matchDiscount({ billingCouponId: coupon.billingCouponId }, codeMatched);
            if (idMatched) {
              // noop
            } else {
              this.logger.warn('BillingCouponSubscriber.subscribe code matched but id not matched', {
                codeMatched,
                coupon,
              });
            }
          } else {
            const discount = discounts.find((discount) => matchDiscount(coupon, discount));
            if (!discount) {
              await this.paddleCaller.createDiscount({
                code: coupon.code,
                type: coupon.type,
                period: coupon.period,
                discountPercent: coupon.discountPercent,
                applyCount: coupon.applyCount,
                expiredAt: coupon.expiredAt,
                billingCouponId: coupon.billingCouponId,
              });
              return;
            }

            if (!discount.id) {
              throw new Error(`Discount id not found for code ${coupon.billingCouponId}`);
            }

            await this.paddleCaller.updateDiscount({
              discountId: discount.id,
              code: coupon.code,
              type: coupon.type,
              period: coupon.period,
              discountPercent: coupon.discountPercent,
              applyCount: coupon.applyCount,
              expiredAt: coupon.expiredAt,
              billingCouponId: coupon.billingCouponId,
            });
          }
        }
      })().catch((e) => {
        this.logger.error('BillingCouponSubscriber.subscribe.catch', { error: errorify(e) });
      });
    });
  }
}
