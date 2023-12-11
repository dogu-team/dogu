import { BillingPlanMap, BillingUsdAmount, isBillingPlanType, matchBillingPlanType } from '@dogu-private/console';
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

    const products = await this.paddleCaller.listProductsAllAndCache({ refresh: false });
    for (const origin of origins) {
      const product = products.find((product) => matchProduct(origin, product));
      if (product) {
        if (!product.id) {
          throw new Error(`Product id is not defined. ${stringify(product)}`);
        }

        if (product.name !== origin.name) {
          const updated = await this.paddleCaller.updateProduct({
            productId: product.id,
            name: origin.name,
          });

          this.logger.info('Paddle product updated.', {
            updated,
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
        created,
      });
    }

    await this.paddleCaller.listProductsAllAndCache({ refresh: true });
  }

  private async migratePrices(): Promise<void> {
    const sources = await this.dataSource.getRepository(BillingPlanSource).find({
      order: {
        billingPlanSourceId: 'asc',
      },
    });

    const products = await this.paddleCaller.listProductsAllAndCache({ refresh: false });
    for (const product of products) {
      const { category, type } = product.custom_data ?? {};
      if (!category) {
        this.logger.warn('Product category is not defined.', {
          product,
        });
        continue;
      }

      if (!type) {
        this.logger.warn('Product type is not defined.', {
          product,
        });
        continue;
      }

      if (!product.id) {
        throw new Error(`Product id is not defined. ${stringify(product)}`);
      }

      const filteredSources = sources.filter((source) => matchBillingPlanType({ category, type }, source));
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
          created,
        });
      }
    }

    await this.paddleCaller.listProductsAllAndCache({ refresh: true });
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
        created,
      });
    }
  }
}
