import {
  CreatePurchaseSubscriptionDto,
  CreatePurchaseSubscriptionResponse,
  CreatePurchaseSubscriptionWithNewCardDto,
  CreatePurchaseSubscriptionWithNewCardResponse,
  GetBillingSubscriptionPreviewDto,
  GetBillingSubscriptionPreviewResponse,
  resultCode,
} from '@dogu-private/console';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { retrySerialize } from '../../db/utils';
import { BillingHistoryService } from '../billing-history/billing-history.service';
import { BillingMethodNiceCaller } from '../billing-method/billing-method-nice.caller';
import { createOrUpdateMethodNice, createPurchase } from '../billing-method/billing-method-nice.serializables';
import { BillingMethodNiceService } from '../billing-method/billing-method-nice.service';
import {
  findOrganizationWithMethodAndSubscriptionPlans,
  findOrganizationWithSubscriptionPlans,
  registerUsedCoupon,
} from '../billing-organization/billing-organization.serializables';
import { BillingOrganizationService } from '../billing-organization/billing-organization.service';
import { createSubscriptionPlan, unsubscribeRemainingSubscriptionPlans } from '../billing-subscription-plan/billing-subscription-plan.serializables';
import { DoguLogger } from '../logger/logger';
import { getSubscriptionPreview } from './billing-purchase.serializables';

@Injectable()
export class BillingPurchaseService {
  constructor(
    private readonly logger: DoguLogger,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly billingMethodNiceService: BillingMethodNiceService,
    private readonly billingOrganizationService: BillingOrganizationService,
    private readonly billingHistoryService: BillingHistoryService,
    private readonly billingMethodNiceCaller: BillingMethodNiceCaller,
  ) {}

  async getSubscriptionPreview(dto: GetBillingSubscriptionPreviewDto): Promise<GetBillingSubscriptionPreviewResponse> {
    return await retrySerialize(this.logger, this.dataSource, async (context) => {
      const billingOrganization = await findOrganizationWithSubscriptionPlans(context, dto);
      if (!billingOrganization) {
        return {
          ok: false,
          resultCode: resultCode('organization-not-found'),
        };
      }

      return await getSubscriptionPreview(context, {
        billingOrganization,
        billingSubscriptionPlan: dto,
      });
    });
  }

  async createPurchaseSubscription(dto: CreatePurchaseSubscriptionDto): Promise<CreatePurchaseSubscriptionResponse> {
    return await retrySerialize(this.logger, this.dataSource, async (context) => {
      const billingOrganization = await findOrganizationWithMethodAndSubscriptionPlans(context, dto);
      if (!billingOrganization) {
        return {
          ok: false,
          resultCode: resultCode('organization-not-found'),
        };
      }

      const billingSubscriptionPreview = await getSubscriptionPreview(context, {
        billingOrganization,
        billingSubscriptionPlan: dto,
      });

      if (!billingSubscriptionPreview.ok) {
        return {
          ok: false,
          resultCode: billingSubscriptionPreview.resultCode,
        };
      }

      if (!billingOrganization.billingMethodNice) {
        return {
          ok: false,
          resultCode: resultCode('organization-method-nice-not-found'),
        };
      }

      const createPurchaseResult = await createPurchase(context, this.billingMethodNiceCaller, {
        billingMethodNiceId: billingOrganization.billingMethodNice?.billingMethodNiceId,
        period: billingSubscriptionPreview.subscriptionPlan.period,
        amount: billingSubscriptionPreview.totalPrice,
        // TODO: change to goodsName
        goodsName: billingSubscriptionPreview.subscriptionPlan.type,
      });
      if (!createPurchaseResult.ok) {
        return {
          ok: false,
          resultCode: createPurchaseResult.resultCode,
        };
      }

      const createSubscriptionPlanResult = await createSubscriptionPlan(context, {
        billingOrganizationId: billingOrganization.billingOrganizationId,
        subscriptionPlanSourceData: billingSubscriptionPreview.subscriptionPlan,
        lastPurchasedPrice: billingSubscriptionPreview.totalPrice,
      });
      if (!createSubscriptionPlanResult.ok) {
        return {
          ok: false,
          resultCode: createSubscriptionPlanResult.resultCode,
        };
      }

      const remainingSubscriptionPlanIds = billingSubscriptionPreview.remainingPlans.map((plan) => plan.billingSubscriptionPlanId);
      await unsubscribeRemainingSubscriptionPlans(context, remainingSubscriptionPlanIds);

      if (billingSubscriptionPreview.coupon) {
        await registerUsedCoupon(context, {
          billingOrganizationId: billingOrganization.billingOrganizationId,
          billingCouponId: billingSubscriptionPreview.coupon.billingCouponId,
        });
      }

      // TODO: create history
      return {
        ok: true,
        resultCode: resultCode('ok'),
      };
    });
  }

  async createPurchaseSubscriptionWithNewCard(dto: CreatePurchaseSubscriptionWithNewCardDto): Promise<CreatePurchaseSubscriptionWithNewCardResponse> {
    return await retrySerialize(this.logger, this.dataSource, async (context) => {
      const { manager } = context;
      const { registerCard } = dto;
      const billingOrganization = await findOrganizationWithMethodAndSubscriptionPlans(context, dto);
      if (!billingOrganization) {
        return {
          ok: false,
          resultCode: resultCode('organization-not-found'),
        };
      }

      const billingSubscriptionPreview = await getSubscriptionPreview(context, {
        billingOrganization,
        billingSubscriptionPlan: dto,
      });

      if (!billingSubscriptionPreview.ok) {
        return {
          ok: false,
          resultCode: billingSubscriptionPreview.resultCode,
        };
      }

      const billingMethodNice = await createOrUpdateMethodNice(context, this.billingMethodNiceCaller, {
        billingOrganizationId: billingOrganization.billingOrganizationId,
        subscribeRegist: {
          registerCard,
        },
      });

      const createPurchaseResult = await createPurchase(context, this.billingMethodNiceCaller, {
        billingMethodNiceId: billingMethodNice.billingMethodNiceId,
        period: billingSubscriptionPreview.subscriptionPlan.period,
        amount: billingSubscriptionPreview.totalPrice,
        // TODO: change to goodsName
        goodsName: billingSubscriptionPreview.subscriptionPlan.type,
      });
      if (!createPurchaseResult.ok) {
        return {
          ok: false,
          resultCode: createPurchaseResult.resultCode,
        };
      }

      const createSubscriptionPlanResult = await createSubscriptionPlan(context, {
        billingOrganizationId: billingOrganization.billingOrganizationId,
        subscriptionPlanSourceData: billingSubscriptionPreview.subscriptionPlan,
        lastPurchasedPrice: billingSubscriptionPreview.totalPrice,
      });
      if (!createSubscriptionPlanResult.ok) {
        return {
          ok: false,
          resultCode: createSubscriptionPlanResult.resultCode,
        };
      }

      const remainingSubscriptionPlanIds = billingSubscriptionPreview.remainingPlans.map((plan) => plan.billingSubscriptionPlanId);
      await unsubscribeRemainingSubscriptionPlans(context, remainingSubscriptionPlanIds);

      if (billingSubscriptionPreview.coupon) {
        await registerUsedCoupon(context, {
          billingOrganizationId: billingOrganization.billingOrganizationId,
          billingCouponId: billingSubscriptionPreview.coupon.billingCouponId,
        });
      }

      // TODO: create history
      return {
        ok: true,
        resultCode: resultCode('ok'),
      };
    });
  }
}
