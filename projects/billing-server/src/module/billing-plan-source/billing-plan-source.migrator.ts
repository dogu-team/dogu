import { BillingCategory, BillingCurrency, BillingPeriod, BillingPlanMap, BillingPlanType, isBillingCurrency, isBillingPeriod, isBillingPlanType } from '@dogu-private/console';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import _ from 'lodash';
import { DataSource } from 'typeorm';
import { BillingPlanSource } from '../../db/entity/billing-plan-source.entity';
import { RetryTransaction } from '../../db/utils';
import { DoguLogger } from '../logger/logger';

interface PlanSourceStatic {
  category: BillingCategory;
  type: BillingPlanType;
  name: string;
  option: number;
  currency: BillingCurrency;
  period: BillingPeriod;
  originPrice: number;
  id: number;
}

function isPlanSourceStatic(origin: PlanSourceStatic, target: BillingPlanSource): boolean {
  return (
    origin.category === target.category &&
    origin.type === target.type &&
    origin.name === target.name &&
    origin.option === target.option &&
    origin.currency === target.currency &&
    origin.period === target.period &&
    origin.originPrice === target.originPrice &&
    origin.id === target.billingPlanSourceId
  );
}

function parsePlanSourceStatic(): PlanSourceStatic[] {
  const planSources = _.flatMap(BillingPlanMap, (optionInfo, type) => {
    if (!isBillingPlanType(type)) {
      throw new Error(`Invalid type: ${type}`);
    }

    return {
      type,
      ...optionInfo,
    };
  })
    .flatMap(({ category, type, name, optionMap }) =>
      _.flatMap(optionMap, (priceMap, option) => ({
        category,
        type,
        name,
        option: Number(option),
        priceMap,
      })),
    )
    .flatMap(({ category, type, name, option, priceMap }) =>
      _.flatMap(priceMap, (price, currency) => {
        if (!isBillingCurrency(currency)) {
          throw new Error(`Invalid currency: ${currency}`);
        }

        return {
          category,
          type,
          name,
          option,
          currency,
          price,
        };
      }),
    )
    .flatMap(({ category, type, name, option, currency, price }) =>
      _.flatMap(price, (priceSource, period) => {
        if (!isBillingPeriod(period)) {
          throw new Error(`Invalid period: ${period}`);
        }

        return {
          category,
          type,
          name,
          option,
          currency,
          period,
          priceSource,
        };
      }),
    )
    .flatMap(({ category, type, name, option, currency, period, priceSource }) => ({
      category,
      type,
      name,
      option,
      currency,
      period,
      originPrice: priceSource.originPrice,
      id: priceSource.id,
    }));

  for (const planSource of planSources) {
    if (isNaN(planSource.option)) {
      throw new Error(`Option should be number: ${planSource.option}`);
    }
  }

  // check duplicate id
  const idSet = new Set<number>();
  for (const planSource of planSources) {
    if (idSet.has(planSource.id)) {
      throw new Error(`Duplicate id: ${planSource.id}`);
    }
    idSet.add(planSource.id);
  }

  return planSources;
}

@Injectable()
export class BillingPlanSourceMigrator {
  private readonly retryTransaction: RetryTransaction;

  constructor(
    private readonly logger: DoguLogger,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {
    this.retryTransaction = new RetryTransaction(this.logger, this.dataSource);
  }

  async migrate(): Promise<void> {
    const planSourceStatic = parsePlanSourceStatic();
    await this.retryTransaction.serializable(async (context) => {
      const { manager } = context;
      const planSource = await manager.getRepository(BillingPlanSource).find({
        order: {
          billingPlanSourceId: 'asc',
        },
      });

      const results = _.zip(planSourceStatic, planSource).map(([origin, target], index) => {
        const id = origin?.id || index + 1;
        if (origin) {
          if (origin.id !== id) {
            throw new Error(`Invalid id: ${origin.id} -> ${id}`);
          }
        }

        if (target) {
          if (target.billingPlanSourceId !== id) {
            throw new Error(`Invalid id: ${target.billingPlanSourceId} -> ${id}`);
          }
        }

        if (origin && !target) {
          return {
            id,
            action: 'create',
            origin,
          };
        }

        if (!origin && target) {
          // noop
          return {
            id,
            action: 'noop',
          };
        }

        if (origin && target) {
          if (isPlanSourceStatic(origin, target)) {
            return {
              id,
              action: 'noop',
            };
          } else {
            throw new Error(`Must be same: ${JSON.stringify(origin)} -> ${JSON.stringify(target)}`);
          }
        }

        throw new Error(`Must not be here ${id}`);
      });

      const creates = results.filter((value) => value.action === 'create');
      const createds = creates.map(({ origin }) => {
        if (!origin) {
          throw new Error(`Must origin not be null`);
        }

        const created = manager.getRepository(BillingPlanSource).create({
          billingPlanSourceId: origin.id,
          category: origin.category,
          type: origin.type,
          name: origin.name,
          option: origin.option,
          currency: origin.currency,
          period: origin.period,
          originPrice: origin.originPrice,
        });

        return created;
      });

      await manager.getRepository(BillingPlanSource).save(createds);
    });
  }
}
