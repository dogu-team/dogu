import {
  BillingHistoryTypePurchase,
  BillingHistoryTypeRefund,
  CreatePurchaseDto,
  CreatePurchaseResponse,
  CreatePurchaseWithNewCardDto,
  CreatePurchaseWithNewCardResponse,
  getBillingMethodNicePublic,
  GetBillingPreviewDto,
  GetBillingPreviewResponse,
  PrecheckoutDto,
  PrecheckoutResponse,
  RefundFullDto,
  RefundPlanDto,
  resultCode,
} from '@dogu-private/console';
import { stringify } from '@dogu-tech/common';
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, In } from 'typeorm';
import { v4 } from 'uuid';
import { BillingHistory } from '../../db/entity/billing-history.entity';
import { BillingOrganization } from '../../db/entity/billing-organization.entity';
import { BillingPlanHistory } from '../../db/entity/billing-plan-history.entity';
import { BillingPlanInfo } from '../../db/entity/billing-plan-info.entity';
import { RetryTransaction } from '../../db/retry-transaction';
import { validateCoupon } from '../billing-coupon/billing-coupon.serializables';
import { BillingCouponService } from '../billing-coupon/billing-coupon.service';
import { createOrUpdateMethodNice } from '../billing-method/billing-method-nice.serializables';
import { BillingMethodPaddleService } from '../billing-method/billing-method-paddle.service';
import { findBillingOrganizationWithMethodAndPlans, findBillingOrganizationWithPlans } from '../billing-organization/billing-organization.serializables';
import { BillingOrganizationService } from '../billing-organization/billing-organization.service';
import { invalidatePlanInfo } from '../billing-plan-info/billing-plan-info.utils';
import { BillingPlanSourceService } from '../billing-plan-source/billing-plan-source.service';
import { ConsoleService } from '../console/console.service';
import { DateTimeSimulatorService } from '../date-time-simulator/date-time-simulator.service';
import { DoguLogger } from '../logger/logger';
import { NiceCaller } from '../nice/nice.caller';
import { PaddleCaller } from '../paddle/paddle.caller';
import { SlackService } from '../slack/slack.service';
import { processNextPurchase, processNowPurchase, processPurchasePreview } from './billing-purchase.serializables';

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
    private readonly paddleCaller: PaddleCaller,
    private readonly billingPlanSourceService: BillingPlanSourceService,
    private readonly billingCouponService: BillingCouponService,
  ) {
    this.retryTransaction = new RetryTransaction(this.logger, this.dataSource);
  }

  async getPreview(dto: GetBillingPreviewDto): Promise<GetBillingPreviewResponse> {
    return await this.retryTransaction.serializable(async (context) => {
      const now = this.dateTimeSimulatorService.now();
      const billingOrganization = await findBillingOrganizationWithPlans(context, dto);
      if (!billingOrganization) {
        return {
          ok: false,
          resultCode: resultCode('organization-not-found'),
        };
      }

      const processPreviewResult = await processPurchasePreview(context, {
        billingOrganization,
        previewOptions: dto,
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

  async createPurchase(dto: CreatePurchaseDto): Promise<CreatePurchaseResponse> {
    return await this.retryTransaction.serializable(async (context) => {
      const { setTriggerRollbackBeforeReturn } = context;
      const now = this.dateTimeSimulatorService.now();
      const billingOrganization = await findBillingOrganizationWithMethodAndPlans(context, dto);
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

      const processPreviewResult = await processPurchasePreview(context, {
        billingOrganization,
        previewOptions: dto,
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

      const { needPurchase, planSource } = processPreviewResult.value;
      if (!needPurchase) {
        const processNextResult = await processNextPurchase(context, {
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

      const processNowResult = await processNowPurchase(context, {
        niceCaller: this.niceCaller,
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
                option: processNowResult.plan?.option ?? planSource.option,
                type: processNowResult.plan?.type ?? planSource.type,
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

  async createPurchaseWithNewCard(dto: CreatePurchaseWithNewCardDto): Promise<CreatePurchaseWithNewCardResponse> {
    return await this.retryTransaction.serializable(async (context) => {
      const { setTriggerRollbackBeforeReturn } = context;
      const { registerCard } = dto;
      const now = this.dateTimeSimulatorService.now();
      const billingOrganization = await findBillingOrganizationWithMethodAndPlans(context, dto);
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

      const processPreviewResult = await processPurchasePreview(context, {
        billingOrganization,
        previewOptions: dto,
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
      const { needPurchase, planSource } = processPreviewResult.value;

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
        const processNextResult = await processNextPurchase(context, {
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
      const processNowResult = await processNowPurchase(context, {
        niceCaller: this.niceCaller,
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
                option: processNowResult.plan?.option ?? planSource.option,
                type: processNowResult.plan?.type ?? planSource.type,
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

  async refundPlan(dto: RefundPlanDto): Promise<void> {
    return await this.retryTransaction.serializable(async (context) => {
      const { manager } = context;
      const { billingPlanHistoryId } = dto;
      const planHistory = await manager.getRepository(BillingPlanHistory).findOne({
        where: {
          billingPlanHistoryId,
          historyType: In(BillingHistoryTypePurchase),
        },
        relations: {
          billingHistory: true,
        },
      });

      const linked = await manager.getRepository(BillingPlanInfo).findOne({
        where: {
          billingPlanHistoryId,
        },
        lock: {
          mode: 'pessimistic_write',
        },
      });

      if (!linked) {
        throw new Error(`expired: ${billingPlanHistoryId}`);
      }

      const refunded = await manager.getRepository(BillingPlanHistory).findOne({
        where: {
          purchasedBillingPlanHistoryId: billingPlanHistoryId,
          historyType: In(BillingHistoryTypeRefund),
        },
      });

      if (refunded) {
        throw new Error(`already refunded: ${billingPlanHistoryId}`);
      }

      if (!planHistory) {
        throw new Error(`plan history not found: ${billingPlanHistoryId}`);
      }

      const { billingHistory } = planHistory;
      if (!billingHistory) {
        throw new Error(`billing history not found: ${billingPlanHistoryId}`);
      }

      const { niceTid, niceOrderId } = billingHistory;
      if (!niceTid) {
        throw new Error(`nice tid not found: ${billingPlanHistoryId}`);
      }

      if (!niceOrderId) {
        throw new Error(`nice order id not found: ${billingPlanHistoryId}`);
      }

      const { purchasedAmount } = planHistory;
      if (!purchasedAmount) {
        throw new Error(`purchased amount not found: ${billingPlanHistoryId}`);
      }

      const cancelReason = `dogu refund subscription plan: ${billingPlanHistoryId}`;
      const cancelResult = await this.niceCaller.paymentsCancel({
        tid: niceTid,
        reason: cancelReason,
        cancelAmt: purchasedAmount,
      });

      if (!cancelResult.ok) {
        throw new Error(`cancel failed: ${billingPlanHistoryId} ${stringify(cancelResult.resultCode)}`);
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

      const newPlanHistory = manager.getRepository(BillingPlanHistory).create({
        billingPlanHistoryId: v4(),
        billingOrganizationId: billingHistory.billingOrganizationId,
        billingHistoryId: savedNewHistory.billingHistoryId,
        category: planHistory.category,
        type: planHistory.type,
        option: planHistory.option,
        currency: planHistory.currency,
        period: planHistory.period,
        historyType: 'partial-refund',
        purchasedBillingPlanHistoryId: planHistory.billingPlanHistoryId,
        refundedAmount: planHistory.purchasedAmount,
      });
      await manager.getRepository(BillingPlanHistory).save(newPlanHistory);

      const now = this.dateTimeSimulatorService.now();
      const unlinked = invalidatePlanInfo(linked, now);
      await manager.getRepository(BillingPlanInfo).save(unlinked);
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
          billingPlanHistories: true,
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

      const planHistories = billingHistory.billingPlanHistories ?? [];
      for (const planHistory of planHistories) {
        const newPlanHistory = manager.getRepository(BillingPlanHistory).create({
          billingPlanHistoryId: v4(),
          billingOrganizationId: billingHistory.billingOrganizationId,
          billingHistoryId: savedNewHistory.billingHistoryId,
          category: planHistory.category,
          type: planHistory.type,
          option: planHistory.option,
          currency: planHistory.currency,
          period: planHistory.period,
          historyType: 'full-refund',
          purchasedBillingPlanHistoryId: planHistory.billingPlanHistoryId,
          refundedAmount: planHistory.purchasedAmount,
          originPrice: planHistory.originPrice,
        });

        await manager.getRepository(BillingPlanHistory).save(newPlanHistory);

        const linked = await manager.getRepository(BillingPlanInfo).findOne({
          where: {
            billingPlanHistoryId: planHistory.billingPlanHistoryId,
          },
          lock: {
            mode: 'pessimistic_write',
          },
        });

        if (linked) {
          const now = this.dateTimeSimulatorService.now();
          const unlinked = invalidatePlanInfo(linked, now);
          await manager.getRepository(BillingPlanInfo).save(unlinked);
        }

        const billingOrganization = await manager.getRepository(BillingOrganization).findOne({
          where: {
            billingOrganizationId: billingHistory.billingOrganizationId,
          },
          relations: {
            billingPlanInfos: true,
          },
          lock: {
            mode: 'pessimistic_write',
          },
        });

        if (billingOrganization) {
          const hasMonthlySubscription =
            (billingOrganization.billingPlanInfos?.filter((info) => info.period === 'monthly').filter((info) => info.state !== 'unsubscribed').length ?? 0) > 0;
          if (!hasMonthlySubscription) {
            billingOrganization.subscriptionMonthlyStartedAt = null;
            billingOrganization.subscriptionMonthlyExpiredAt = null;
          }

          const hasYearlySubscription =
            (billingOrganization.billingPlanInfos?.filter((info) => info.period === 'yearly').filter((info) => info.state !== 'unsubscribed').length ?? 0) > 0;
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

  async precheckout(dto: PrecheckoutDto): Promise<PrecheckoutResponse> {
    const { organizationId, billingPlanSourceId, couponCode } = dto;
    const billingMethodPaddle = await this.billingMethodPaddleService.findByOrganizationId({ organizationId });
    if (!billingMethodPaddle) {
      throw new InternalServerErrorException(`method paddle must exist. organizationId: ${organizationId}`);
    }

    const { customerId } = billingMethodPaddle;
    const billingPlanSource = await this.billingPlanSourceService.find({
      billingPlanSourceId,
    });
    if (!billingPlanSource) {
      throw new InternalServerErrorException(`billing subscription plan source must exist. dto: ${stringify(dto)}`);
    }

    const price = await this.paddleCaller.findPrice(dto);
    if (!price) {
      throw new InternalServerErrorException(`price must exist. dto: ${stringify(dto)}`);
    }
    const priceId = price.id;
    if (!priceId) {
      throw new InternalServerErrorException(`price id must exist. dto: ${stringify(dto)}`);
    }

    if (couponCode) {
      const coupon = await this.billingCouponService.findByCouponCode(couponCode);
      if (!coupon) {
        throw new NotFoundException(`coupon not found. couponCode: ${couponCode}`);
      }

      await this.retryTransaction.serializable(async (context) => {
        await validateCoupon(context, {
          organizationId,
          code: couponCode,
          period: billingPlanSource.period,
          planType: billingPlanSource.type,
          now: this.dateTimeSimulatorService.now(),
        });
      });

      const discount = await this.paddleCaller.findDiscount({ billingCouponId: coupon.billingCouponId });
      if (!discount) {
        throw new InternalServerErrorException(`discount must exist. couponCode: ${couponCode}`);
      }

      if (!discount.id) {
        throw new InternalServerErrorException(`discount id must exist. couponCode: ${couponCode}`);
      }

      const discountId = discount.id;
      return {
        paddle: {
          customerId,
          priceId,
          discountId,
        },
      };
    }

    return {
      paddle: {
        customerId,
        priceId,
        discountId: null,
      },
    };
  }
}
