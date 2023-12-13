import { BillingGoodsName, BillingGracePeriodDays, BillingOrganizationProp, BillingPeriod, BillingPlanInfoProp } from '@dogu-private/console';
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
import { BillingPlanHistory } from '../../db/entity/billing-plan-history.entity';
import { BillingPlanInfo } from '../../db/entity/billing-plan-info.entity';
import { getClient, RetryTransaction } from '../../db/utils';
import { env } from '../../env';
import { invalidateBillingOrganization } from '../billing-organization/billing-organization.utils';
import { applyPlanInfoState, calculatePurchaseAmountAndApplyCouponCount, invalidatePlanInfo } from '../billing-plan-info/billing-plan-info.utils';
import { updateCloudLicense } from '../cloud-license/cloud-license.serializables';
import { DateTimeSimulatorService } from '../date-time-simulator/date-time-simulator.service';
import { DoguLogger } from '../logger/logger';
import { NiceCaller } from '../nice/nice.caller';

@Injectable()
export class BillingUpdaterService implements OnModuleInit, OnModuleDestroy {
  private closeRequested = false;
  private readonly retryTransaction: RetryTransaction;

  constructor(
    private readonly logger: DoguLogger,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly niceCaller: NiceCaller,
    private readonly dateTimeSimulatorService: DateTimeSimulatorService,
  ) {
    this.retryTransaction = new RetryTransaction(this.logger, this.dataSource);
  }

  onModuleInit(): void {
    this.run()
      .then(() => {
        this.logger.info('BillingUpdaterService.run closed');
      })
      .catch((error) => {
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
    await this.retryTransaction.serializable(async (context) => {
      const { manager, registerOnAfterRollback } = context;
      const now = this.dateTimeSimulatorService.now();
      const billingOrganization = await manager
        .getRepository(BillingOrganization)
        .createQueryBuilder(BillingOrganization.name)
        .leftJoinAndSelect(`${BillingOrganization.name}.${BillingOrganizationProp.billingPlanInfos}`, BillingPlanInfo.name)
        .leftJoinAndSelect(`${BillingPlanInfo.name}.${BillingPlanInfoProp.billingCoupon}`, BillingCoupon.name)
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
            billingOrganization.billingPlanInfos?.filter((planInfo) => planInfo.period === 'monthly').forEach((planInfo) => invalidatePlanInfo(planInfo, now));
            break;
          }
          case 'yearly': {
            billingOrganization.billingPlanInfos?.forEach((planInfo) => invalidatePlanInfo(planInfo, now));
            break;
          }
          default: {
            assertUnreachable(period);
          }
        }

        invalidateBillingOrganization(billingOrganization, period);
        await manager.save(billingOrganization);
        if (billingOrganization.billingPlanInfos) {
          await manager.save(billingOrganization.billingPlanInfos);
        }
      };

      const { billingMethod, billingPlanInfos, billingMethodNice } = billingOrganization;
      if (billingMethod !== 'nice') {
        this.logger.info('BillingUpdaterService.update billingMethod is not nice. skipped', { billingOrganizationId, now });
        return;
      }

      if (!billingPlanInfos) {
        await invalidate('yearly');
        this.logger.error('BillingUpdaterService.update billingPlanInfos must not be null. invalidated', { billingOrganizationId, now });
        return;
      }

      const bid = billingMethodNice?.bid ?? null;
      if (!billingMethodNice || !bid) {
        await invalidate('yearly');
        this.logger.error('BillingUpdaterService.update billingMethodNice must not be null. invalidated', { billingOrganizationId, now });
        return;
      }

      if (!billingOrganization.currency) {
        await invalidate('yearly');
        this.logger.error('BillingUpdaterService.update currency must not be null. invalidated', { billingOrganizationId, now });
        return;
      }

      const isMonthlyGraceExpired =
        billingOrganization.graceExpiredAt !== null &&
        billingOrganization.graceExpiredAt < now &&
        billingOrganization.subscriptionMonthlyExpiredAt !== null &&
        billingOrganization.subscriptionMonthlyExpiredAt < billingOrganization.graceExpiredAt;
      const isYearlyGraceExpired =
        billingOrganization.graceExpiredAt !== null &&
        billingOrganization.graceExpiredAt < now &&
        billingOrganization.subscriptionYearlyExpiredAt !== null &&
        billingOrganization.subscriptionYearlyExpiredAt < billingOrganization.graceExpiredAt;
      const isMonthlyGraceNextPurchased =
        billingOrganization.graceNextPurchasedAt !== null &&
        billingOrganization.graceNextPurchasedAt < now &&
        billingOrganization.subscriptionMonthlyExpiredAt !== null &&
        billingOrganization.subscriptionMonthlyExpiredAt < billingOrganization.graceNextPurchasedAt;
      const isYearlyGraceNextPurchased =
        billingOrganization.graceNextPurchasedAt !== null &&
        billingOrganization.graceNextPurchasedAt < now &&
        billingOrganization.subscriptionYearlyExpiredAt !== null &&
        billingOrganization.subscriptionYearlyExpiredAt < billingOrganization.graceNextPurchasedAt;
      const isMonthlyExpired =
        billingOrganization.graceExpiredAt === null && billingOrganization.graceNextPurchasedAt === null && billingOrganization.subscriptionMonthlyExpiredAt !== null;
      const isYearlyExpired =
        billingOrganization.graceExpiredAt === null && billingOrganization.graceNextPurchasedAt === null && billingOrganization.subscriptionYearlyExpiredAt !== null;
      this.logger.info('BillingUpdaterService.update', {
        billingOrganizationId,
        now,
        isMonthlyGraceExpired,
        isYearlyGraceExpired,
        isMonthlyGraceNextPurchased,
        isYearlyGraceNextPurchased,
        isMonthlyExpired,
        isYearlyExpired,
      });

      const monthlyTriggered = isMonthlyExpired || isMonthlyGraceNextPurchased;
      const yearlyTriggered = isYearlyExpired || isYearlyGraceNextPurchased;

      if (isYearlyGraceExpired) {
        await invalidate('yearly');
        this.logger.error('BillingUpdaterService.update yearly grace expired. invalidated', { billingOrganizationId, now });
        return;
      }

      if (isMonthlyGraceExpired) {
        await invalidate('monthly');
        this.logger.error('BillingUpdaterService.update monthly grace expired. invalidated', { billingOrganizationId, now });
        return;
      }

      // apply next plan infos
      const monthlyPlanInfos = monthlyTriggered ? billingPlanInfos.filter((planInfo) => planInfo.period === 'monthly') : [];
      const yearlyPlanInfos = yearlyTriggered ? billingPlanInfos.filter((planInfo) => planInfo.period === 'yearly') : [];
      const processingPlanInfos = [...monthlyPlanInfos, ...yearlyPlanInfos];
      const appliedPlanInfos = processingPlanInfos.map((planInfo) => applyPlanInfoState(planInfo, now));

      // next started at, expired at
      let subscriptionMonthlyStartedAt = billingOrganization.subscriptionMonthlyStartedAt;
      let subscriptionMonthlyExpiredAt = billingOrganization.subscriptionMonthlyExpiredAt;
      let subscriptionYearlyStartedAt = billingOrganization.subscriptionYearlyStartedAt;
      let subscriptionYearlyExpiredAt = billingOrganization.subscriptionYearlyExpiredAt;
      const hasMonthlyPlanInfo = billingPlanInfos.some((planInfo) => planInfo.period === 'monthly' && planInfo.state === 'subscribed');
      if (hasMonthlyPlanInfo) {
        if (subscriptionMonthlyExpiredAt !== null) {
          subscriptionMonthlyStartedAt = subscriptionMonthlyExpiredAt;
          subscriptionMonthlyExpiredAt = createExpiredAt(NormalizedDateTime.fromDate(subscriptionMonthlyStartedAt), 'monthly').date;
        } else if (subscriptionYearlyExpiredAt !== null) {
          subscriptionMonthlyStartedAt = subscriptionYearlyExpiredAt;
          subscriptionMonthlyExpiredAt = createExpiredAt(NormalizedDateTime.fromDate(subscriptionMonthlyStartedAt), 'monthly').date;
        } else {
          throw new Error('subscriptionMonthlyExpiredAt or subscriptionYearlyExpiredAt must not be null');
        }
      } else {
        subscriptionMonthlyStartedAt = null;
        subscriptionMonthlyExpiredAt = null;
      }

      const hasYearlyPlanInfo = billingPlanInfos.some((planInfo) => planInfo.period === 'yearly' && planInfo.state === 'subscribed');
      if (hasYearlyPlanInfo) {
        subscriptionYearlyStartedAt = subscriptionYearlyExpiredAt;
        if (!subscriptionYearlyStartedAt) {
          throw new Error('subscriptionYearlyStartedAt must not be null');
        }

        subscriptionYearlyExpiredAt = createExpiredAt(NormalizedDateTime.fromDate(subscriptionYearlyStartedAt), 'yearly').date;
      } else {
        subscriptionYearlyStartedAt = null;
        subscriptionYearlyExpiredAt = null;
      }

      // purchase
      const purchasePlanInfos = appliedPlanInfos.filter((planInfo) => planInfo.state === 'subscribed');
      const purchaseAmountInfos = purchasePlanInfos.map((planInfo) => calculatePurchaseAmountAndApplyCouponCount(planInfo));
      const totalPurchaseAmount = purchaseAmountInfos.reduce((acc, cur) => acc + cur.purchaseAmount, 0);

      const paymentsResult = await this.niceCaller.subscribePayments({
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
        this.logger.error('BillingUpdaterService.update paymentsResult is not ok. grace updated', { billingOrganizationId, now, paymentsResult: stringify(paymentsResult) });
        return;
      }

      registerOnAfterRollback(async (error) => {
        await this.niceCaller.paymentsCancel({
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
            startedAt = subscriptionMonthlyStartedAt;
            expiredAt = subscriptionMonthlyExpiredAt;
            break;
          }
          case 'yearly': {
            startedAt = subscriptionYearlyStartedAt;
            expiredAt = subscriptionYearlyExpiredAt;
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

        const planHistory = manager.getRepository(BillingPlanHistory).create({
          billingPlanHistoryId: v4(),
          billingOrganizationId: billingOrganization.billingOrganizationId,
          billingHistoryId: savedHistory.billingHistoryId,
          billingCouponId: planInfo.billingCouponId,
          billingPlanSourceId: planInfo.billingPlanSourceId,
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

      // update
      billingOrganization.subscriptionMonthlyStartedAt = subscriptionMonthlyStartedAt;
      billingOrganization.subscriptionMonthlyExpiredAt = subscriptionMonthlyExpiredAt;
      billingOrganization.subscriptionYearlyStartedAt = subscriptionYearlyStartedAt;
      billingOrganization.subscriptionYearlyExpiredAt = subscriptionYearlyExpiredAt;
      if (billingOrganization.billingPlanInfos) {
        await manager.save(billingOrganization.billingPlanInfos);
      }
      await manager.save(billingOrganization);

      await updateCloudLicense(context, {
        billingOrganizationId,
        planInfos: appliedPlanInfos,
      });
    });
  }
}
