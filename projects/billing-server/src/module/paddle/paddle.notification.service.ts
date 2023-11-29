import { BillingGoodsName, isBillingCurrency } from '@dogu-private/console';
import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import * as crypto from 'crypto';
import { DataSource } from 'typeorm';
import { v4 } from 'uuid';
import { config } from '../../config';
import { BillingCoupon } from '../../db/entity/billing-coupon.entity';
import { BillingHistory } from '../../db/entity/billing-history.entity';
import { BillingOrganization } from '../../db/entity/billing-organization.entity';
import { BillingPlanHistory } from '../../db/entity/billing-plan-history.entity';
import { BillingPlanInfo } from '../../db/entity/billing-plan-info.entity';
import { BillingPlanSource } from '../../db/entity/billing-plan-source.entity';
import { RetryTransaction } from '../../db/retry-transaction';
import { BillingCouponService } from '../billing-coupon/billing-coupon.service';
import { DoguLogger } from '../logger/logger';
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
  ) {
    this.retryTransaction = new RetryTransaction(this.logger, this.dataSource);
    this.registerHandler('transaction.created', async (event) => this.onTransactionCreated(event));
    this.registerHandler('transaction.completed', async (event) => this.onTransactionCompleted(event));
  }

  async onNotification(paddleSignature: string, body: unknown): Promise<unknown> {
    if (!paddleSignature) {
      throw new BadRequestException({
        message: 'Paddle-Signature header is missing',
        paddleSignature,
      });
    }

    const [timestampKeyValue, signatureKeyValue] = paddleSignature.split(';') as (string | undefined)[];
    if (!timestampKeyValue || !signatureKeyValue) {
      throw new BadRequestException({
        message: 'Paddle-Signature header is malformed',
        paddleSignature,
      });
    }

    const [timestampKey, timestamp] = timestampKeyValue.split('=') as (string | undefined)[];
    const [signatureKey, signature] = signatureKeyValue.split('=') as (string | undefined)[];
    if (!timestampKey || !timestamp || !signatureKey || !signature) {
      throw new BadRequestException({
        message: 'Paddle-Signature header is malformed',
        paddleSignature,
      });
    }

    if (!body) {
      throw new BadRequestException({
        message: 'Request body is empty',
      });
    }

    if (typeof body !== 'object') {
      throw new BadRequestException({
        message: 'Request body is not object',
        body,
      });
    }

    const signedPayload = `${timestamp}:${JSON.stringify(body)}`;
    const expectedSignature = crypto.createHmac('sha256', config.paddle.notificationKey).update(signedPayload).digest('hex');
    if (signature !== expectedSignature) {
      throw new BadRequestException({
        message: 'Paddle-Signature header is invalid',
        body,
      });
    }

    this.logger.info('Paddle notification received', { body });
    const event = body as Paddle.Event;
    const { event_type } = event;
    if (!event_type) {
      throw new BadRequestException({
        message: 'event_type is missing',
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
        message: 'Transaction is empty',
        event,
      });
    }

    const { discount_id } = transaction;
    if (discount_id) {
      const discount = await this.paddleCaller.getDiscount({ id: discount_id });
      const { billingCouponId } = discount.custom_data ?? {};
      if (!billingCouponId) {
        throw new InternalServerErrorException({
          message: 'custom_data.billingCouponId is empty',
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
          message: 'discount.code is not equal to billingCoupon.code',
          discount,
          billingCoupon,
        });
      }

      const { organizationId, billingPlanSourceId } = transaction.custom_data ?? {};
      if (!organizationId) {
        throw new InternalServerErrorException({
          message: 'custom_data.organizationId is empty',
          transaction,
        });
      }

      if (!billingPlanSourceId) {
        throw new InternalServerErrorException({
          message: 'custom_data.billingPlanSourceId is empty',
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
          message: 'Coupon is invalid',
          response,
        });
      }
    }
  }

  private async onTransactionCompleted(event: Paddle.Event<Paddle.Transaction>): Promise<void> {
    const transaction = event.data;
    if (!transaction) {
      throw new BadRequestException({
        message: 'transaction is empty',
        event,
      });
    }

    if (!transaction.id) {
      throw new BadRequestException({
        message: 'id is empty',
        transaction,
      });
    }

    const paddleTransactionId = transaction.id;
    const { subscription_id } = transaction;
    const { billingPlanSourceId } = transaction.custom_data ?? {};

    const existHistory = await this.dataSource.getRepository(BillingHistory).exist({
      where: {
        paddleTransactionId,
      },
    });
    if (existHistory) {
      this.logger.info('Paddle transaction already processed', { paddleTransactionId });
      return;
    }

    if (!subscription_id) {
      throw new BadRequestException({
        message: 'subscription_id is empty',
        transaction,
      });
    }

    const subscription = await this.paddleCaller.getSubscription({ subscriptionId: subscription_id });

    const { cardCode, cardName, cardNumberLast4Digits, cardExpirationYear, cardExpirationMonth, paddlePaymentType, billingHistoryId, billingOrganizationId } =
      await this.retryTransaction.serializable(async (context) => {
        const { manager } = context;
        if (!transaction.id) {
          throw new Error(`Transaction id is empty. ${JSON.stringify(transaction)}`);
        }

        if (!transaction.customer_id) {
          throw new Error(`Customer id is empty. ${JSON.stringify(transaction)}`);
        }

        if (!transaction.currency_code) {
          throw new Error(`Currency code is empty. ${JSON.stringify(transaction)}`);
        }

        if (!transaction.details) {
          throw new Error(`Details is empty. ${JSON.stringify(transaction)}`);
        }

        if (!transaction.details.totals) {
          throw new Error(`Totals is empty. ${JSON.stringify(transaction)}`);
        }

        if (!transaction.payments) {
          throw new Error(`Payments is empty. ${JSON.stringify(transaction)}`);
        }

        if (transaction.payments.length <= 0) {
          throw new Error(`Payments is empty. ${JSON.stringify(transaction)}`);
        }

        const payment = transaction.payments[0];
        if (!payment.method_details) {
          throw new Error(`Method details is empty. ${JSON.stringify(transaction)}`);
        }

        if (!payment.method_details.type) {
          throw new Error(`Method type is empty. ${JSON.stringify(transaction)}`);
        }

        const cardNumberLast4Digits = payment.method_details.card?.last4 ?? null;
        const cardExpirationYear = payment.method_details.card?.expiry_year?.toString() ?? null;
        const cardExpirationMonth = payment.method_details.card?.expiry_month?.toString() ?? null;
        const cardName = payment.method_details.card?.cardholder_name ?? null;
        const cardCode = payment.method_details.card?.type ?? null;
        const paddlePaymentType = payment.method_details.type;
        const currency = isBillingCurrency(transaction.currency_code) ? transaction.currency_code : null;
        if (!currency) {
          throw new Error(`Currency is invalid. ${JSON.stringify(transaction)}`);
        }

        const billingOrganization = await manager.getRepository(BillingOrganization).findOneOrFail({
          where: {
            billingMethodPaddle: {
              customerId: transaction.customer_id,
            },
          },
          relations: {
            billingMethodPaddle: true,
          },
        });
        const { billingOrganizationId } = billingOrganization;
        // FIXME:
        const purchasedAmount = Number(transaction.details.totals.total);

        const billingPlanSource = await manager.getRepository(BillingPlanSource).findOneOrFail({
          where: {
            billingPlanSourceId,
          },
        });

        const createdHistory = manager.getRepository(BillingHistory).create({
          billingHistoryId: v4(),
          billingOrganizationId,
          purchasedAmount,
          currency,
          goodsName: BillingGoodsName,
          method: 'paddle',
          historyType: 'immediate-purchase',
          cardCode,
          cardName,
          cardNumberLast4Digits,
          cardExpirationYear,
          cardExpirationMonth,
          paddlePaymentType,
          paddleTransactionId: transaction.id,
        });
        const savedHistory = await manager.save(createdHistory);

        // FIXME:
        const discountedAmount = Number(transaction.details.line_items?.[0].totals.discount);
        // TODO: plan history

        const createdPlanHistory = manager.getRepository(BillingPlanHistory).create({
          billingPlanHistoryId: v4(),
          billingOrganizationId,
          billingHistoryId: savedHistory.billingHistoryId,
          billingPlanSourceId,
          discountedAmount,
          category: billingPlanSource.category,
          type: billingPlanSource.type,
          option: billingPlanSource.option,
          currency: billingPlanSource.currency,
          originPrice: billingPlanSource.originPrice,
          period: billingPlanSource.period,
          historyType: 'immediate-purchase',
        });
        await manager.save(createdPlanHistory);

        return {
          subscriptionId: transaction.subscription_id,
          cardCode,
          cardName,
          cardNumberLast4Digits,
          cardExpirationYear,
          cardExpirationMonth,
          paddlePaymentType,
          billingHistoryId: savedHistory.billingHistoryId,
          billingOrganizationId: billingOrganization.billingOrganizationId,
        };
      });

    await this.retryTransaction.serializable(async (context) => {
      const { manager } = context;
      if (!subscription.custom_data) {
        throw new Error(`Custom data is empty. ${JSON.stringify(subscription)}`);
      }

      if (!subscription.custom_data.billingPlanInfoId) {
        throw new Error(`Billing plan info id is empty. ${JSON.stringify(subscription)}`);
      }

      const billingPlanInfo = await manager.getRepository(BillingPlanInfo).findOne({
        where: {
          billingPlanInfoId: subscription.custom_data.billingPlanInfoId,
        },
      });
      if (billingPlanInfo) {
        billingPlanInfo.paddlePaymentType = paddlePaymentType;
        billingPlanInfo.cardCode = cardCode;
        billingPlanInfo.cardName = cardName;
        billingPlanInfo.cardNumberLast4Digits = cardNumberLast4Digits;
        billingPlanInfo.cardExpirationYear = cardExpirationYear;
        billingPlanInfo.cardExpirationMonth = cardExpirationMonth;
        billingPlanInfo.billingPlanHistoryId = billingHistoryId;
        await manager.save(billingPlanInfo);
      } else {
        // TODO: plan info
        const created = manager.getRepository(BillingPlanInfo).create({
          billingPlanInfoId: v4(),
          billingOrganizationId,
          paddlePaymentType,
          cardCode,
          cardName,
          cardNumberLast4Digits,
          cardExpirationYear,
          cardExpirationMonth,
        });
        await manager.save(created);
      }
    });
  }
}
