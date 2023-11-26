import { BillingUsdAmount, unwrap } from '@dogu-private/console';
import { errorify } from '@dogu-tech/common';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BillingSubscriptionPlanSource, BillingSubscriptionPlanSourceTableName } from '../../db/entity/billing-subscription-plan-source.entity';
import { subscribe } from '../../db/retry-transaction';
import { DoguLogger } from '../logger/logger';
import { PaddleCaller } from '../paddle/paddle.caller';
import { matchPrice, matchProduct } from '../paddle/paddle.utils';

@Injectable()
export class BillingSubscriptionPlanSourceSubscriber {
  constructor(
    private readonly logger: DoguLogger,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly paddleCaller: PaddleCaller,
  ) {}

  async subscribe(): Promise<void> {
    await subscribe(this.logger, this.dataSource, BillingSubscriptionPlanSourceTableName, (message) => {
      this.logger.info('BillingSubscriptionPlanSourceSubscriber.subscribe', { message: JSON.stringify(message) });
      (async (): Promise<void> => {
        const planSource = message.data as unknown as BillingSubscriptionPlanSource;
        if (message.event === 'created') {
          const products = await this.paddleCaller.listProductsAll().then(unwrap);
          const product = products.find((product) => matchProduct(planSource, product));
          if (!product) {
            throw new Error(`Product not found for category ${planSource.category} and type ${planSource.type}`);
          }

          if (!product.id) {
            throw new Error(`Product id not found for category ${planSource.category} and type ${planSource.type}`);
          }

          const created = await this.paddleCaller
            .createPrice({
              productId: product.id,
              amount: BillingUsdAmount.fromDollars(planSource.originPrice),
              currency: planSource.currency,
              period: planSource.period,
              billingSubscriptionPlanSourceId: planSource.billingSubscriptionPlanSourceId,
            })
            .then(unwrap);

          this.logger.info('BillingSubscriptionPlanSourceSubscriber.subscribe.created', { created });
        } else if (message.event === 'updated') {
          const products = await this.paddleCaller.listProductsAll().then(unwrap);
          const product = products.find((product) => matchProduct(planSource, product));
          if (!product) {
            throw new Error(`Product not found for category ${planSource.category} and type ${planSource.type}`);
          }

          if (!product.id) {
            throw new Error(`Product id not found for category ${planSource.category} and type ${planSource.type}`);
          }

          const price = product.prices?.find((price) => matchPrice(planSource, price));
          if (!price) {
            throw new Error(`Price not found for category ${planSource.category} and type ${planSource.type}`);
          }

          if (!price.id) {
            throw new Error(`Price id not found for category ${planSource.category} and type ${planSource.type}`);
          }

          const updated = await this.paddleCaller
            .updatePrice({
              id: price.id,
              amount: BillingUsdAmount.fromDollars(planSource.originPrice),
              currency: planSource.currency,
              period: planSource.period,
              billingSubscriptionPlanSourceId: planSource.billingSubscriptionPlanSourceId,
            })
            .then(unwrap);

          this.logger.info('BillingSubscriptionPlanSourceSubscriber.subscribe.updated', { updated });
        } else {
          throw new Error(`Not supported event ${JSON.stringify(message)}`);
        }
      })().catch((e) => {
        this.logger.error('BillingSubscriptionPlanSourceSubscriber.subscribe.catch', { error: errorify(e) });
      });
    });
  }
}
