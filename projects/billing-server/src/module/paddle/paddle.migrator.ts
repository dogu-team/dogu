import { BillingPlanMap, BillingUsdAmount, isBillingPlanType } from '@dogu-private/console';
import { stringify } from '@dogu-tech/common';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import _ from 'lodash';
import { DataSource } from 'typeorm';
import { BillingCoupon } from '../../db/entity/billing-coupon.entity';
import { BillingPlanSource } from '../../db/entity/billing-plan-source.entity';
import { DoguLogger } from '../logger/logger';
import { PaddleCaller } from './paddle.caller';
import { Paddle } from './paddle.types';
import { matchDiscount, matchPrice, matchProduct } from './paddle.utils';

@Injectable()
export class PaddleMigrator {
  constructor(
    private readonly logger: DoguLogger,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly paddleCaller: PaddleCaller,
  ) {}

  async migrate(): Promise<void> {
    await this.migrateProducts();
    await this.migratePrices();
    await this.migrateDiscounts();
  }

  private async migrateProducts(): Promise<void> {
    const origins: Paddle.ProductOrigin[] = _.entries(BillingPlanMap).map(([type, optionInfo]) => {
      if (!isBillingPlanType(type)) {
        throw new Error(`Invalid subscription plan type. ${stringify(type)}`);
      }

      const { category, name } = optionInfo;
      return {
        type,
        category,
        name,
      };
    });

    const products = await this.paddleCaller.listProductsAll();
    for (const origin of origins) {
      const product = products.find((product) => matchProduct(origin, product));
      if (product) {
        if (!product.id) {
          throw new Error(`Product id is not defined. ${stringify(product)}`);
        }

        this.logger.debug('Paddle product matched.', {
          id: product.id,
          name: product.name,
          planType: product.custom_data?.planType,
          category: product.custom_data?.category,
        });

        if (product.name !== origin.name) {
          const updated = await this.paddleCaller.updateProduct({
            productId: product.id,
            name: origin.name,
          });
          this.logger.info('Paddle product updated.', {
            id: updated.id,
            name: updated.name,
            planType: updated.custom_data?.planType,
            category: updated.custom_data?.category,
          });
        }

        continue;
      }

      const created = await this.paddleCaller.createProduct({
        type: origin.type,
        category: origin.category,
        name: origin.name,
      });
      if (!created.id) {
        throw new Error(`Product id is not defined. ${stringify(created)}`);
      }

      this.logger.info('Paddle product created.', {
        id: created.id,
        name: created.name,
        planType: created.custom_data?.planType,
        category: created.custom_data?.category,
      });
    }
  }

  private async migratePrices(): Promise<void> {
    const sources = await this.dataSource.getRepository(BillingPlanSource).find({
      order: {
        billingPlanSourceId: 'asc',
      },
    });

    const products = await this.paddleCaller.listProductsAll();
    for (const product of products) {
      const { category, type } = product.custom_data ?? {};
      if (!category) {
        throw new Error(`Product category is not defined. ${stringify(product)}`);
      }

      if (!type) {
        throw new Error(`Product type is not defined. ${stringify(product)}`);
      }

      if (!product.id) {
        throw new Error(`Product id is not defined. ${stringify(product)}`);
      }

      const filteredSources = sources.filter((source) => source.category === category && source.type === type);
      for (const filteredSource of filteredSources) {
        const price = product.prices?.find((price) => matchPrice(filteredSource, price));
        if (price) {
          continue;
        }

        const created = await this.paddleCaller.createPrice({
          productId: product.id,
          billingPlanSourceId: filteredSource.billingPlanSourceId,
          amount: BillingUsdAmount.fromDollars(filteredSource.originPrice),
          currency: filteredSource.currency,
          period: filteredSource.period,
        });
        if (!created.id) {
          throw new Error(`Price id is not defined. ${stringify(created)}`);
        }

        this.logger.info('Paddle price created.', {
          id: created.id,
          productId: created.product_id,
          unitPriceAmount: created.unit_price?.amount,
          unitPriceCurrency: created.unit_price?.currency_code,
          billingCycleInterval: created.billing_cycle?.interval,
          billingCycleFrequency: created.billing_cycle?.frequency,
          billingPlanSourceId: created.custom_data?.billingPlanSourceId,
        });
      }
    }
  }

  private async migrateDiscounts(): Promise<void> {
    const coupons = await this.dataSource.getRepository(BillingCoupon).find({
      order: {
        createdAt: 'asc',
      },
    });
    const discounts = await this.paddleCaller.listDiscountsAll();
    for (const coupon of coupons) {
      const discount = discounts.find((discount) => matchDiscount(coupon, discount));
      if (discount) {
        continue;
      }

      const created = await this.paddleCaller.createDiscount({
        code: coupon.code,
        type: coupon.type,
        period: 'monthly',
        discountPercent: coupon.discountPercent,
        applyCount: coupon.applyCount,
        expiredAt: coupon.expiredAt,
        billingCouponId: coupon.billingCouponId,
      });

      this.logger.info('Paddle discount created.', {
        id: created.id,
        code: created.code,
        type: created.type,
        amount: created.amount,
        maximum_recurring_intervals: created.maximum_recurring_intervals,
        expires_at: created.expires_at,
        billingCouponId: created.custom_data?.billingCouponId,
        billingCouponType: created.custom_data?.type,
        period: created.custom_data?.period,
      });
    }
  }
}
