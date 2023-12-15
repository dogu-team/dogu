import {
  BillingUsdAmount,
  CreatePurchaseDto,
  CreatePurchaseResponse,
  GetBillingPrecheckoutDto,
  GetBillingPrecheckoutResponse,
  GetBillingPreviewDto,
  GetBillingPreviewResponse,
  resultCode,
} from '@dogu-private/console';
import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { RetryTransaction } from '../../db/utils';
import { validateCurrency } from '../billing-organization/billing-organization.utils';
import { ConsoleService } from '../console/console.service';
import { DateTimeSimulatorService } from '../date-time-simulator/date-time-simulator.service';
import { DoguLogger } from '../logger/logger';
import { NiceCaller } from '../nice/nice.caller';
import { PaddleCaller } from '../paddle/paddle.caller';
import { SlackService } from '../slack/slack.service';
import { preprocess } from './billing-purchase.serializables';

@Injectable()
export class BillingPurchasePaddleService {
  private readonly retryTransaction: RetryTransaction;

  constructor(
    private readonly logger: DoguLogger,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly niceCaller: NiceCaller,
    private readonly consoleService: ConsoleService,
    private readonly slackService: SlackService,
    private readonly dateTimeSimulatorService: DateTimeSimulatorService,
    private readonly paddleCaller: PaddleCaller,
  ) {
    this.retryTransaction = new RetryTransaction(this.logger, this.dataSource);
  }

  async getPreview(dto: GetBillingPreviewDto): Promise<GetBillingPreviewResponse> {
    if (dto.method !== 'paddle') {
      throw new InternalServerErrorException({
        reason: 'method not supported',
        method: dto.method,
      });
    }

    // TODO: refactor with precheckout
    const { organizationId } = dto;
    const preprocessResult = await this.retryTransaction.serializable(async (context) => {
      const now = this.dateTimeSimulatorService.now();
      const preprocessResult = await preprocess(context, {
        ...dto,
        now,
      });
      if (!preprocessResult.ok) {
        throw new BadRequestException({
          reason: 'preprocess failed',
          resultCode: preprocessResult.resultCode,
        });
      }

      return preprocessResult.value;
    });

    const { organization, planSource, coupon } = preprocessResult;
    const { billingMethodPaddle } = organization;
    validateCurrency(organization, planSource.currency);

    if (!billingMethodPaddle) {
      throw new InternalServerErrorException({
        reason: 'billing method paddle not found',
        organizationId,
      });
    }

    const { customerId } = billingMethodPaddle;
    const price = await this.paddleCaller.findPrice(dto);
    if (!price) {
      throw new InternalServerErrorException({
        reason: 'price not found',
        dto,
      });
    }

    const priceId = price.id;
    if (!priceId) {
      throw new InternalServerErrorException({
        reason: 'price id not found',
        dto,
      });
    }

    let discountId: string | null = null;
    if (coupon) {
      const { billingCouponId } = coupon;
      const discount = await this.paddleCaller.findDiscount({ billingCouponId });
      if (!discount) {
        throw new InternalServerErrorException({
          reason: 'discount not found',
          billingCouponId,
        });
      }

      if (!discount.id) {
        throw new InternalServerErrorException({
          reason: 'discount id not found',
          billingCouponId,
        });
      }

      discountId = discount.id;
    }

    const planInfo = organization.billingPlanInfos?.find((info) => info.category === planSource.category && info.type === planSource.type);
    if (!planInfo) {
      throw new BadRequestException({
        reason: 'plan info not found',
        category: planSource.category,
        type: planSource.type,
      });
    }

    if (planInfo.option === planSource.option && planInfo.period === planSource.period) {
      throw new BadRequestException({
        reason: 'already subscribed',
        billingPlanInfoId: planInfo.billingPlanInfoId,
      });
    }

    const isUpgrade = planInfo.option < planSource.option || (planInfo.period === 'monthly' && planSource.period === 'yearly');
    const subscriptions = await this.paddleCaller.listSubscriptionsAll({ customerId });
    const subscription = subscriptions.find((subscription) => subscription.custom_data?.billingPlanInfoId === planInfo.billingPlanInfoId);
    if (!subscription) {
      throw new InternalServerErrorException({
        reason: 'subscription not found',
        billingPlanInfoId: planInfo.billingPlanInfoId,
      });
    }

    if (!subscription.id) {
      throw new InternalServerErrorException({
        reason: 'subscription id not found',
        subscription,
      });
    }

    const previewSubscription = await this.paddleCaller.previewSubscription({
      subscriptionId: subscription.id,
      priceIds: [priceId],
      prorationBillingMode: isUpgrade ? 'prorated_immediately' : 'full_next_billing_period',
      discountId: discountId ?? undefined,
      discountEffectiveFrom: isUpgrade ? 'immediately' : 'next_billing_period',
    });

    const totalPriceCents = Number(previewSubscription.immediate_transaction?.details?.totals?.grand_total ?? '0');
    const totalPrice = BillingUsdAmount.fromCents(totalPriceCents).toDollars();
    const nextPurchaseTotalPriceCents = isUpgrade
      ? Number(previewSubscription.recurring_transaction_details?.totals?.grand_total ?? '0')
      : Number(previewSubscription.recurring_transaction_details?.totals?.total ?? '0');
    const nextPurchaseTotalPrice = BillingUsdAmount.fromCents(nextPurchaseTotalPriceCents).toDollars();
    const taxCents = isUpgrade
      ? Number(previewSubscription.immediate_transaction?.details?.totals?.tax ?? '0')
      : Number(previewSubscription.recurring_transaction_details?.totals?.tax ?? '0');
    const tax = BillingUsdAmount.fromCents(taxCents).toDollars();
    const elapsedMinutesRate = Number(previewSubscription.immediate_transaction?.details?.line_items?.[0].proration?.rate ?? '0');
    const elapsedPurchaseAmountCents = Number(previewSubscription.immediate_transaction?.details?.line_items?.[0].totals?.total ?? '0');
    const elapsedPurchaseAmount = BillingUsdAmount.fromCents(elapsedPurchaseAmountCents).toDollars();

    if (!previewSubscription.next_billed_at) {
      throw new InternalServerErrorException({
        reason: 'next billed at not found',
        previewSubscription,
      });
    }

    const nextPurchasedAt = new Date(previewSubscription.next_billed_at);
    return {
      ok: true,
      resultCode: resultCode('ok'),
      totalPrice,
      nextPurchaseTotalPrice,
      nextPurchasedAt,
      tax,
      coupon: null,
      plan: {
        category: planSource.category,
        period: planSource.period,
        option: planSource.option,
        type: planSource.type,
        currency: planSource.currency,
        originPrice: planSource.originPrice,
      },
      paddleElapsePlans: [
        {
          category: planInfo.category,
          period: planInfo.period,
          option: planInfo.option,
          type: planInfo.type,
          currency: planInfo.currency,
          elapsedMinutesRate,
          elapsedPurchaseAmount,
        },
      ],
      elapsedPlans: [],
      remainingPlans: [],
    };
  }

  async createPurchase(dto: CreatePurchaseDto): Promise<CreatePurchaseResponse> {
    if (dto.method !== 'paddle') {
      throw new InternalServerErrorException({
        reason: 'method not supported',
        method: dto.method,
      });
    }

    // TODO: refactor with precheckout
    const { organizationId } = dto;
    const preprocessResult = await this.retryTransaction.serializable(async (context) => {
      const now = this.dateTimeSimulatorService.now();
      const preprocessResult = await preprocess(context, {
        ...dto,
        now,
      });
      if (!preprocessResult.ok) {
        throw new BadRequestException({
          reason: 'preprocess failed',
          resultCode: preprocessResult.resultCode,
        });
      }

      return preprocessResult.value;
    });

    const { organization, planSource, coupon } = preprocessResult;
    const { billingMethodPaddle } = organization;
    validateCurrency(organization, planSource.currency);

    if (!billingMethodPaddle) {
      throw new InternalServerErrorException({
        reason: 'billing method paddle not found',
        organizationId,
      });
    }

    const { customerId } = billingMethodPaddle;
    const price = await this.paddleCaller.findPrice(dto);
    if (!price) {
      throw new InternalServerErrorException({
        reason: 'price not found',
        dto,
      });
    }

    const priceId = price.id;
    if (!priceId) {
      throw new InternalServerErrorException({
        reason: 'price id not found',
        dto,
      });
    }

    let discountId: string | null = null;
    if (coupon) {
      const { billingCouponId } = coupon;
      const discount = await this.paddleCaller.findDiscount({ billingCouponId });
      if (!discount) {
        throw new InternalServerErrorException({
          reason: 'discount not found',
          billingCouponId,
        });
      }

      if (!discount.id) {
        throw new InternalServerErrorException({
          reason: 'discount id not found',
          billingCouponId,
        });
      }

      discountId = discount.id;
    }

    const planInfo = organization.billingPlanInfos?.find((info) => info.category === planSource.category && info.type === planSource.type);
    if (!planInfo) {
      throw new BadRequestException({
        reason: 'plan info not found',
        category: planSource.category,
        type: planSource.type,
      });
    }

    if (planInfo.option === planSource.option && planInfo.period === planSource.period) {
      throw new BadRequestException({
        reason: 'already subscribed',
        billingPlanInfoId: planInfo.billingPlanInfoId,
      });
    }

    const isUpgrade = planInfo.option < planSource.option || (planInfo.period === 'monthly' && planSource.period === 'yearly');
    const subscriptions = await this.paddleCaller.listSubscriptionsAll({ customerId });
    const subscription = subscriptions.find((subscription) => subscription.custom_data?.billingPlanInfoId === planInfo.billingPlanInfoId);
    if (!subscription) {
      throw new InternalServerErrorException({
        reason: 'subscription not found',
        billingPlanInfoId: planInfo.billingPlanInfoId,
      });
    }

    if (!subscription.id) {
      throw new InternalServerErrorException({
        reason: 'subscription id not found',
        subscription,
      });
    }

    const updatedSubscription = await this.paddleCaller.updateSubscription({
      subscriptionId: subscription.id,
      organizationId,
      billingPlanSourceId: planSource.billingPlanSourceId,
      billingPlanInfoId: planInfo.billingPlanInfoId,
      changeRequestedBillingPlanSourceId: !isUpgrade ? planSource.billingPlanSourceId : undefined,
      priceIds: [priceId],
      prorationBillingMode: isUpgrade ? 'prorated_immediately' : 'full_next_billing_period',
      discountId: discountId ?? undefined,
      discountEffectiveFrom: isUpgrade ? 'immediately' : 'next_billing_period',
    });

    return {
      ok: true,
      resultCode: resultCode('ok'),
      plan: null,
      license: null,
      niceResultCode: null,
    };
  }

  async getPrecheckout(dto: GetBillingPrecheckoutDto): Promise<GetBillingPrecheckoutResponse> {
    const { organizationId } = dto;
    const preprocessResult = await this.retryTransaction.serializable(async (context) => {
      const now = this.dateTimeSimulatorService.now();
      const preprocessResult = await preprocess(context, {
        ...dto,
        now,
      });
      if (!preprocessResult.ok) {
        throw new BadRequestException({
          reason: 'preprocess failed',
          resultCode: preprocessResult.resultCode,
        });
      }

      return preprocessResult.value;
    });

    const { organization, planSource, coupon } = preprocessResult;
    const { billingMethodPaddle } = organization;
    validateCurrency(organization, planSource.currency);

    if (!billingMethodPaddle) {
      throw new InternalServerErrorException({
        reason: 'billing method paddle not found',
        organizationId,
      });
    }

    const { customerId } = billingMethodPaddle;
    const price = await this.paddleCaller.findPrice(dto);
    if (!price) {
      throw new InternalServerErrorException({
        reason: 'price not found',
        dto,
      });
    }

    const priceId = price.id;
    if (!priceId) {
      throw new InternalServerErrorException({
        reason: 'price id not found',
        dto,
      });
    }

    let discountId: string | null = null;
    if (coupon) {
      const { billingCouponId } = coupon;
      const discount = await this.paddleCaller.findDiscount({ billingCouponId });
      if (!discount) {
        throw new InternalServerErrorException({
          reason: 'discount not found',
          billingCouponId,
        });
      }

      if (!discount.id) {
        throw new InternalServerErrorException({
          reason: 'discount id not found',
          billingCouponId,
        });
      }

      discountId = discount.id;
    }

    const addresses = await this.paddleCaller.listAddressesAll({ customerId });
    const addressId = addresses.length > 0 ? addresses[0].id ?? null : null;

    const businesses = await this.paddleCaller.listBusinessesAll({ customerId });
    const businessId = businesses.length > 0 ? businesses[0].id ?? null : null;

    return {
      paddle: {
        customerId,
        priceId,
        discountId,
        addressId,
        businessId,
      },
    };
  }
}
