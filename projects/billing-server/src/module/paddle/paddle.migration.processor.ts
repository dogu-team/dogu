import { BillingCurrency, BillingPeriod, BillingResult, BillingSubscriptionPlanMap, BillingSubscriptionPlanType, BillingUsdAmount, throwFailure } from '@dogu-private/console';
import { stringify } from '@dogu-tech/common';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import _ from 'lodash';
import { DataSource } from 'typeorm';
import { BillingSubscriptionPlanSource } from '../../db/entity/billing-subscription-plan-source.entity';
import { DoguLogger } from '../logger/logger';
import { PaddleCaller } from './paddle.caller';
import { Paddle } from './paddle.types';
import { matchPrice, matchProduct, matchProductByPrice } from './paddle.utils';

function createProductSourcesFromStatic(): Paddle.ProductSource[] {
  const productSources: Paddle.ProductSource[] = [];
  _.entries(BillingSubscriptionPlanMap).forEach(([subscriptionPlanTypeRaw, optionInfo]) => {
    const subscriptionPlanType = subscriptionPlanTypeRaw as BillingSubscriptionPlanType;
    const { category, name, optionMap } = optionInfo;
    const prices: Paddle.PriceSource[] = [];

    _.entries(optionMap).forEach(([option, priceMap]) => {
      _.entries(priceMap).forEach(([currencyRaw, priceInfo]) => {
        const currency = currencyRaw as BillingCurrency;
        if (currency === 'KRW') {
          return;
        }

        _.entries(priceInfo).forEach(([periodRaw, priceSource]) => {
          const period = periodRaw as BillingPeriod;
          const { originPrice } = priceSource;
          const amount = BillingUsdAmount.fromDollars(originPrice);
          prices.push({
            category,
            subscriptionPlanType,
            option,
            period,
            currency,
            amount,
            billingOrganizationId: 'none',
          });
        });
      });
    });

    productSources.push({
      subscriptionPlanType,
      category,
      name,
      prices,
    });
  });

  return productSources;
}

@Injectable()
export class PaddleMigrationProcessor implements OnModuleInit {
  constructor(
    private readonly logger: DoguLogger,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly paddleCaller: PaddleCaller,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.migrateSubscriptionPlan();
    await this.migrateCoupon();
  }

  async migrateSubscriptionPlan(): Promise<void> {
    const productSources = await this.createProductSources();
    const productsResult = await this.paddleCaller.listProductsAll();
    if (!productsResult.ok) {
      throwFailure(productsResult);
    }

    const products = productsResult.value;
    const prices = products.flatMap((product) => {
      if (!product.id) {
        throw new Error(`Product id is not defined. ${stringify(product)}`);
      }

      return product.prices ?? [];
    });

    const matchedProductIds: string[] = [];
    const matchedPriceIds: string[] = [];
    for (const productSource of productSources) {
      let product = products.find((product) => matchProduct(this.logger, productSource, product));
      if (product) {
        if (!product.id) {
          throw new Error(`Product id is not defined. ${stringify(product)}`);
        }

        matchedProductIds.push(product.id);
        this.logger.debug('Paddle product already exists.', {
          id: product.id,
          name: product.name,
          subscriptionPlanType: product.custom_data?.subscriptionPlanType,
          category: product.custom_data?.category,
        });
      } else {
        const result = await this.paddleCaller.createProduct({
          subscriptionPlanType: productSource.subscriptionPlanType,
          category: productSource.category,
          name: productSource.name,
        });
        if (!result.ok) {
          throwFailure(result);
        }

        product = result.value;
        if (!product.id) {
          throw new Error(`Product id is not defined. ${stringify(product)}`);
        }

        matchedProductIds.push(product.id);
        this.logger.info('Paddle product created.', {
          id: product.id,
          name: product.name,
          subscriptionPlanType: product.custom_data?.subscriptionPlanType,
          category: product.custom_data?.category,
        });
      }

      for (const priceSource of productSource.prices) {
        const price = product.prices?.find((price) => matchPrice(this.logger, priceSource, price));
        if (price) {
          if (!price.id) {
            throw new Error(`Price id is not defined. ${stringify(price)}`);
          }

          matchedPriceIds.push(price.id);
          this.logger.debug('Paddle price already exists.', {
            id: price.id,
            option: price.custom_data?.option,
            period: price.custom_data?.period,
            currency: price.custom_data?.currency,
            amountInCents: price.custom_data?.amountInCents,
            category: price.custom_data?.category,
            subscriptionPlanType: price.custom_data?.subscriptionPlanType,
            billingOrganizationId: price.custom_data?.billingOrganizationId,
          });
          continue;
        }

        if (!product.id) {
          throw new Error(`Product id is not defined. ${stringify(product)}`);
        }

        const result: BillingResult<Paddle.Price> = await this.paddleCaller.createPrice({
          productId: product.id,
          option: priceSource.option,
          period: priceSource.period,
          currency: priceSource.currency,
          amount: priceSource.amount,
          category: priceSource.category,
          subscriptionPlanType: priceSource.subscriptionPlanType,
          billingOrganizationId: 'none',
        });
        if (!result.ok) {
          throwFailure(result);
        }

        const created = result.value;
        if (!created.id) {
          throw new Error(`Price id is not defined. ${stringify(created)}`);
        }

        matchedPriceIds.push(created.id);
        this.logger.info('Paddle price created.', {
          id: created.id,
          option: created.custom_data?.option,
          period: created.custom_data?.period,
          currency: created.custom_data?.currency,
          amountInCents: created.custom_data?.amountInCents,
          category: created.custom_data?.category,
          subscriptionPlanType: created.custom_data?.subscriptionPlanType,
          billingOrganizationId: created.custom_data?.billingOrganizationId,
        });
      }
    }

    const unmatchedPriceIds = prices
      .filter((price) => !matchedPriceIds.includes(price.id ?? ''))
      .filter((price) => price.status === 'active')
      .map((price) => price.id ?? '');
    this.logger.info('Paddle price unmatched.', { unmatchedPriceIds });

    for (const priceId of unmatchedPriceIds) {
      const result = await this.paddleCaller.updatePrice({
        priceId,
        status: 'archived',
      });
      if (!result.ok) {
        throwFailure(result);
      }

      this.logger.info('Paddle price archived.', { priceId });
    }

    const unmatchedProductIds = products
      .filter((product) => !matchedProductIds.includes(product.id ?? ''))
      .filter((product) => product.status === 'active')
      .map((product) => product.id ?? '');
    this.logger.info('Paddle product unmatched.', { unmatchedProductIds });

    for (const productId of unmatchedProductIds) {
      const result = await this.paddleCaller.updateProduct({
        productId,
        status: 'archived',
      });
      if (!result.ok) {
        throwFailure(result);
      }

      this.logger.info('Paddle product archived.', { productId });
    }
  }

  private async createProductSources(): Promise<Paddle.ProductSource[]> {
    const productSources = createProductSourcesFromStatic();
    const priceSourcesFromDb = await this.createPriceSourcesFromDb();
    for (const priceSource of priceSourcesFromDb) {
      const productSource = productSources.find((productSource) => matchProductByPrice(productSource, priceSource));
      if (!productSource) {
        throw new Error(`Product source not found. ${stringify(priceSource)}`);
      }

      productSource.prices.push(priceSource);
    }
    return productSources;
  }

  private async createPriceSourcesFromDb(): Promise<Paddle.PriceSource[]> {
    const sources = await this.dataSource.manager.getRepository(BillingSubscriptionPlanSource).find();
    const priceSources = sources.map((source) => {
      const { category, type, option, currency, period, originPrice, billingOrganizationId } = source;
      return {
        category,
        subscriptionPlanType: type,
        option: option.toString(),
        currency,
        period,
        amount: BillingUsdAmount.fromDollars(originPrice),
        billingOrganizationId,
      };
    });
    return priceSources;
  }

  async migrateCoupon(): Promise<void> {}
}
