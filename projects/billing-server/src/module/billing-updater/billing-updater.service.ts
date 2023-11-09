import { BillingOrganizationProp } from '@dogu-private/console';
import { assertUnreachable, errorify, stringify } from '@dogu-tech/common';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { setInterval } from 'timers/promises';
import { DataSource, IsNull, LessThan, Not } from 'typeorm';
import { v4 } from 'uuid';
import { createExpiredAt, NormalizedDateTime } from '../../date-time-utils';
import { BillingHistory } from '../../db/entity/billing-history.entity';
import { BillingMethodNice } from '../../db/entity/billing-method-nice.entity';
import { BillingOrganization } from '../../db/entity/billing-organization.entity';
import { BillingSubscriptionPlanHistory } from '../../db/entity/billing-subscription-plan-history.entity';
import { BillingSubscriptionPlanInfo } from '../../db/entity/billing-subscription-plan-info.entity';
import { retrySerialize } from '../../db/utils';
import { BillingMethodNiceCaller } from '../billing-method/billing-method-nice.caller';
import { clearChangeRequested } from '../billing-subscription-plan-info/billing-subscription-plan-info.utils';
import { DoguLogger } from '../logger/logger';

@Injectable()
export class BillingUpdaterService implements OnModuleInit, OnModuleDestroy {
  private closeRequested = false;

  constructor(
    private readonly logger: DoguLogger,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly billingMethodNiceCaller: BillingMethodNiceCaller,
  ) {}

  onModuleInit(): void {
    this.run().catch((error) => {
      this.logger.error('BillingUpdaterService.run error', { error: errorify(error) });
    });
  }

  onModuleDestroy(): void {
    this.closeRequested = true;
  }

  private async run(): Promise<void> {
    for await (const _ of setInterval(60 * 1000)) {
      if (this.closeRequested) {
        break;
      }

      try {
        await Promise.resolve();
      } catch (error) {
        this.logger.error('BillingUpdaterService.run.updateBilling error', { error: errorify(error) });
      }
    }
  }

  private async updateBilling(): Promise<void> {
    await retrySerialize(this.logger, this.dataSource, async (context) => {
      const { manager } = context;
      const now = new Date();
      const billingOrganization = await manager
        .getRepository(BillingOrganization)
        .createQueryBuilder(BillingOrganization.name)
        .leftJoinAndSelect(`${BillingOrganization.name}.${BillingOrganizationProp.billingSubscriptionPlanInfos}`, BillingSubscriptionPlanInfo.name)
        .leftJoinAndSelect(`${BillingOrganization.name}.${BillingOrganizationProp.billingMethodNice}`, BillingMethodNice.name)
        .where({
          subscriptionYearlyExpiredAt: Not(IsNull()),
          category: 'cloud',
        })
        .andWhere({
          subscriptionYearlyExpiredAt: LessThan(now),
        })
        .getOne();

      if (!billingOrganization) {
        return;
      }

      const { billingMethodNice } = billingOrganization;
      if (!billingMethodNice) {
        throw new Error('billingMethodNice must not be null');
      }

      const purchases: BillingSubscriptionPlanInfo[] = [];
      const infos = (billingOrganization.billingSubscriptionPlanInfos ?? []).filter((info) => {
        return info.period === 'yearly';
      });

      for (const info of infos) {
        switch (info.state) {
          case 'unsubscribed': {
            // noop
            break;
          }
          case 'unsubscribe-requested': {
            info.state = 'unsubscribed';
            info.unsubscribedAt = now;
            break;
          }
          case 'change-option-or-period-requested': {
            if (info.changeRequestedPeriod) {
              info.period = info.changeRequestedPeriod;
            }

            if (info.changeRequestedOption) {
              info.option = info.changeRequestedOption;
            }

            if (info.changeRequestedOriginPrice) {
              info.originPrice = info.changeRequestedOriginPrice;
            }

            if (info.changeRequestedDiscountedAmount) {
              info.discountedAmount = info.changeRequestedDiscountedAmount;
            }

            clearChangeRequested(info);
            info.state = 'subscribed';
            purchases.push(info);
            break;
          }
          case 'subscribed': {
            purchases.push(info);
            break;
          }
          default: {
            assertUnreachable(info.state);
          }
        }
      }

      const purchaseAmountInfos = purchases.map((purchase) => {
        if (purchase.couponRemainingApplyCount === null) {
          const purchaseAmount = purchase.originPrice - purchase.discountedAmount;
          return {
            discountedAmount: purchase.discountedAmount,
            purchaseAmount,
          };
        } else {
          if (purchase.couponRemainingApplyCount > 0) {
            purchase.couponRemainingApplyCount -= 1;
            const purchaseAmount = purchase.originPrice - purchase.discountedAmount;
            return {
              discountedAmount: purchase.discountedAmount,
              purchaseAmount,
            };
          } else {
            const purchaseAmount = purchase.originPrice;
            return {
              discountedAmount: 0,
              purchaseAmount,
            };
          }
        }
      });
      const purchaseAmount = purchaseAmountInfos.reduce((acc, cur) => acc + cur.purchaseAmount, 0);

      const { bid } = billingMethodNice;
      if (bid === null) {
        throw new Error('bid must not be null');
      }

      const goodsName = 'Dogu Platform Subscription';
      const result = await this.billingMethodNiceCaller.subscribePayments({
        bid,
        amount: purchaseAmount,
        goodsName,
      });

      if (!result.ok) {
        throw new Error(`subscribePayments failed: ${stringify(result)}`);
      }

      if (!billingOrganization.currency) {
        throw new Error('currency must not be null');
      }

      const newHistory = manager.getRepository(BillingHistory).create({
        billingHistoryId: v4(),
        billingOrganizationId: billingOrganization.billingOrganizationId,
        purchasedAmount: purchaseAmount,
        currency: billingOrganization.currency,
        goodsName,
        method: 'nice',
        niceSubscribePaymentsResponse: result.value as unknown as Record<string, unknown>,
        niceTid: result.value.tid,
        niceOrderId: result.value.orderId,
        historyType: 'periodic-purchase',
        cardCode: billingMethodNice.cardCode,
        cardName: billingMethodNice.cardName,
        cardNumberLast4Digits: billingMethodNice.cardNumberLast4Digits,
        cardExpirationYear: billingMethodNice.expirationYear,
        cardExpirationMonth: billingMethodNice.expirationMonth,
      });
      const savedHistory = await manager.save(newHistory);

      let index = 0;
      for (const purchase of purchases) {
        const purchaseAmountInfo = purchaseAmountInfos[index];
        const planHistory = manager.getRepository(BillingSubscriptionPlanHistory).create({
          billingSubscriptionPlanHistoryId: v4(),
          billingOrganizationId: billingOrganization.billingOrganizationId,
          billingHistoryId: savedHistory.billingHistoryId,
          billingCouponId: purchase.billingCouponId,
          billingSubscriptionPlanSourceId: purchase.billingSubscriptionPlanSourceId,
          discountedAmount: purchaseAmountInfo.discountedAmount,
          purchasedAmount: purchaseAmountInfo.purchaseAmount,
          startedAt: billingOrganization.subscriptionYearlyStartedAt,
          expiredAt: billingOrganization.subscriptionYearlyExpiredAt,
          category: billingOrganization.category,
          type: purchase.type,
          option: purchase.option,
          currency: billingOrganization.currency,
          period: purchase.period,
          originPrice: purchase.originPrice,
          historyType: 'periodic-purchase',
        });
        await manager.save(planHistory);

        index += 1;
      }

      await manager.save(infos);

      if (billingOrganization.subscriptionYearlyExpiredAt === null) {
        throw new Error('subscriptionYearlyExpiredAt must not be null');
      }

      billingOrganization.subscriptionYearlyStartedAt = billingOrganization.subscriptionYearlyExpiredAt;
      billingOrganization.subscriptionYearlyExpiredAt = createExpiredAt(NormalizedDateTime.fromDate(billingOrganization.subscriptionYearlyStartedAt), 'yearly').date;
      await manager.save(billingOrganization);
    });
  }
}
