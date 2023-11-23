import { BillingCurrency, BillingPeriod, BillingResult, BillingSubscriptionPlanMap, BillingSubscriptionPlanType, BillingUsdAmount } from '@dogu-private/console';
import { stringify } from '@dogu-tech/common';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import _ from 'lodash';
import { DataSource } from 'typeorm';
import { BillingSubscriptionPlanSource } from '../../db/entity/billing-subscription-plan-source.entity';
import { DoguLogger } from '../logger/logger';
import { ListProductsResult, PaddleCaller } from './paddle.caller';
import { Paddle } from './paddle.types';
import { matchPrice, matchProduct, matchProductByPrice } from './paddle.utils';

function createProductSourcesFromScript(): Paddle.ProductSource[] {
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

        _.entries(priceInfo).forEach(([periodRaw, dollars]) => {
          const period = periodRaw as BillingPeriod;
          const amount = BillingUsdAmount.fromDollars(dollars);
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
  }

  async migrateSubscriptionPlan(): Promise<void> {
    const productSources = await this.createProductSources();
    const products = await this.listProducts();
    for (const productSource of productSources) {
      let product = products.find((product) => matchProduct(this.logger, productSource, product));
      if (product) {
        this.logger.info('Paddle product already exists.', {
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
          throw new Error(`Failed to create product. ${stringify(result)}`);
        }

        product = result.value;
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
          this.logger.info('Paddle price already exists.', {
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

        const result = await this.paddleCaller.createPrice({
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
          throw new Error(`Failed to create price. ${stringify(result)}`);
        }
      }
    }
  }

  private async listProducts(): Promise<Paddle.ProductWithPrices[]> {
    const products: Paddle.ProductWithPrices[] = [];
    let nextAfter: string | null = null;
    let hasMore = true;
    while (hasMore) {
      const result: BillingResult<ListProductsResult> = await this.paddleCaller.listProducts(nextAfter ?? undefined);
      if (!result.ok) {
        throw new Error(`Failed to list products. ${stringify(result)}`);
      }

      products.push(...result.value.products);
      nextAfter = result.value.nextAfter;
      hasMore = result.value.hasMore;
    }

    return products;
  }

  private async createProductSources(): Promise<Paddle.ProductSource[]> {
    const productSources = createProductSourcesFromScript();
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
}
