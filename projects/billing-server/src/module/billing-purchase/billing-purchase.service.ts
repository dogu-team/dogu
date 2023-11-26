import {
  BillingHistoryTypePurchase,
  BillingHistoryTypeRefund,
  CreatePurchaseSubscriptionDto,
  CreatePurchaseSubscriptionResponse,
  CreatePurchaseSubscriptionWithNewCardDto,
  CreatePurchaseSubscriptionWithNewCardResponse,
  getBillingMethodNicePublic,
  GetBillingSubscriptionPreviewDto,
  GetBillingSubscriptionPreviewResponse,
  RefundFullDto,
  RefundSubscriptionPlanDto,
  resultCode,
} from '@dogu-private/console';
import { stringify } from '@dogu-tech/common';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, In } from 'typeorm';
import { v4 } from 'uuid';
import { BillingHistory } from '../../db/entity/billing-history.entity';
import { BillingOrganization } from '../../db/entity/billing-organization.entity';
import { BillingSubscriptionPlanHistory } from '../../db/entity/billing-subscription-plan-history.entity';
import { BillingSubscriptionPlanInfo } from '../../db/entity/billing-subscription-plan-info.entity';
import { RetryTransaction } from '../../db/retry-transaction';
import { createOrUpdateMethodNice } from '../billing-method/billing-method-nice.serializables';
import { BillingMethodPaddleService } from '../billing-method/billing-method-paddle.service';
import { findBillingOrganizationWithMethodAndSubscriptionPlans, findBillingOrganizationWithSubscriptionPlans } from '../billing-organization/billing-organization.serializables';
import { BillingOrganizationService } from '../billing-organization/billing-organization.service';
import { invalidateSubscriptionPlanInfo } from '../billing-subscription-plan-info/billing-subscription-plan-info.utils';
import { ConsoleService } from '../console/console.service';
import { DateTimeSimulatorService } from '../date-time-simulator/date-time-simulator.service';
import { DoguLogger } from '../logger/logger';
import { NiceCaller } from '../nice/nice.caller';
import { PaddleService } from '../paddle/paddle.service';
import { SlackService } from '../slack/slack.service';
import { processNextPurchaseSubscription, processNowPurchaseSubscription, processPurchaseSubscriptionPreview } from './billing-purchase.serializables';

@Injectable()
export class BillingPurchaseService {
  private readonly retryTransaction: RetryTransaction;

  constructor(
    private readonly logger: DoguLogger,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly niceCaller: NiceCaller,
    private readonly consoleService: ConsoleService,
    private readonly slackService: SlackService,
    private readonly dateTimeSimulatorService: DateTimeSimulatorService,
    private readonly billingOrganizationService: BillingOrganizationService,
    private readonly billingMethodPaddleService: BillingMethodPaddleService,
    private readonly paddleService: PaddleService,
  ) {
    this.retryTransaction = new RetryTransaction(this.logger, this.dataSource);
  }

  async getSubscriptionPreview(dto: GetBillingSubscriptionPreviewDto): Promise<GetBillingSubscriptionPreviewResponse> {
    return await this.retryTransaction.serializable(async (context) => {
      const now = this.dateTimeSimulatorService.now();
      const billingOrganization = await findBillingOrganizationWithSubscriptionPlans(context, dto);
      if (!billingOrganization) {
        return {
          ok: false,
          resultCode: resultCode('organization-not-found'),
        };
      }

      const processPreviewResult = await processPurchaseSubscriptionPreview(context, {
        billingOrganization,
        dto,
        now,
      });
      if (!processPreviewResult.ok) {
        return {
          ok: false,
          resultCode: processPreviewResult.resultCode,
        };
      }

      const { value } = processPreviewResult;
      return value.previewResponse;
    });
  }

  async createPurchaseSubscription(dto: CreatePurchaseSubscriptionDto): Promise<CreatePurchaseSubscriptionResponse> {
    return await this.retryTransaction.serializable(async (context) => {
      const { setTriggerRollbackBeforeReturn } = context;
      const now = this.dateTimeSimulatorService.now();
      const billingOrganization = await findBillingOrganizationWithMethodAndSubscriptionPlans(context, dto);
      if (!billingOrganization) {
        return {
          ok: false,
          resultCode: resultCode('organization-not-found', {
            organizationId: dto.organizationId,
          }),
          plan: null,
          license: null,
          niceResultCode: null,
        };
      }

      const { billingMethodNice } = billingOrganization;
      if (!billingMethodNice) {
        return {
          ok: false,
          resultCode: resultCode('organization-method-nice-not-found', {
            billingOrganization: billingOrganization.billingOrganizationId,
          }),
          plan: null,
          license: null,
          niceResultCode: null,
        };
      }

      const processPreviewResult = await processPurchaseSubscriptionPreview(context, {
        billingOrganization,
        dto,
        now,
      });
      if (!processPreviewResult.ok) {
        return {
          ok: false,
          resultCode: processPreviewResult.resultCode,
          plan: null,
          license: null,
          niceResultCode: null,
        };
      }

      const { needPurchase } = processPreviewResult.value;
      if (!needPurchase) {
        const processNextResult = await processNextPurchaseSubscription(context, {
          billingOrganization,
          ...processPreviewResult.value,
        });
        if (!processNextResult.ok) {
          return {
            ok: false,
            resultCode: processNextResult.resultCode,
            plan: null,
            license: null,
            niceResultCode: null,
          };
        }

        return {
          ok: true,
          resultCode: resultCode('ok'),
          plan: processNextResult.value,
          license: null,
          niceResultCode: null,
        };
      }

      const processNowResult = await processNowPurchaseSubscription(context, this.niceCaller, {
        billingMethodNice,
        billingOrganization,
        ...processPreviewResult.value,
      });

      if (!processNowResult.ok) {
        setTriggerRollbackBeforeReturn();
        this.slackService
          .sendPurchaseSlackMessage({
            organizationId: dto.organizationId,
            isSucceeded: false,
            purchasedAt: processNowResult.planHistory?.createdAt ?? new Date(),
            plans: [
              {
                option: processNowResult.plan?.option ?? dto.option,
                type: processNowResult.plan?.type ?? dto.type,
              },
            ],
          })
          .catch((err) => this.logger.error(`Failed to send slack. organizationId: ${dto.organizationId}`));
        return {
          ok: false,
          resultCode: processNowResult.resultCode,
          plan: null,
          license: null,
          niceResultCode: processNowResult.niceResultCode,
        };
      }

      // success
      if (processNowResult.planHistory && processNowResult.plan) {
        this.slackService
          .sendPurchaseSlackMessage({
            organizationId: dto.organizationId,
            historyId: processNowResult.planHistory.billingHistoryId,
            isSucceeded: true,
            amount: processNowResult.planHistory.purchasedAmount ?? 0,
            currency: processNowResult.planHistory.currency,
            purchasedAt: processNowResult.planHistory.createdAt,
            plans: [
              {
                option: processNowResult.plan.option,
                type: processNowResult.plan.type,
              },
            ],
          })
          .catch((err) => this.logger.error(`Failed to send slack. organizationId: ${dto.organizationId}`));
        this.consoleService
          .sendSubscriptionSuccessEmailToOwner(dto.organizationId, {
            planHistory: processNowResult.planHistory,
            plan: processNowResult.plan,
          })
          .catch((err) => this.logger.error(`Failed to send email to organization owner: organizationId: ${dto.organizationId}`));
      }

      return {
        ok: processNowResult.ok,
        resultCode: processNowResult.resultCode,
        plan: processNowResult.plan,
        license: processNowResult.license,
        niceResultCode: null,
      };
    });
  }

  async createPurchaseSubscriptionWithNewCard(dto: CreatePurchaseSubscriptionWithNewCardDto): Promise<CreatePurchaseSubscriptionWithNewCardResponse> {
    return await this.retryTransaction.serializable(async (context) => {
      const { setTriggerRollbackBeforeReturn } = context;
      const { registerCard } = dto;
      const now = this.dateTimeSimulatorService.now();
      const billingOrganization = await findBillingOrganizationWithMethodAndSubscriptionPlans(context, dto);
      if (!billingOrganization) {
        return {
          ok: false,
          resultCode: resultCode('organization-not-found'),
          plan: null,
          method: null,
          license: null,
          niceResultCode: null,
        };
      }
      const { billingOrganizationId } = billingOrganization;

      const processPreviewResult = await processPurchaseSubscriptionPreview(context, {
        billingOrganization,
        dto,
        now,
      });
      if (!processPreviewResult.ok) {
        return {
          ok: false,
          resultCode: processPreviewResult.resultCode,
          plan: null,
          method: null,
          license: null,
          niceResultCode: null,
        };
      }
      const { needPurchase } = processPreviewResult.value;

      const niceResult = await createOrUpdateMethodNice(context, {
        niceCaller: this.niceCaller,
        dto: {
          billingOrganizationId,
          subscribeRegist: {
            registerCard,
          },
        },
        now,
      });

      if (!niceResult.ok) {
        setTriggerRollbackBeforeReturn();
        return {
          ok: false,
          resultCode: niceResult.resultCode,
          plan: null,
          method: null,
          license: null,
          niceResultCode: niceResult.niceResultCode,
        };
      }

      const { value: billingMethodNice } = niceResult;

      const method = getBillingMethodNicePublic(billingMethodNice);
      if (!needPurchase) {
        const processNextResult = await processNextPurchaseSubscription(context, {
          billingOrganization,
          ...processPreviewResult.value,
        });

        if (!processNextResult.ok) {
          return {
            ok: false,
            resultCode: processNextResult.resultCode,
            plan: null,
            license: null,
            method,
            niceResultCode: null,
          };
        }

        return {
          ok: true,
          resultCode: resultCode('ok'),
          plan: processNextResult.value,
          license: null,
          method,
          niceResultCode: null,
        };
      }

      billingOrganization.billingMethodNice = billingMethodNice;
      const processNowResult = await processNowPurchaseSubscription(context, this.niceCaller, {
        billingMethodNice,
        billingOrganization,
        ...processPreviewResult.value,
      });

      if (!processNowResult.ok) {
        setTriggerRollbackBeforeReturn();
        this.slackService
          .sendPurchaseSlackMessage({
            organizationId: dto.organizationId,
            isSucceeded: false,
            purchasedAt: processNowResult.planHistory?.createdAt ?? new Date(),
            plans: [
              {
                option: processNowResult.plan?.option ?? dto.option,
                type: processNowResult.plan?.type ?? dto.type,
              },
            ],
          })
          .catch((err) => this.logger.error(`Failed to send slack. organizationId: ${dto.organizationId}`));
        return {
          ok: false,
          resultCode: processNowResult.resultCode,
          plan: null,
          license: null,
          method: null,
          niceResultCode: processNowResult.niceResultCode,
        };
      }

      // success
      if (processNowResult.planHistory && processNowResult.plan) {
        this.consoleService
          .sendSubscriptionSuccessEmailToOwner(dto.organizationId, {
            planHistory: processNowResult.planHistory,
            plan: processNowResult.plan,
          })
          .catch((err) => this.logger.error(`Failed to send email to organization owner: organizationId: ${dto.organizationId}`));
        this.slackService
          .sendPurchaseSlackMessage({
            isSucceeded: true,
            organizationId: dto.organizationId,
            amount: processNowResult.planHistory.purchasedAmount ?? 0,
            currency: processNowResult.planHistory.currency,
            purchasedAt: processNowResult.planHistory.createdAt,
            historyId: processNowResult.planHistory.billingHistoryId,
            plans: [
              {
                option: processNowResult.plan.option,
                type: processNowResult.plan.type,
              },
            ],
          })
          .catch((err) => this.logger.error(`Failed to send slack. organizationId: ${dto.organizationId}`));
      }

      return {
        ok: processNowResult.ok,
        resultCode: processNowResult.resultCode,
        plan: processNowResult.plan,
        license: processNowResult.license,
        method,
        niceResultCode: null,
      };
    });
  }

  async refundSubscriptionPlan(dto: RefundSubscriptionPlanDto): Promise<void> {
    return await this.retryTransaction.serializable(async (context) => {
      const { manager } = context;
      const { billingSubscriptionPlanHistoryId } = dto;
      const planHistory = await manager.getRepository(BillingSubscriptionPlanHistory).findOne({
        where: {
          billingSubscriptionPlanHistoryId,
          historyType: In(BillingHistoryTypePurchase),
        },
        relations: {
          billingHistory: true,
        },
      });

      const linked = await manager.getRepository(BillingSubscriptionPlanInfo).findOne({
        where: {
          billingSubscriptionPlanHistoryId,
        },
        lock: {
          mode: 'pessimistic_write',
        },
      });

      if (!linked) {
        throw new Error(`expired: ${billingSubscriptionPlanHistoryId}`);
      }

      const refunded = await manager.getRepository(BillingSubscriptionPlanHistory).findOne({
        where: {
          purchasedBillingSubscriptionPlanHistoryId: billingSubscriptionPlanHistoryId,
          historyType: In(BillingHistoryTypeRefund),
        },
      });

      if (refunded) {
        throw new Error(`already refunded: ${billingSubscriptionPlanHistoryId}`);
      }

      if (!planHistory) {
        throw new Error(`plan history not found: ${billingSubscriptionPlanHistoryId}`);
      }

      const { billingHistory } = planHistory;
      if (!billingHistory) {
        throw new Error(`billing history not found: ${billingSubscriptionPlanHistoryId}`);
      }

      const { niceTid, niceOrderId } = billingHistory;
      if (!niceTid) {
        throw new Error(`nice tid not found: ${billingSubscriptionPlanHistoryId}`);
      }

      if (!niceOrderId) {
        throw new Error(`nice order id not found: ${billingSubscriptionPlanHistoryId}`);
      }

      const { purchasedAmount } = planHistory;
      if (!purchasedAmount) {
        throw new Error(`purchased amount not found: ${billingSubscriptionPlanHistoryId}`);
      }

      const cancelReason = `dogu refund subscription plan: ${billingSubscriptionPlanHistoryId}`;
      const cancelResult = await this.niceCaller.paymentsCancel({
        tid: niceTid,
        reason: cancelReason,
        cancelAmt: purchasedAmount,
      });

      if (!cancelResult.ok) {
        throw new Error(`cancel failed: ${billingSubscriptionPlanHistoryId} ${stringify(cancelResult.resultCode)}`);
      }

      const { value: response } = cancelResult;
      const newHistory = manager.getRepository(BillingHistory).create({
        billingHistoryId: v4(),
        billingOrganizationId: billingHistory.billingOrganizationId,
        currency: billingHistory.currency,
        goodsName: billingHistory.goodsName,
        method: billingHistory.method,
        niceTid: response.tid,
        niceOrderId: response.orderId,
        cancelReason: cancelReason,
        nicePaymentsCancelResponse: response as unknown as Record<string, unknown>,
        historyType: 'partial-refund',
        purchasedBillingHistoryId: billingHistory.billingHistoryId,
        refundedAmount: planHistory.purchasedAmount,
      });
      const savedNewHistory = await manager.getRepository(BillingHistory).save(newHistory);

      const newPlanHistory = manager.getRepository(BillingSubscriptionPlanHistory).create({
        billingSubscriptionPlanHistoryId: v4(),
        billingOrganizationId: billingHistory.billingOrganizationId,
        billingHistoryId: savedNewHistory.billingHistoryId,
        category: planHistory.category,
        type: planHistory.type,
        option: planHistory.option,
        currency: planHistory.currency,
        period: planHistory.period,
        historyType: 'partial-refund',
        purchasedBillingSubscriptionPlanHistoryId: planHistory.billingSubscriptionPlanHistoryId,
        refundedAmount: planHistory.purchasedAmount,
      });
      await manager.getRepository(BillingSubscriptionPlanHistory).save(newPlanHistory);

      const now = this.dateTimeSimulatorService.now();
      const unlinked = invalidateSubscriptionPlanInfo(linked, now);
      await manager.getRepository(BillingSubscriptionPlanInfo).save(unlinked);
    });
  }

  async refundFull(dto: RefundFullDto): Promise<void> {
    return await this.retryTransaction.serializable(async (context) => {
      const { manager } = context;
      const { billingHistoryId } = dto;
      const billingHistory = await manager.getRepository(BillingHistory).findOne({
        where: {
          billingHistoryId,
          historyType: In(BillingHistoryTypePurchase),
        },
        relations: {
          billingSubscriptionPlanHistories: true,
        },
      });

      if (!billingHistory) {
        throw new Error(`billing history not found: ${billingHistoryId}`);
      }

      const { niceTid, niceOrderId } = billingHistory;
      if (!niceTid) {
        throw new Error(`nice tid not found: ${billingHistoryId}`);
      }

      if (!niceOrderId) {
        throw new Error(`nice order id not found: ${billingHistoryId}`);
      }

      const cancelReason = `dogu refund full: ${billingHistoryId}`;
      const cancelResult = await this.niceCaller.paymentsCancel({
        tid: niceTid,
        reason: cancelReason,
      });

      if (!cancelResult.ok) {
        throw new Error(`cancel failed: ${billingHistoryId} ${stringify(cancelResult.resultCode)}`);
      }

      const { value: response } = cancelResult;
      const newHistory = manager.getRepository(BillingHistory).create({
        billingHistoryId: v4(),
        billingOrganizationId: billingHistory.billingOrganizationId,
        currency: billingHistory.currency,
        goodsName: billingHistory.goodsName,
        method: billingHistory.method,
        niceTid: response.tid,
        niceOrderId: response.orderId,
        cancelReason: cancelReason,
        nicePaymentsCancelResponse: response as unknown as Record<string, unknown>,
        historyType: 'full-refund',
        purchasedBillingHistoryId: billingHistory.billingHistoryId,
        refundedAmount: billingHistory.purchasedAmount,
      });
      const savedNewHistory = await manager.getRepository(BillingHistory).save(newHistory);

      const planHistories = billingHistory.billingSubscriptionPlanHistories ?? [];
      for (const planHistory of planHistories) {
        const newPlanHistory = manager.getRepository(BillingSubscriptionPlanHistory).create({
          billingSubscriptionPlanHistoryId: v4(),
          billingOrganizationId: billingHistory.billingOrganizationId,
          billingHistoryId: savedNewHistory.billingHistoryId,
          category: planHistory.category,
          type: planHistory.type,
          option: planHistory.option,
          currency: planHistory.currency,
          period: planHistory.period,
          historyType: 'full-refund',
          purchasedBillingSubscriptionPlanHistoryId: planHistory.billingSubscriptionPlanHistoryId,
          refundedAmount: planHistory.purchasedAmount,
          originPrice: planHistory.originPrice,
        });

        await manager.getRepository(BillingSubscriptionPlanHistory).save(newPlanHistory);

        const linked = await manager.getRepository(BillingSubscriptionPlanInfo).findOne({
          where: {
            billingSubscriptionPlanHistoryId: planHistory.billingSubscriptionPlanHistoryId,
          },
          lock: {
            mode: 'pessimistic_write',
          },
        });

        if (linked) {
          const now = this.dateTimeSimulatorService.now();
          const unlinked = invalidateSubscriptionPlanInfo(linked, now);
          await manager.getRepository(BillingSubscriptionPlanInfo).save(unlinked);
        }

        const billingOrganization = await manager.getRepository(BillingOrganization).findOne({
          where: {
            billingOrganizationId: billingHistory.billingOrganizationId,
          },
          relations: {
            billingSubscriptionPlanInfos: true,
          },
          lock: {
            mode: 'pessimistic_write',
          },
        });

        if (billingOrganization) {
          const hasMonthlySubscription =
            (billingOrganization.billingSubscriptionPlanInfos?.filter((info) => info.period === 'monthly').filter((info) => info.state !== 'unsubscribed').length ?? 0) > 0;
          if (!hasMonthlySubscription) {
            billingOrganization.subscriptionMonthlyStartedAt = null;
            billingOrganization.subscriptionMonthlyExpiredAt = null;
          }

          const hasYearlySubscription =
            (billingOrganization.billingSubscriptionPlanInfos?.filter((info) => info.period === 'yearly').filter((info) => info.state !== 'unsubscribed').length ?? 0) > 0;
          if (!hasYearlySubscription) {
            billingOrganization.subscriptionYearlyStartedAt = null;
            billingOrganization.subscriptionYearlyExpiredAt = null;
          }

          if (!hasMonthlySubscription && !hasYearlySubscription) {
            billingOrganization.graceNextPurchasedAt = null;
            billingOrganization.graceExpiredAt = null;
          }

          await manager.getRepository(BillingOrganization).save(billingOrganization);
        }
      }
    });
  }
}
