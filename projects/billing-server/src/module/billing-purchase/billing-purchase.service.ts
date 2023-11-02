import {
  BillingCategory,
  BillingCouponBase,
  BillingCurrency,
  BillingPeriod,
  BillingSubscriptionPlanInfo,
  BillingSubscriptionPlanMap,
  BillingSubscriptionPlanPrice,
  BillingSubscriptionPlanPriceMap,
  BillingSubscriptionPlanSourceData,
  BillingSubscriptionPlanType,
  BillingSubscriptionPreviewReason,
  CreatePurchaseSubscriptionDto,
  CreatePurchaseSubscriptionResponse,
  CreatePurchaseSubscriptionWithNewCardDto,
  CreatePurchaseSubscriptionWithNewCardResponse,
  GetBillingSubscriptionPreviewDto,
  GetBillingSubscriptionPreviewResponse,
} from '@dogu-private/console';
import { assertUnreachable } from '@dogu-tech/common';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import _ from 'lodash';
import { DateTime } from 'luxon';
import { DataSource, EntityManager } from 'typeorm';
import { BillingOrganization } from '../../db/entity/billing-organization.entity';
import { BillingSubscriptionPlanSource } from '../../db/entity/billing-subscription-plan-source.entity';
import { retrySerialize } from '../../db/utils';
import { BillingCouponService } from '../billing-coupon/billing-coupon.service';
import { BillingHistoryService } from '../billing-history/billing-history.service';
import { BillingMethodNiceService } from '../billing-method/billing-method-nice.service';
import { BillingOrganizationService } from '../billing-organization/billing-organization.service';
import { DoguLogger } from '../logger/logger';

function calculateNextPurchaseAt(billingOrganization: BillingOrganization, period: BillingPeriod): Date {
  switch (period) {
    case 'monthly': {
      /**
       * @note treat today as lastMonthlyPurchasedAt if lastMonthlyPurchasedAt is null
       */
      const lastMonthlyPurchasedAt = billingOrganization.lastMonthlyPurchasedAt ?? new Date();
      return DateTime.fromJSDate(lastMonthlyPurchasedAt).plus({ month: 1 }).toJSDate();
    }
    case 'yearly': {
      /**
       * @note treat today as lastYearlyPurchasedAt if lastYearlyPurchasedAt is null
       */
      const lastYearlyPurchasedAt = billingOrganization.lastYearlyPurchasedAt ?? new Date();
      return DateTime.fromJSDate(lastYearlyPurchasedAt).plus({ year: 1 }).toJSDate();
    }
    default:
      assertUnreachable(period);
  }
}

function parseDiscountPercent(value: number | null): number {
  const monthlyDiscountPercent = value == null ? 0 : value;
  return monthlyDiscountPercent;
}

function discountPercentToFactor(percent: number): number {
  return (100 - percent) / 100;
}

function calculateCouponFactor(coupon: BillingCouponBase | null, period: BillingPeriod): number {
  if (!coupon) {
    return 1;
  }

  switch (period) {
    case 'monthly': {
      const monthlyDiscountPercent = parseDiscountPercent(coupon.monthlyDiscountPercent);
      return discountPercentToFactor(monthlyDiscountPercent);
    }
    case 'yearly': {
      const yearlyDiscountPercent = parseDiscountPercent(coupon.yearlyDiscountPercent);
      return discountPercentToFactor(yearlyDiscountPercent);
    }
    default:
      assertUnreachable(period);
  }
}

function calculateNextCouponFactor(coupon: BillingCouponBase | null, period: BillingPeriod): number {
  if (!coupon) {
    return 1;
  }

  switch (period) {
    case 'monthly': {
      const monthlyDiscountPercent = parseDiscountPercent(coupon.monthlyDiscountPercent);
      if (coupon.monthlyApplyCount === null) {
        // @note apply infinitly
        return discountPercentToFactor(monthlyDiscountPercent);
      } else if (coupon.monthlyApplyCount > 1) {
        return discountPercentToFactor(monthlyDiscountPercent);
      } else {
        return 1;
      }
    }
    case 'yearly': {
      const yearlyDiscountPercent = parseDiscountPercent(coupon.yearlyDiscountPercent);
      if (coupon.yearlyApplyCount === null) {
        // @note apply infinitly
        return discountPercentToFactor(yearlyDiscountPercent);
      } else if (coupon.yearlyApplyCount > 1) {
        return discountPercentToFactor(yearlyDiscountPercent);
      } else {
        return 1;
      }
    }
    default:
      assertUnreachable(period);
  }
}

function getRemainingDays(period: BillingPeriod, today: Date, nextPerchaseAt: Date): number {
  switch (period) {
    case 'monthly':
      return DateTime.fromJSDate(today).plus({ month: 1 }).diff(DateTime.fromJSDate(nextPerchaseAt), 'days').days;
    case 'yearly':
      return DateTime.fromJSDate(today).plus({ year: 1 }).diff(DateTime.fromJSDate(nextPerchaseAt), 'days').days;
    default:
      assertUnreachable(period);
  }
}

function getElapsedDays(period: BillingPeriod, today: Date, lastPurchasedAt: Date): number {
  switch (period) {
    case 'monthly':
      return DateTime.fromJSDate(today).diff(DateTime.fromJSDate(lastPurchasedAt), 'days').days;
    case 'yearly':
      return DateTime.fromJSDate(today).diff(DateTime.fromJSDate(lastPurchasedAt), 'days').days;
    default:
      assertUnreachable(period);
  }
}

function parseCurrency(billingOrganization: BillingOrganization, argumentCurrency: BillingCurrency): BillingCurrency {
  const currency = billingOrganization.currency ?? argumentCurrency;
  return currency;
}

@Injectable()
export class BillingPurchaseService {
  constructor(
    private readonly logger: DoguLogger,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly billingMethodNiceService: BillingMethodNiceService,
    private readonly billingOrganizationService: BillingOrganizationService,
    private readonly billingHistoryService: BillingHistoryService,
  ) {}

  async getSubscriptionPreview(dto: GetBillingSubscriptionPreviewDto): Promise<GetBillingSubscriptionPreviewResponse> {
    return await retrySerialize(this.logger, this.dataSource, async (manager) => {
      return await BillingPurchaseService.getSubscriptionPreview(manager, dto);
    });
  }

  async createPurchaseSubscription(dto: CreatePurchaseSubscriptionDto): Promise<CreatePurchaseSubscriptionResponse> {
    return await retrySerialize(this.logger, this.dataSource, async (manager) => {
      return await BillingPurchaseService.createPurchaseSubscription(manager, this.billingMethodNiceService, dto);
    });
  }

  async createPurchaseSubscriptionWithNewCard(dto: CreatePurchaseSubscriptionWithNewCardDto): Promise<CreatePurchaseSubscriptionWithNewCardResponse> {
    return await retrySerialize(this.logger, this.dataSource, async (manager) => {
      let billingOrganization: BillingOrganization | undefined;
      try {
        billingOrganization = await this.billingOrganizationService.createOrUpdateWithNice(dto);
      } catch (error) {
        this.logger.error(error);
        return {
          ok: false,
          reason: 'invalid-card',
        };
      }

      const createPurchaseSubscriptionResult = await BillingPurchaseService.createPurchaseSubscription(manager, this.billingMethodNiceService, dto);
      if (!createPurchaseSubscriptionResult.ok) {
        return {
          ok: createPurchaseSubscriptionResult.ok,
          reason: createPurchaseSubscriptionResult.reason,
        };
      }

      return {
        ok: true,
        reason: 'purchased',
      };
    });
  }

  private static async parseSubscriptionPlan(
    manager: EntityManager,
    billingOrganizationId: string,
    type: BillingSubscriptionPlanType,
    category: BillingCategory,
    option: number,
    currency: BillingCurrency,
    period: BillingPeriod,
  ): Promise<{ ok: boolean; reason: BillingSubscriptionPreviewReason; subscriptionPlan: BillingSubscriptionPlanSourceData | null }> {
    // find subscription plan source
    const billingSubscriptionPlanSource = await manager.getRepository(BillingSubscriptionPlanSource).findOne({
      where: {
        billingOrganizationId,
        type,
        category,
        option,
        currency,
        period,
      },
    });

    if (billingSubscriptionPlanSource) {
      return { ok: true, reason: 'available', subscriptionPlan: billingSubscriptionPlanSource };
    }

    // validate subscription plan type
    const billingSubscriptionPlanInfo = _.get(BillingSubscriptionPlanMap, type) as BillingSubscriptionPlanInfo | undefined;
    if (!billingSubscriptionPlanInfo) {
      return { ok: false, reason: 'subscription-plan-type-not-found', subscriptionPlan: null };
    }

    if (billingSubscriptionPlanInfo.category !== category) {
      return { ok: false, reason: 'category-not-matched', subscriptionPlan: null };
    }

    const billingSubscriptionPlanPriceMap = _.get(billingSubscriptionPlanInfo.optionMap, option) as BillingSubscriptionPlanPriceMap | undefined;
    if (!billingSubscriptionPlanPriceMap) {
      return { ok: false, reason: 'subscription-plan-option-not-found', subscriptionPlan: null };
    }

    const billingSubscriptionPlanPrice = _.get(billingSubscriptionPlanPriceMap, currency) as BillingSubscriptionPlanPrice | undefined;
    if (!billingSubscriptionPlanPrice) {
      return { ok: false, reason: 'currency-not-found', subscriptionPlan: null };
    }

    const originPrice = _.get(billingSubscriptionPlanPrice, period) as number | undefined;
    if (originPrice === undefined) {
      return { ok: false, reason: 'period-not-found', subscriptionPlan: null };
    }

    return { ok: true, reason: 'available', subscriptionPlan: { type, category, option, currency, period, originPrice } };
  }

  private static async parseCoupon(
    manager: EntityManager,
    organizationId: string,
    couponCode: string | undefined,
  ): Promise<{ ok: boolean; reason: BillingSubscriptionPreviewReason; coupon: BillingCouponBase | null }> {
    if (couponCode === undefined) {
      return {
        ok: true,
        reason: 'coupon-null-argument',
        coupon: null,
      };
    }

    const { ok, reason, coupon } = await BillingCouponService.validateBillingCoupon(manager, { organizationId, code: couponCode });
    return {
      ok,
      reason,
      coupon: coupon ?? null,
    };
  }

  private static async getSubscriptionPreview(manager: EntityManager, dto: GetBillingSubscriptionPreviewDto): Promise<GetBillingSubscriptionPreviewResponse> {
    const { organizationId, couponCode, subscriptionPlanType, subscriptionPlanOption, category, period } = dto;
    const billingOrganization = await BillingOrganizationService.findWithSubscriptionPlans(manager, organizationId, category);
    if (!billingOrganization) {
      return {
        ok: false,
        reason: 'organization-not-found',
      };
    }

    if (category !== billingOrganization.category) {
      return {
        ok: false,
        reason: 'category-not-matched',
      };
    }

    const { billingOrganizationId, firstPurchasedAt } = billingOrganization;
    const currency = parseCurrency(billingOrganization, dto.currency);
    const billingSubscriptionPlans = billingOrganization.billingSubscriptionPlans ?? [];
    if (billingSubscriptionPlans.length > 0 && billingSubscriptionPlans.some((plan) => plan.currency !== currency)) {
      return {
        ok: false,
        reason: 'currency-not-matched',
      };
    }

    const parseSubscriptionPlanResult = await BillingPurchaseService.parseSubscriptionPlan(
      manager,
      billingOrganizationId,
      subscriptionPlanType,
      category,
      subscriptionPlanOption,
      currency,
      period,
    );
    if (!parseSubscriptionPlanResult.ok) {
      return {
        ok: parseSubscriptionPlanResult.ok,
        reason: parseSubscriptionPlanResult.reason,
      };
    }

    const { subscriptionPlan } = parseSubscriptionPlanResult;
    if (!subscriptionPlan) {
      throw new Error('source data must not be null');
    }

    const parseCouponResult = await BillingPurchaseService.parseCoupon(manager, organizationId, couponCode);
    if (!parseCouponResult.ok) {
      return {
        ok: parseCouponResult.ok,
        reason: parseCouponResult.reason,
      };
    }

    const { coupon } = parseCouponResult;
    const normalizedCouponFactor = calculateCouponFactor(coupon, period);
    const normalizedNextCouponFactor = calculateNextCouponFactor(coupon, period);
    const isSubscribing = billingSubscriptionPlans.length > 0;
    if (!isSubscribing) {
      const totalPrice = subscriptionPlan.originPrice * normalizedCouponFactor;
      return {
        ok: true,
        reason: 'available',
        totalPrice,
        tax: 0,
        nextPurchaseTotalPrice: subscriptionPlan.originPrice,
        nextPurchaseAt: calculateNextPurchaseAt(billingOrganization, period),
        subscriptionPlan,
        coupon,
        elapsedPlans: [],
        remainingPlans: [],
      };
    } else {
      const subscribedPlan = billingSubscriptionPlans.find((plan) => plan.type === subscriptionPlanType);
      if (!subscribedPlan) {
        const totalPrice = subscriptionPlan.originPrice * normalizedCouponFactor;
        const nextPurchaseAt = calculateNextPurchaseAt(billingOrganization, period);
        const nextPurchaseTotalPrice =
          subscriptionPlan.originPrice * normalizedNextCouponFactor +
          billingSubscriptionPlans.filter((plan) => plan.period === 'monthly').reduce((acc, plan) => acc + plan.originPrice, 0);
        return {
          ok: true,
          reason: 'available',
          totalPrice,
          tax: 0,
          nextPurchaseTotalPrice,
          nextPurchaseAt,
          subscriptionPlan,
          coupon,
          elapsedPlans: [],
          remainingPlans: [],
        };
      } else {
        const upgradePlanOption = subscribedPlan.option < subscriptionPlanOption;
        const downgradePlanOption = subscribedPlan.option > subscriptionPlanOption;
        const noChangePlanOption = subscribedPlan.option === subscriptionPlanOption;
        const upgradePlanPeriod = subscribedPlan.period === 'monthly' && period === 'yearly';
        const downgradePlanPeriod = subscribedPlan.period === 'yearly' && period === 'monthly';
        const noChangePlanPeriod = subscribedPlan.period === period;
        if (noChangePlanOption && noChangePlanPeriod) {
          return {
            ok: false,
            reason: 'duplicated-subscription-plan',
          };
        }

        if (upgradePlanOption) {
          if (upgradePlanPeriod) {
            throw new Error('not implemented');
          } else if (downgradePlanPeriod) {
            throw new Error('not implemented');
          } else if (noChangePlanPeriod) {
            throw new Error('not implemented');
          } else {
            throw new Error('must not be reachable');
          }
        } else if (downgradePlanOption) {
          if (upgradePlanPeriod) {
            throw new Error('not implemented');
          } else if (downgradePlanPeriod) {
            throw new Error('not implemented');
          } else if (noChangePlanPeriod) {
            throw new Error('not implemented');
          } else {
            throw new Error('must not be reachable');
          }
        } else if (noChangePlanOption) {
          if (upgradePlanPeriod) {
            throw new Error('not implemented');
          } else if (downgradePlanPeriod) {
            throw new Error('not implemented');
          } else if (noChangePlanPeriod) {
            throw new Error('not implemented');
          } else {
            throw new Error('must not be reachable');
          }
        } else {
          throw new Error('must not be reachable');
        }
      }
    }

    throw new Error('must not be reachable');
  }

  private static async createPurchaseSubscription(
    manager: EntityManager,
    billingMethodNiceService: BillingMethodNiceService,
    dto: CreatePurchaseSubscriptionDto,
  ): Promise<CreatePurchaseSubscriptionResponse> {
    const getSubscriptionPreview = await BillingPurchaseService.getSubscriptionPreview(manager, dto);
    if (!getSubscriptionPreview.ok) {
      return {
        ok: false,
        reason: getSubscriptionPreview.reason,
      };
    }

    const response = await billingMethodNiceService.createPurchase({
      organizationId: dto.organizationId,
      amount: getSubscriptionPreview.totalPrice,
      goodsName: dto.subscriptionPlanType,
    });

    // await manager.getRepository(BillingHistory).create({
    //   billingHistoryId: v4(),
    //   purchasedAt: new Date(),
    //   billingOrganizationId: dto.organizationId,
    // });

    return {
      ok: true,
      reason: 'purchased',
    };
  }
}
