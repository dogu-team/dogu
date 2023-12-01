/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { BillingGoodsName, BillingUsdAmount } from '@dogu-private/console';
import { assertUnreachable } from '@dogu-tech/common';
import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import * as crypto from 'crypto';
import { DataSource } from 'typeorm';
import { v4 } from 'uuid';
import { config } from '../../config';
import { BillingCoupon } from '../../db/entity/billing-coupon.entity';
import { BillingHistory } from '../../db/entity/billing-history.entity';
import { BillingPlanHistory } from '../../db/entity/billing-plan-history.entity';
import { BillingPlanInfo } from '../../db/entity/billing-plan-info.entity';
import { BillingPlanSource } from '../../db/entity/billing-plan-source.entity';
import { CloudLicense } from '../../db/entity/cloud-license.entity';
import { SelfHostedLicense } from '../../db/entity/self-hosted-license.entity';
import { RetryTransaction } from '../../db/retry-transaction';
import { BillingCouponService } from '../billing-coupon/billing-coupon.service';
import { updateMethod, validateMethod } from '../billing-organization/billing-organization.utils';
import { preprocess } from '../billing-purchase/billing-purchase.serializables';
import { updateCloudLicense } from '../cloud-license/cloud-license.serializables';
import { DateTimeSimulatorService } from '../date-time-simulator/date-time-simulator.service';
import { DoguLogger } from '../logger/logger';
import { SlackService } from '../slack/slack.service';
import { PaddleCaller } from './paddle.caller';
import { Paddle } from './paddle.types';

/**
 * @see https://developer.paddle.com/webhooks/overview
 */
@Injectable()
export class PaddleNotificationService {
  private readonly retryTransaction: RetryTransaction;
  private readonly handlers = new Map<string, (event: Paddle.Event) => Promise<void>>();

  constructor(
    private readonly logger: DoguLogger,
    private readonly dataSource: DataSource,
    private readonly paddleCaller: PaddleCaller,
    private readonly billingCouponService: BillingCouponService,
    private readonly dateTimeSimulatorService: DateTimeSimulatorService,
    private readonly slackService: SlackService,
  ) {
    this.retryTransaction = new RetryTransaction(this.logger, this.dataSource);
    this.registerHandler('transaction.created', async (event) => this.onTransactionCreated(event));
    this.registerHandler('transaction.completed', async (event) => this.onTransactionCompleted(event));
  }

  async onNotification(paddleSignature: string, body: unknown): Promise<unknown> {
    if (!paddleSignature) {
      throw new BadRequestException({
        reason: 'Paddle-Signature header is missing',
        paddleSignature,
      });
    }

    const [timestampKeyValue, signatureKeyValue] = paddleSignature.split(';') as (string | undefined)[];
    if (!timestampKeyValue || !signatureKeyValue) {
      throw new BadRequestException({
        reason: 'Paddle-Signature header is malformed',
        paddleSignature,
      });
    }

    const [timestampKey, timestamp] = timestampKeyValue.split('=') as (string | undefined)[];
    const [signatureKey, signature] = signatureKeyValue.split('=') as (string | undefined)[];
    if (!timestampKey || !timestamp || !signatureKey || !signature) {
      throw new BadRequestException({
        reason: 'Paddle-Signature header is malformed',
        paddleSignature,
      });
    }

    if (!body) {
      throw new BadRequestException({
        reason: 'Request body is empty',
      });
    }

    if (typeof body !== 'object') {
      throw new BadRequestException({
        reason: 'Request body is not object',
        body,
      });
    }

    const signedPayload = `${timestamp}:${JSON.stringify(body)}`;
    const expectedSignature = crypto.createHmac('sha256', config.paddle.notificationKey).update(signedPayload).digest('hex');
    if (signature !== expectedSignature) {
      throw new BadRequestException({
        reason: 'Paddle-Signature header is invalid',
        body,
      });
    }

    this.logger.info('Paddle notification received', { body });
    const event = body as Paddle.Event;
    const { event_type } = event;
    if (!event_type) {
      throw new BadRequestException({
        reason: 'event_type is missing',
        body,
      });
    }

    const handler = this.handlers.get(event_type);
    if (!handler) {
      this.logger.warn('Paddle notification handler not found', { eventType: event_type });
      return;
    }

    await handler(event);
  }

  registerHandler(eventType: string, handler: (event: Paddle.Event) => Promise<void>): void {
    if (this.handlers.has(eventType)) {
      throw new Error(`Handler already registered. ${eventType}`);
    }

    this.handlers.set(eventType, handler);
  }

  private async onTransactionCreated(event: Paddle.Event<Paddle.Transaction>): Promise<void> {
    const transaction = event.data;
    if (!transaction) {
      throw new BadRequestException({
        reason: 'Transaction is empty',
        event,
      });
    }

    const { discount_id } = transaction;
    if (discount_id) {
      const discount = await this.paddleCaller.getDiscount({ discountId: discount_id });
      const { billingCouponId } = discount.custom_data ?? {};
      if (!billingCouponId) {
        throw new InternalServerErrorException({
          reason: 'custom_data.billingCouponId is empty',
          discount,
        });
      }

      const billingCoupon = await this.dataSource.getRepository(BillingCoupon).findOneOrFail({
        where: {
          billingCouponId,
        },
      });

      if (discount.code !== billingCoupon.code) {
        throw new InternalServerErrorException({
          reason: 'discount.code is not equal to billingCoupon.code',
          discount,
          billingCoupon,
        });
      }

      const { organizationId, billingPlanSourceId } = transaction.custom_data ?? {};
      if (!organizationId) {
        throw new InternalServerErrorException({
          reason: 'custom_data.organizationId is empty',
          transaction,
        });
      }

      if (!billingPlanSourceId) {
        throw new InternalServerErrorException({
          reason: 'custom_data.billingPlanSourceId is empty',
          transaction,
        });
      }

      const billingPlanSource = await this.dataSource.getRepository(BillingPlanSource).findOneOrFail({
        where: {
          billingPlanSourceId,
        },
      });
      const response = await this.billingCouponService.validateCoupon({
        organizationId,
        code: billingCoupon.code,
        period: billingPlanSource.period,
        planType: billingPlanSource.type,
      });
      if (!response.ok) {
        throw new BadRequestException({
          reason: 'Coupon is invalid',
          response,
        });
      }
    }
  }

  private async onTransactionCompleted(event: Paddle.Event<Paddle.Transaction>): Promise<void> {
    const transaction = event.data;
    if (!transaction) {
      throw new BadRequestException({
        reason: 'transaction is empty',
        event,
      });
    }

    if (!transaction.id) {
      throw new BadRequestException({
        reason: 'id is empty',
        transaction,
      });
    }

    const paddleTransactionId = transaction.id;
    const { subscription_id, payments, custom_data, currency_code, discount_id, details, items, origin } = transaction;
    if (origin === 'subscription_payment_method_change') {
      return await this.onTransactionCompletedSubscriptionPaymentMethodChange(event);
    } else if (!(origin === 'web' || origin === 'subscription_update')) {
      this.logger.warn('Paddle transaction origin is not web or subscription_update', { paddleTransactionId, origin });
      return;
    }

    const item = items?.[0];
    const { organizationId, billingPlanSourceId } = custom_data ?? {};
    const payment = payments?.[0];
    const { method_details } = payment ?? {};
    const { card } = method_details ?? {};

    const originPriceInCents = Number(item?.price?.unit_price?.amount ?? 0);
    const purchasedAmountInCents = Number(details?.totals?.grand_total ?? 0);
    const purchasedAmount = BillingUsdAmount.fromCents(purchasedAmountInCents).toDollars();
    const discountedAmountInCents = originPriceInCents - purchasedAmountInCents;
    const discountedAmount = BillingUsdAmount.fromCents(discountedAmountInCents).toDollars();
    const cardNumberLast4Digits = card?.last4 ?? null;
    const cardExpirationYear = card?.expiry_year?.toString() ?? null;
    const cardExpirationMonth = card?.expiry_month?.toString() ?? null;
    const cardName = card?.cardholder_name ?? null;
    const cardCode = card?.type ?? null;
    const paddleMethodType = method_details?.type ?? null;
    const subscriptionId = subscription_id ?? null;

    if (!subscriptionId) {
      throw new BadRequestException({
        reason: 'subscription_id is empty',
        transaction,
      });
    }

    if (!currency_code) {
      throw new BadRequestException({
        reason: 'currency_code is empty',
        transaction,
      });
    }

    if (!organizationId) {
      throw new InternalServerErrorException({
        reason: 'custom_data.organizationId is empty',
        transaction,
      });
    }

    if (!billingPlanSourceId) {
      throw new InternalServerErrorException({
        reason: 'custom_data.billingPlanSourceId is empty',
        transaction,
      });
    }

    let billingCouponId: string | null = null;
    if (discount_id) {
      const discount = await this.paddleCaller.getDiscount({ discountId: discount_id });
      billingCouponId = discount.custom_data?.billingCouponId ?? null;
      if (!billingCouponId) {
        throw new InternalServerErrorException({
          reason: 'custom_data.billingCouponId is empty',
          discount,
        });
      }
    }

    const subscription = await this.paddleCaller.getSubscription({ subscriptionId });
    const { current_billing_period } = subscription;
    const { starts_at, ends_at } = current_billing_period ?? {};
    if (!starts_at) {
      throw new InternalServerErrorException({
        reason: 'current_billing_period.starts_at is empty',
        subscription,
      });
    }

    if (!ends_at) {
      throw new InternalServerErrorException({
        reason: 'current_billing_period.ends_at is empty',
        subscription,
      });
    }

    const startedAt = new Date(starts_at);
    const expiredAt = new Date(ends_at);

    await this.retryTransaction.serializable(async (context) => {
      const { manager } = context;
      const existHistory = await manager.getRepository(BillingHistory).exist({
        where: {
          paddleTransactionId,
        },
      });
      if (existHistory) {
        this.logger.info('Paddle transaction already processed', { paddleTransactionId });
        return;
      }

      const now = this.dateTimeSimulatorService.now();
      const preprocessResult = await preprocess(context, {
        organizationId,
        billingPlanSourceId,
        now,
      });
      if (!preprocessResult.ok) {
        throw new InternalServerErrorException({
          reason: 'Preprocess failed',
          preprocessResult,
        });
      }

      const { organization, planSource, currency } = preprocessResult.value;
      const { billingOrganizationId } = organization;

      validateMethod(organization, 'paddle');
      if (currency !== currency_code) {
        throw new InternalServerErrorException({
          reason: 'currency is not equal to currency_code',
          currency,
          currency_code,
        });
      }

      let planInfo = organization.billingPlanInfos?.find((planInfo) => planInfo.category === planSource.category && planInfo.type === planSource.type);
      if (!planInfo) {
        planInfo = manager.getRepository(BillingPlanInfo).create({
          billingPlanInfoId: v4(),
          billingOrganizationId,
          billingPlanSourceId,
          billingCouponId,
          discountedAmount,
          state: 'subscribed',
          paddleMethodType,
          cardCode,
          cardName,
          cardNumberLast4Digits,
          cardExpirationYear,
          cardExpirationMonth,
          category: planSource.category,
          period: planSource.period,
          originPrice: planSource.originPrice,
          type: planSource.type,
          option: planSource.option,
          currency: planSource.currency,
        });
        organization.billingPlanInfos = [...(organization.billingPlanInfos ?? []), planInfo];
      } else {
        planInfo.billingOrganizationId = billingOrganizationId;
        planInfo.billingPlanSourceId = billingPlanSourceId;
        planInfo.billingCouponId = billingCouponId;
        planInfo.discountedAmount = discountedAmount;
        planInfo.state = 'subscribed';
        planInfo.paddleMethodType = paddleMethodType;
        planInfo.cardCode = cardCode;
        planInfo.cardName = cardName;
        planInfo.cardNumberLast4Digits = cardNumberLast4Digits;
        planInfo.cardExpirationYear = cardExpirationYear;
        planInfo.cardExpirationMonth = cardExpirationMonth;
        planInfo.category = planSource.category;
        planInfo.period = planSource.period;
        planInfo.originPrice = planSource.originPrice;
        planInfo.type = planSource.type;
        planInfo.option = planSource.option;
        planInfo.currency = planSource.currency;
      }
      planInfo = await manager.save(planInfo);
      const { billingPlanInfoId } = planInfo;

      const updatedSubscription = await this.paddleCaller.updateSubscription({
        subscriptionId,
        organizationId,
        billingPlanSourceId,
        billingPlanInfoId,
      });

      const createdHistory = manager.getRepository(BillingHistory).create({
        billingHistoryId: v4(),
        billingOrganizationId,
        historyType: 'immediate-purchase',
        currency,
        purchasedAmount,
        goodsName: BillingGoodsName,
        method: 'paddle',
        cardCode,
        cardName,
        cardNumberLast4Digits,
        cardExpirationYear,
        cardExpirationMonth,
        paddleMethodType,
        paddleTransactionId,
        paddleTransaction: transaction as Record<string, unknown>,
      });
      const history = await manager.save(createdHistory);

      const createdPlanHistory = manager.getRepository(BillingPlanHistory).create({
        billingPlanHistoryId: v4(),
        billingOrganizationId,
        billingHistoryId: history.billingHistoryId,
        historyType: history.historyType,
        billingCouponId,
        billingPlanSourceId,
        discountedAmount,
        purchasedAmount,
        startedAt,
        expiredAt,
        category: planSource.category,
        period: planSource.period,
        originPrice: planSource.originPrice,
        type: planSource.type,
        option: planSource.option,
        currency: planSource.currency,
      });
      const planHistory = await manager.save(createdPlanHistory);

      updateMethod(organization, 'paddle');
      await manager.save(organization);

      let license: CloudLicense | SelfHostedLicense | null = null;
      switch (organization.category) {
        case 'cloud':
          {
            const licenseResult = await updateCloudLicense(context, {
              billingOrganizationId,
              planInfos: [planInfo],
            });
            if (licenseResult.ok) {
              license = licenseResult.value;
            }
          }
          break;
        case 'self-hosted':
          {
            // TODO: apply self-hosted license
          }
          break;
        default: {
          assertUnreachable(organization.category);
        }
      }

      this.logger.info('Paddle transaction completed', {
        paddleTransactionId,
        billingOrganizationId,
        billingHistoryId: history.billingHistoryId,
        billingPlanHistoryId: planHistory.billingPlanHistoryId,
        billingPlanInfoId: planInfo.billingPlanInfoId,
        billingPlanSourceId,
        billingCouponId,
      });
      this.slackService
        .sendPurchaseSlackMessage({
          isSucceeded: true,
          organizationId: organization.organizationId,
          amount: history.purchasedAmount ?? 0,
          currency: history.currency,
          purchasedAt: history.createdAt,
          historyId: history.billingHistoryId,
          plans: [
            {
              option: planSource.option,
              type: planSource.type,
            },
          ],
        })
        .catch((err) => this.logger.error(`Failed to send slack. organizationId: ${organization.organizationId}`));
    });
  }

  private async onTransactionCompletedSubscriptionPaymentMethodChange(event: Paddle.Event<Paddle.Transaction>): Promise<void> {
    const transaction = event.data;
    if (!transaction) {
      throw new BadRequestException({
        reason: 'transaction is empty',
        event,
      });
    }

    if (!transaction.id) {
      throw new BadRequestException({
        reason: 'id is empty',
        transaction,
      });
    }

    const paddleTransactionId = transaction.id;
    const { payments, custom_data, origin } = transaction;
    if (origin !== 'subscription_payment_method_change') {
      throw new InternalServerErrorException({
        reason: 'origin is not subscription_payment_method_change',
        transaction,
      });
    }

    const payment = payments?.find((payment) => payment.status === 'authorized');
    if (!payment) {
      this.logger.warn('Paddle transaction does not have authorized payment', { paddleTransactionId });
      return;
    }

    const { billingPlanInfoId } = custom_data ?? {};
    if (!billingPlanInfoId) {
      throw new InternalServerErrorException({
        reason: 'custom_data.billingPlanInfoId is empty',
        transaction,
      });
    }

    const { method_details } = payment;
    const { card } = method_details ?? {};
    const cardNumberLast4Digits = card?.last4 ?? null;
    const cardExpirationYear = card?.expiry_year?.toString() ?? null;
    const cardExpirationMonth = card?.expiry_month?.toString() ?? null;
    const cardName = card?.cardholder_name ?? null;
    const cardCode = card?.type ?? null;
    const paddleMethodType = method_details?.type ?? null;

    await this.retryTransaction.serializable(async (context) => {
      const { manager } = context;
      const planInfo = await manager.getRepository(BillingPlanInfo).findOne({
        where: {
          billingPlanInfoId,
        },
      });
      if (!planInfo) {
        this.logger.warn('Paddle transaction does not have planInfo', { paddleTransactionId });
        return;
      }

      planInfo.paddleMethodType = paddleMethodType;
      planInfo.cardCode = cardCode;
      planInfo.cardName = cardName;
      planInfo.cardNumberLast4Digits = cardNumberLast4Digits;
      planInfo.cardExpirationYear = cardExpirationYear;
      planInfo.cardExpirationMonth = cardExpirationMonth;
      await manager.save(planInfo);
    });
  }
}
