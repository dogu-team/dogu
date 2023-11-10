import { BillingGoodsName, BillingGracePeriodDays, BillingOrganizationProp, BillingPeriod, BillingSubscriptionPlanInfoProp } from '@dogu-private/console';
import { assertUnreachable, delay, errorify, stringify } from '@dogu-tech/common';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DateTime } from 'luxon';
import Cursor from 'pg-cursor';
import { Brackets, DataSource, IsNull, LessThan, Not } from 'typeorm';
import { v4 } from 'uuid';
import { createExpiredAt, NormalizedDateTime } from '../../date-time-utils';
import { BillingCoupon } from '../../db/entity/billing-coupon.entity';
import { BillingHistory } from '../../db/entity/billing-history.entity';
import { BillingMethodNice } from '../../db/entity/billing-method-nice.entity';
import { BillingOrganization, BillingOrganizationTableName } from '../../db/entity/billing-organization.entity';
import { BillingSubscriptionPlanHistory } from '../../db/entity/billing-subscription-plan-history.entity';
import { BillingSubscriptionPlanInfo } from '../../db/entity/billing-subscription-plan-info.entity';
import { getClient, retrySerialize } from '../../db/utils';
import { env } from '../../env';
import { BillingMethodNiceCaller } from '../billing-method/billing-method-nice.caller';
import { invalidateBillingOrganization } from '../billing-organization/billing-organization.utils';
import {
  applySubscriptionPlanInfoState,
  calculatePurchaseAmountAndApplyCouponCount,
  invalidateSubscriptionPlanInfo,
} from '../billing-subscription-plan-info/billing-subscription-plan-info.utils';
import { updateCloudLicense } from '../cloud-license/cloud-license.serializables';
import { DateTimeSimulatorService } from '../date-time-simulator/date-time-simulator.service';
import { DoguLogger } from '../logger/logger';

@Injectable()
export class BillingUpdaterService implements OnModuleInit, OnModuleDestroy {
  private closeRequested = false;

  constructor(
    private readonly logger: DoguLogger,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly billingMethodNiceCaller: BillingMethodNiceCaller,
    private readonly dateTimeSimulatorService: DateTimeSimulatorService,
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
    const client = await getClient(this.dataSource);
    const query = new Cursor<Pick<BillingOrganization, 'billingOrganizationId'>>(
      `SELECT "${BillingOrganizationProp.billingOrganizationId}" FROM ${BillingOrganizationTableName} ORDER BY "${BillingOrganizationProp.createdAt}" DESC`,
    );

    while (!this.closeRequested) {
      const cursor = client.query(query);
      while (!this.closeRequested) {
        const rows = await cursor.read(1);
        if (rows.length === 0) {
          break;
        }

        const billingOrganization = rows[0];
        try {
          await this.update(billingOrganization.billingOrganizationId);
        } catch (error) {
          this.logger.error('BillingUpdaterService.run.update error', { error: errorify(error) });
        }

        if (env.DOGU_BILLING_RUN_TYPE === 'local') {
          await delay(1000);
        }
      }
    }
  }

  private async update(billingOrganizationId: string): Promise<void> {
    await retrySerialize(this.logger, this.dataSource, async (context) => {
      const { manager, registerOnAfterRollback } = context;
      const now = this.dateTimeSimulatorService.now();
      const billingOrganization = await manager
        .getRepository(BillingOrganization)
        .createQueryBuilder(BillingOrganization.name)
        .leftJoinAndSelect(`${BillingOrganization.name}.${BillingOrganizationProp.billingSubscriptionPlanInfos}`, BillingSubscriptionPlanInfo.name)
        .leftJoinAndSelect(`${BillingSubscriptionPlanInfo.name}.${BillingSubscriptionPlanInfoProp.billingCoupon}`, BillingCoupon.name)
        .leftJoinAndSelect(`${BillingOrganization.name}.${BillingOrganizationProp.billingMethodNice}`, BillingMethodNice.name)
        .where({
          billingOrganizationId,
        })
        .andWhere(
          new Brackets((qb) =>
            qb
              .where(new Brackets((qb) => qb.where({ graceExpiredAt: Not(IsNull()) }).andWhere({ graceExpiredAt: LessThan(now) })))
              .orWhere(new Brackets((qb) => qb.where({ graceNextPurchasedAt: Not(IsNull()) }).andWhere({ graceNextPurchasedAt: LessThan(now) })))
              .orWhere(
                new Brackets((qb) =>
                  qb
                    .where({ graceExpiredAt: IsNull(), graceNextPurchasedAt: IsNull() })
                    .andWhere(
                      new Brackets((qb) =>
                        qb
                          .where(new Brackets((qb) => qb.where({ subscriptionMonthlyExpiredAt: Not(IsNull()) }).andWhere({ subscriptionMonthlyExpiredAt: LessThan(now) })))
                          .orWhere(new Brackets((qb) => qb.where({ subscriptionYearlyExpiredAt: Not(IsNull()) }).andWhere({ subscriptionYearlyExpiredAt: LessThan(now) }))),
                      ),
                    ),
                ),
              ),
          ),
        )
        .getOne();
      if (!billingOrganization) {
        return;
      }

      const invalidate = async (period: BillingPeriod): Promise<void> => {
        switch (period) {
          case 'monthly': {
            billingOrganization.billingSubscriptionPlanInfos
              ?.filter((planInfo) => planInfo.period === 'monthly')
              .forEach((planInfo) => invalidateSubscriptionPlanInfo(planInfo, now));
            break;
          }
          case 'yearly': {
            billingOrganization.billingSubscriptionPlanInfos?.forEach((planInfo) => invalidateSubscriptionPlanInfo(planInfo, now));
            break;
          }
          default: {
            assertUnreachable(period);
          }
        }

        invalidateBillingOrganization(billingOrganization, period);
        await manager.save(billingOrganization);
      };

      const { billingSubscriptionPlanInfos, billingMethodNice } = billingOrganization;
      if (!billingSubscriptionPlanInfos) {
        await invalidate('yearly');
        this.logger.error('BillingUpdaterService.update billingSubscriptionPlanInfos must not be null. invalidated', { billingOrganizationId });
        return;
      }

      const bid = billingMethodNice?.bid ?? null;
      if (!billingMethodNice || !bid) {
        await invalidate('yearly');
        this.logger.error('BillingUpdaterService.update billingMethodNice must not be null. invalidated', { billingOrganizationId });
        return;
      }

      if (!billingOrganization.currency) {
        await invalidate('yearly');
        this.logger.error('BillingUpdaterService.update currency must not be null. invalidated', { billingOrganizationId });
        return;
      }

      const isMonthlyGraceExpired =
        billingOrganization.graceExpiredAt !== null &&
        billingOrganization.subscriptionMonthlyExpiredAt !== null &&
        billingOrganization.subscriptionMonthlyExpiredAt < billingOrganization.graceExpiredAt;
      const isYearlyGraceExpired =
        billingOrganization.graceExpiredAt !== null &&
        billingOrganization.subscriptionYearlyExpiredAt !== null &&
        billingOrganization.subscriptionYearlyExpiredAt < billingOrganization.graceExpiredAt;
      const isMonthlyGraceNextPurchased =
        billingOrganization.graceNextPurchasedAt !== null &&
        billingOrganization.subscriptionMonthlyExpiredAt !== null &&
        billingOrganization.subscriptionMonthlyExpiredAt < billingOrganization.graceNextPurchasedAt;
      const isYearlyGraceNextPurchased =
        billingOrganization.graceNextPurchasedAt !== null &&
        billingOrganization.subscriptionYearlyExpiredAt !== null &&
        billingOrganization.subscriptionYearlyExpiredAt < billingOrganization.graceNextPurchasedAt;
      const isMonthlyExpired =
        billingOrganization.graceExpiredAt === null && billingOrganization.graceNextPurchasedAt === null && billingOrganization.subscriptionMonthlyExpiredAt !== null;
      const isYearlyExpired =
        billingOrganization.graceExpiredAt === null && billingOrganization.graceNextPurchasedAt === null && billingOrganization.subscriptionYearlyExpiredAt !== null;
      const monthlyTriggered = isMonthlyExpired || isMonthlyGraceNextPurchased;
      const yearlyTriggered = isYearlyExpired || isYearlyGraceNextPurchased;

      if (isYearlyGraceExpired) {
        await invalidate('yearly');
        this.logger.error('BillingUpdaterService.update yearly grace expired. invalidated', { billingOrganizationId });
        return;
      }

      if (isMonthlyGraceExpired) {
        await invalidate('monthly');
        this.logger.error('BillingUpdaterService.update monthly grace expired. invalidated', { billingOrganizationId });
        return;
      }

      // apply next plan infos
      const monthlyPlanInfos = monthlyTriggered ? billingSubscriptionPlanInfos.filter((planInfo) => planInfo.period === 'monthly') : [];
      const yearlyPlanInfos = yearlyTriggered ? billingSubscriptionPlanInfos.filter((planInfo) => planInfo.period === 'yearly') : [];
      const processingPlanInfos = [...monthlyPlanInfos, ...yearlyPlanInfos];
      const appliedPlanInfos = processingPlanInfos.map((planInfo) => applySubscriptionPlanInfoState(planInfo, now));

      // apply next startd at and expired at
      const hasMonthlyPlanInfo = billingSubscriptionPlanInfos.some((planInfo) => planInfo.period === 'monthly' && planInfo.state === 'subscribed');
      if (hasMonthlyPlanInfo) {
        if (billingOrganization.subscriptionMonthlyExpiredAt !== null) {
          billingOrganization.subscriptionMonthlyStartedAt = billingOrganization.subscriptionMonthlyExpiredAt;
          billingOrganization.subscriptionMonthlyExpiredAt = createExpiredAt(NormalizedDateTime.fromDate(billingOrganization.subscriptionMonthlyStartedAt), 'monthly').date;
        } else if (billingOrganization.subscriptionYearlyExpiredAt !== null) {
          billingOrganization.subscriptionMonthlyStartedAt = billingOrganization.subscriptionYearlyExpiredAt;
          billingOrganization.subscriptionMonthlyExpiredAt = createExpiredAt(NormalizedDateTime.fromDate(billingOrganization.subscriptionMonthlyStartedAt), 'monthly').date;
        } else {
          throw new Error('subscriptionMonthlyExpiredAt or subscriptionYearlyExpiredAt must not be null');
        }
      } else {
        billingOrganization.subscriptionMonthlyStartedAt = null;
        billingOrganization.subscriptionMonthlyExpiredAt = null;
      }

      const hasYearlyPlanInfo = billingSubscriptionPlanInfos.some((planInfo) => planInfo.period === 'yearly' && planInfo.state === 'subscribed');
      if (hasYearlyPlanInfo) {
        billingOrganization.subscriptionYearlyStartedAt = billingOrganization.subscriptionYearlyExpiredAt;
        if (!billingOrganization.subscriptionYearlyStartedAt) {
          throw new Error('subscriptionYearlyStartedAt must not be null');
        }

        billingOrganization.subscriptionYearlyExpiredAt = createExpiredAt(NormalizedDateTime.fromDate(billingOrganization.subscriptionYearlyStartedAt), 'yearly').date;
      } else {
        billingOrganization.subscriptionYearlyStartedAt = null;
        billingOrganization.subscriptionYearlyExpiredAt = null;
      }

      // purchase
      const purchasePlanInfos = appliedPlanInfos.filter((planInfo) => planInfo.state === 'subscribed');
      const purchaseAmountInfos = purchasePlanInfos.map((planInfo) => calculatePurchaseAmountAndApplyCouponCount(planInfo));
      const totalPurchaseAmount = purchaseAmountInfos.reduce((acc, cur) => acc + cur.purchaseAmount, 0);

      if (totalPurchaseAmount > 0) {
        const paymentsResult = await this.billingMethodNiceCaller.subscribePayments({
          bid,
          amount: totalPurchaseAmount,
          goodsName: BillingGoodsName,
        });

        if (!paymentsResult.ok) {
          if (isMonthlyGraceNextPurchased || isYearlyGraceNextPurchased) {
            if (!billingOrganization.graceNextPurchasedAt) {
              throw new Error('graceNextPurchasedAt must not be null');
            }

            billingOrganization.graceNextPurchasedAt = DateTime.fromJSDate(billingOrganization.graceNextPurchasedAt).plus({ days: 1 }).toJSDate();
          }

          if (isMonthlyExpired) {
            if (!billingOrganization.subscriptionMonthlyExpiredAt) {
              throw new Error('subscriptionMonthlyExpiredAt must not be null');
            }

            billingOrganization.graceNextPurchasedAt = DateTime.fromJSDate(billingOrganization.subscriptionMonthlyExpiredAt).plus({ days: 1 }).toJSDate();
            billingOrganization.graceExpiredAt = DateTime.fromJSDate(billingOrganization.subscriptionMonthlyExpiredAt).plus({ days: BillingGracePeriodDays }).toJSDate();
          }

          if (isYearlyExpired) {
            if (!billingOrganization.subscriptionYearlyExpiredAt) {
              throw new Error('subscriptionYearlyExpiredAt must not be null');
            }

            billingOrganization.graceNextPurchasedAt = DateTime.fromJSDate(billingOrganization.subscriptionYearlyExpiredAt).plus({ days: 1 }).toJSDate();
            billingOrganization.graceExpiredAt = DateTime.fromJSDate(billingOrganization.subscriptionYearlyExpiredAt).plus({ days: BillingGracePeriodDays }).toJSDate();
          }

          await manager.save(billingOrganization);
          this.logger.error('BillingUpdaterService.update paymentsResult is not ok. grace updated', { billingOrganizationId, paymentsResult: stringify(paymentsResult) });
          return;
        }

        registerOnAfterRollback(async (error) => {
          await this.billingMethodNiceCaller.paymentsCancel({
            tid: paymentsResult.value.tid,
            reason: error.message,
          });
        });

        const createdHistory = manager.getRepository(BillingHistory).create({
          billingHistoryId: v4(),
          billingOrganizationId: billingOrganization.billingOrganizationId,
          purchasedAmount: totalPurchaseAmount,
          currency: billingOrganization.currency,
          goodsName: BillingGoodsName,
          method: 'nice',
          niceSubscribePaymentsResponse: paymentsResult.value as unknown as Record<string, unknown>,
          niceTid: paymentsResult.value.tid,
          niceOrderId: paymentsResult.value.orderId,
          historyType: 'periodic-purchase',
          cardCode: billingMethodNice.cardCode,
          cardName: billingMethodNice.cardName,
          cardNumberLast4Digits: billingMethodNice.cardNumberLast4Digits,
          cardExpirationYear: billingMethodNice.expirationYear,
          cardExpirationMonth: billingMethodNice.expirationMonth,
        });
        const savedHistory = await manager.save(createdHistory);

        const planHistories = purchaseAmountInfos.map((purchaseAmountInfo) => {
          const { planInfo } = purchaseAmountInfo;
          let startedAt: Date | null = null;
          let expiredAt: Date | null = null;
          switch (planInfo.period) {
            case 'monthly': {
              startedAt = billingOrganization.subscriptionMonthlyStartedAt;
              expiredAt = billingOrganization.subscriptionMonthlyExpiredAt;
              break;
            }
            case 'yearly': {
              startedAt = billingOrganization.subscriptionYearlyStartedAt;
              expiredAt = billingOrganization.subscriptionYearlyExpiredAt;
              break;
            }
            default: {
              assertUnreachable(planInfo.period);
            }
          }

          if (!startedAt || !expiredAt) {
            throw new Error('startedAt or expiredAt must not be null');
          }

          if (!billingOrganization.currency) {
            throw new Error('currency must not be null');
          }

          const planHistory = manager.getRepository(BillingSubscriptionPlanHistory).create({
            billingSubscriptionPlanHistoryId: v4(),
            billingOrganizationId: billingOrganization.billingOrganizationId,
            billingHistoryId: savedHistory.billingHistoryId,
            billingCouponId: planInfo.billingCouponId,
            billingSubscriptionPlanSourceId: planInfo.billingSubscriptionPlanSourceId,
            discountedAmount: purchaseAmountInfo.discountedAmount,
            purchasedAmount: purchaseAmountInfo.purchaseAmount,
            startedAt,
            expiredAt,
            category: billingOrganization.category,
            type: planInfo.type,
            option: planInfo.option,
            currency: billingOrganization.currency,
            period: planInfo.period,
            originPrice: planInfo.originPrice,
            historyType: 'periodic-purchase',
          });
          return planHistory;
        });
        await manager.save(planHistories);

        // apply grace
        billingOrganization.graceExpiredAt = null;
        billingOrganization.graceNextPurchasedAt = null;
      }

      // update
      if (billingOrganization.billingSubscriptionPlanInfos) {
        await manager.save(billingOrganization.billingSubscriptionPlanInfos);
      }
      await manager.save(billingOrganization);

      await updateCloudLicense(context, {
        billingOrganizationId,
        planInfos: appliedPlanInfos,
      });
    });
  }
}
