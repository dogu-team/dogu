import { BillingGoodsName, isBillingCurrency } from '@dogu-private/console';
import { errorify } from '@dogu-tech/common';
import { BadRequestException, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { DataSource } from 'typeorm';
import { v4 } from 'uuid';
import { BillingHistory } from '../../db/entity/billing-history.entity';
import { BillingOrganization } from '../../db/entity/billing-organization.entity';
import { BillingPlanHistory } from '../../db/entity/billing-plan-history.entity';
import { BillingPlanInfo } from '../../db/entity/billing-plan-info.entity';
import { RetryTransaction } from '../../db/retry-transaction';
import { DoguLogger } from '../logger/logger';
import { PaddleCaller } from './paddle.caller';
import { Paddle } from './paddle.types';

/**
 * TODO: move to env
 */
const paddleNotificationKey = 'pdl_ntfset_01hfvf6np93stpzgg99tzqh67f_vP5ukftxMEHcQtReFTbhVMCRBXPVLejU';

/**
 * @see https://developer.paddle.com/webhooks/overview
 */
@Injectable()
export class PaddleNotificationService {
  private readonly retryTransaction: RetryTransaction;

  constructor(
    private readonly logger: DoguLogger,
    private readonly dataSource: DataSource,
    private readonly paddleCaller: PaddleCaller,
  ) {
    this.retryTransaction = new RetryTransaction(this.logger, this.dataSource);
  }

  async onNotification(paddleSignature: string, body: unknown): Promise<unknown> {
    if (!paddleSignature) {
      this.logger.error('Paddle-Signature header is missing');
      throw new BadRequestException('Paddle-Signature header is missing');
    }

    if (typeof paddleSignature !== 'string') {
      this.logger.error('Paddle-Signature header is not a string');
      throw new BadRequestException('Paddle-Signature header is not a string');
    }

    const [timestampKeyValue, signatureKeyValue] = paddleSignature.split(';') as (string | undefined)[];
    if (!timestampKeyValue || !signatureKeyValue) {
      this.logger.error('Paddle-Signature header is malformed', { paddleSignature });
      throw new BadRequestException('Paddle-Signature header is malformed');
    }

    const [timestampKey, timestamp] = timestampKeyValue.split('=') as (string | undefined)[];
    const [signatureKey, signature] = signatureKeyValue.split('=') as (string | undefined)[];
    if (!timestampKey || !timestamp || !signatureKey || !signature) {
      this.logger.error('Paddle-Signature header is malformed', { paddleSignature });
      throw new BadRequestException('Paddle-Signature header is malformed');
    }

    if (typeof body !== 'object') {
      this.logger.error('Request body is not a object', { body });
      throw new BadRequestException('Request body is not a object');
    }

    const signedPayload = `${timestamp}:${JSON.stringify(body)}`;
    const expectedSignature = crypto.createHmac('sha256', paddleNotificationKey).update(signedPayload).digest('hex');
    if (signature !== expectedSignature) {
      this.logger.error('Paddle-Signature header is invalid', { paddleSignature });
      throw new BadRequestException('Paddle-Signature header is invalid');
    }

    this.logger.info('Paddle notification received', { body });

    try {
      const event = body as Paddle.Event;
      if (event.event_type === 'transaction.completed') {
        return await this.onTransactionCompleted(event);
      }
    } catch (e) {
      this.logger.error('Paddle notification processing failed', { error: errorify(e) });
      throw e;
    }
  }

  private async onTransactionCompleted(event: Paddle.Event): Promise<void> {
    const transaction = event.data as Paddle.Transaction;
    const { subscriptionId, cardCode, cardName, cardNumberLast4Digits, cardExpirationYear, cardExpirationMonth, paymentType, billingHistoryId, billingOrganizationId } =
      await this.retryTransaction.serializable(async (context) => {
        const { manager } = context;
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

        if (!transaction.subscription_id) {
          throw new Error(`Subscription id is empty. ${JSON.stringify(transaction)}`);
        }

        const cardNumberLast4Digits = payment.method_details.card?.last4 ?? null;
        const cardExpirationYear = payment.method_details.card?.expiry_year?.toString() ?? null;
        const cardExpirationMonth = payment.method_details.card?.expiry_month?.toString() ?? null;
        const cardName = payment.method_details.card?.cardholder_name ?? null;
        const cardCode = payment.method_details.card?.type ?? null;
        const paymentType = payment.method_details.type;
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
        const purchasedAmount = Number(transaction.details.totals.total);

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
          paymentType,
        });
        const savedHistory = await manager.save(createdHistory);

        // TODO: plan history
        const createdPlanHistory = manager.getRepository(BillingPlanHistory).create({
          billingPlanHistoryId: v4(),
          billingOrganizationId,
          billingHistoryId: savedHistory.billingHistoryId,
        });
        await manager.save(createdPlanHistory);

        return {
          subscriptionId: transaction.subscription_id,
          cardCode,
          cardName,
          cardNumberLast4Digits,
          cardExpirationYear,
          cardExpirationMonth,
          paymentType,
          billingHistoryId: savedHistory.billingHistoryId,
          billingOrganizationId: billingOrganization.billingOrganizationId,
        };
      });

    const subscription = await this.paddleCaller.getSubscription({ subscriptionId });
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
        billingPlanInfo.paymentType = paymentType;
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
          paymentType,
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
