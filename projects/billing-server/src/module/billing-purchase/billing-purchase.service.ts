import {
  BillingHistoryProp,
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
import { BillingSubscriptionPlanHistory } from '../../db/entity/billing-subscription-plan-history.entity';
import { BillingSubscriptionPlanInfo } from '../../db/entity/billing-subscription-plan-info.entity';
import { retrySerialize } from '../../db/utils';
import { BillingMethodNiceCaller } from '../billing-method/billing-method-nice.caller';
import { createOrUpdateMethodNice } from '../billing-method/billing-method-nice.serializables';
import { findBillingOrganizationWithMethodAndSubscriptionPlans, findBillingOrganizationWithSubscriptionPlans } from '../billing-organization/billing-organization.serializables';
import { unlinkBillingSubscriptionPlanInfo } from '../billing-subscription-plan-info/billing-subscription-plan-info.utils';
import { ConsoleService } from '../console/console.service';
import { DoguLogger } from '../logger/logger';
import { processNextPurchaseSubscription, processNowPurchaseSubscription, processPurchaseSubscriptionPreview } from './billing-purchase.serializables';

@Injectable()
export class BillingPurchaseService {
  constructor(
    private readonly logger: DoguLogger,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly billingMethodNiceCaller: BillingMethodNiceCaller,
    private readonly consoleService: ConsoleService,
  ) {}

  async getSubscriptionPreview(dto: GetBillingSubscriptionPreviewDto): Promise<GetBillingSubscriptionPreviewResponse> {
    return await retrySerialize(this.logger, this.dataSource, async (context) => {
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
    return await retrySerialize(this.logger, this.dataSource, async (context) => {
      const { setTriggerRollbackBeforeReturn } = context;
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

      const processNowResult = await processNowPurchaseSubscription(context, this.billingMethodNiceCaller, {
        billingMethodNice,
        billingOrganization,
        ...processPreviewResult.value,
      });

      if (!processNowResult.ok) {
        setTriggerRollbackBeforeReturn();
        return {
          ok: false,
          resultCode: processNowResult.resultCode,
          plan: null,
          license: null,
          niceResultCode: processNowResult.niceResultCode,
        };
      }

      if (processNowResult.planHistory && processNowResult.plan) {
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
    return await retrySerialize(this.logger, this.dataSource, async (context) => {
      const { setTriggerRollbackBeforeReturn } = context;
      const { registerCard } = dto;
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

      const niceResult = await createOrUpdateMethodNice(context, this.billingMethodNiceCaller, {
        billingOrganizationId,
        subscribeRegist: {
          registerCard,
        },
      });

      if (!niceResult.ok) {
        setTriggerRollbackBeforeReturn();
        return {
          ok: false,
          resultCode: niceResult.resultCode,
          plan: null,
          method: null,
          license: null,
          niceResultCode: niceResult.extras.niceResultCode,
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
      const processNowResult = await processNowPurchaseSubscription(context, this.billingMethodNiceCaller, {
        billingMethodNice,
        billingOrganization,
        ...processPreviewResult.value,
      });

      if (!processNowResult.ok) {
        setTriggerRollbackBeforeReturn();
        return {
          ok: false,
          resultCode: processNowResult.resultCode,
          plan: null,
          license: null,
          method: null,
          niceResultCode: processNowResult.niceResultCode,
        };
      }

      if (processNowResult.planHistory && processNowResult.plan) {
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
        method,
        niceResultCode: null,
      };
    });
  }

  async refundSubscriptionPlan(dto: RefundSubscriptionPlanDto): Promise<void> {
    return await retrySerialize(this.logger, this.dataSource, async (context) => {
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
      const cancelResult = await this.billingMethodNiceCaller.paymentsCancel({
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

      await unlinkBillingSubscriptionPlanInfo(manager, linked);
    });
  }

  async refundFull(dto: RefundFullDto): Promise<void> {
    return await retrySerialize(this.logger, this.dataSource, async (context) => {
      const { manager } = context;
      const { billingHistoryId } = dto;
      const billingHistory = await manager.getRepository(BillingHistory).findOne({
        where: {
          billingHistoryId,
          historyType: In(BillingHistoryTypePurchase),
        },
        relations: [BillingHistoryProp.billingSubscriptionPlanHistories],
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
      const cancelResult = await this.billingMethodNiceCaller.paymentsCancel({
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
          await unlinkBillingSubscriptionPlanInfo(manager, linked);
        }
      }
    });
  }
}
