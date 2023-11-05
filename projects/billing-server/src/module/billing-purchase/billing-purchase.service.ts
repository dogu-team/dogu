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
import { createOrUpdateMethodNice } from '../billing-method/billing-method-nice.serializables';
import { BillingMethodNiceService } from '../billing-method/billing-method-nice.service';
import { findOrganizationWithMethodAndSubscriptionPlans, findOrganizationWithSubscriptionPlans } from '../billing-organization/billing-organization.serializables';
import { BillingOrganizationService } from '../billing-organization/billing-organization.service';
import { DoguLogger } from '../logger/logger';
import { preprocessPurchaseSubscription, processPurchaseSubscription } from './billing-purchase.serializables';

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
      const organization = await findOrganizationWithSubscriptionPlans(context, dto);
      if (!organization) {
        return {
          ok: false,
          resultCode: resultCode('organization-not-found'),
        };
      }

      const preprocessPurchaseSubscriptionResult = await preprocessPurchaseSubscription(context, {
        organization,
        subscriptionPlan: dto,
      });
      if (!preprocessPurchaseSubscriptionResult.ok) {
        return {
          ok: false,
          resultCode: preprocessPurchaseSubscriptionResult.resultCode,
        };
      }

      return preprocessPurchaseSubscriptionResult.previewResponse;
    });
  }

  async createPurchaseSubscription(dto: CreatePurchaseSubscriptionDto): Promise<CreatePurchaseSubscriptionResponse> {
    return await retrySerialize(this.logger, this.dataSource, async (context) => {
      const { manager } = context;
      const organization = await findOrganizationWithMethodAndSubscriptionPlans(context, dto);
      if (!organization) {
        return {
          ok: false,
          resultCode: resultCode('organization-not-found'),
        };
      }

      const preprocessPurchaseSubscriptionResult = await preprocessPurchaseSubscription(context, {
        organization,
        subscriptionPlan: dto,
      });

      if (!preprocessPurchaseSubscriptionResult.ok) {
        return {
          ok: false,
          resultCode: preprocessPurchaseSubscriptionResult.resultCode,
        };
      }

      if (!organization.billingMethodNice) {
        return {
          ok: false,
          resultCode: resultCode('organization-method-nice-not-found'),
        };
      }

      return await processPurchaseSubscription(context, this.billingMethodNiceCaller, {
        methodNice: organization.billingMethodNice,
        organization,
        subscriptionPlanData: preprocessPurchaseSubscriptionResult.subscriptionPlanData,
        subscriptionPlanSource: preprocessPurchaseSubscriptionResult.subscriptionPlanSource,
        coupon: preprocessPurchaseSubscriptionResult.coupon,
        totalPrice: preprocessPurchaseSubscriptionResult.totalPrice,
        discountedAmount: preprocessPurchaseSubscriptionResult.discountedAmount,
        timezoneOffset: preprocessPurchaseSubscriptionResult.timezoneOffset,
        previewResponse: preprocessPurchaseSubscriptionResult.previewResponse,
      });
    });
  }

  async createPurchaseSubscriptionWithNewCard(dto: CreatePurchaseSubscriptionWithNewCardDto): Promise<CreatePurchaseSubscriptionWithNewCardResponse> {
    return await retrySerialize(this.logger, this.dataSource, async (context) => {
      const { manager } = context;
      const { registerCard } = dto;
      const organization = await findOrganizationWithMethodAndSubscriptionPlans(context, dto);
      if (!organization) {
        return {
          ok: false,
          resultCode: resultCode('organization-not-found'),
        };
      }

      const preprocessPurchaseSubscriptionResult = await preprocessPurchaseSubscription(context, {
        organization,
        subscriptionPlan: dto,
      });

      if (!preprocessPurchaseSubscriptionResult.ok) {
        return {
          ok: false,
          resultCode: preprocessPurchaseSubscriptionResult.resultCode,
        };
      }

      const billingMethodNice = await createOrUpdateMethodNice(context, this.billingMethodNiceCaller, {
        billingOrganizationId: organization.billingOrganizationId,
        subscribeRegist: {
          registerCard,
        },
      });

      return await processPurchaseSubscription(context, this.billingMethodNiceCaller, {
        methodNice: billingMethodNice,
        organization,
        subscriptionPlanData: preprocessPurchaseSubscriptionResult.subscriptionPlanData,
        subscriptionPlanSource: preprocessPurchaseSubscriptionResult.subscriptionPlanSource,
        coupon: preprocessPurchaseSubscriptionResult.coupon,
        totalPrice: preprocessPurchaseSubscriptionResult.totalPrice,
        discountedAmount: preprocessPurchaseSubscriptionResult.discountedAmount,
        timezoneOffset: preprocessPurchaseSubscriptionResult.timezoneOffset,
        previewResponse: preprocessPurchaseSubscriptionResult.previewResponse,
      });
    });
  }
}
