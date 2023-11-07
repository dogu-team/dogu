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
import { findBillingOrganizationWithMethodAndSubscriptionPlans, findBillingOrganizationWithSubscriptionPlans } from '../billing-organization/billing-organization.serializables';
import { BillingOrganizationService } from '../billing-organization/billing-organization.service';
import { DoguLogger } from '../logger/logger';
import { processPurchaseSubscription, processPurchaseSubscriptionPreview } from './billing-purchase.serializables';

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
      const billingOrganization = await findBillingOrganizationWithSubscriptionPlans(context, dto);
      if (!billingOrganization) {
        return {
          ok: false,
          resultCode: resultCode('organization-not-found'),
        };
      }

      const processPurchaseSubscriptionPreviewResult = await processPurchaseSubscriptionPreview(context, {
        billingOrganization,
        dto,
      });
      if (!processPurchaseSubscriptionPreviewResult.ok) {
        return {
          ok: false,
          resultCode: processPurchaseSubscriptionPreviewResult.resultCode,
        };
      }

      return processPurchaseSubscriptionPreviewResult.previewResponse;
    });
  }

  async createPurchaseSubscription(dto: CreatePurchaseSubscriptionDto): Promise<CreatePurchaseSubscriptionResponse> {
    return await retrySerialize(this.logger, this.dataSource, async (context) => {
      const { manager } = context;
      const billingOrganization = await findBillingOrganizationWithMethodAndSubscriptionPlans(context, dto);
      if (!billingOrganization) {
        return {
          ok: false,
          resultCode: resultCode('organization-not-found'),
          plan: null,
        };
      }

      const processPurchaseSubscriptionPreviewResult = await processPurchaseSubscriptionPreview(context, {
        billingOrganization,
        dto,
      });
      if (!processPurchaseSubscriptionPreviewResult.ok) {
        return {
          ok: false,
          resultCode: processPurchaseSubscriptionPreviewResult.resultCode,
          plan: null,
        };
      }

      if (!processPurchaseSubscriptionPreviewResult.needPurchase) {
        return {
          ok: true,
          resultCode: resultCode('ok'),
          plan: null,
        };
      }

      if (!billingOrganization.billingMethodNice) {
        return {
          ok: false,
          resultCode: resultCode('organization-method-nice-not-found'),
          plan: null,
        };
      }

      return await processPurchaseSubscription(context, this.billingMethodNiceCaller, {
        billingMethodNice: billingOrganization.billingMethodNice,
        billingOrganization,
        billingSubscriptionPlanData: processPurchaseSubscriptionPreviewResult.billingSubscriptionPlanData,
        billingSubscriptionPlanSource: processPurchaseSubscriptionPreviewResult.billingSubscriptionPlanSource,
        newCoupon: processPurchaseSubscriptionPreviewResult.newCoupon,
        oldCoupon: processPurchaseSubscriptionPreviewResult.oldCoupon,
        totalPrice: processPurchaseSubscriptionPreviewResult.totalPrice,
        discountedAmount: processPurchaseSubscriptionPreviewResult.discountedAmount,
        previewResponse: processPurchaseSubscriptionPreviewResult.previewResponse,
        now: processPurchaseSubscriptionPreviewResult.now,
      });
    });
  }

  async createPurchaseSubscriptionWithNewCard(dto: CreatePurchaseSubscriptionWithNewCardDto): Promise<CreatePurchaseSubscriptionWithNewCardResponse> {
    return await retrySerialize(this.logger, this.dataSource, async (context) => {
      const { manager } = context;
      const { registerCard } = dto;
      const billingOrganization = await findBillingOrganizationWithMethodAndSubscriptionPlans(context, dto);
      if (!billingOrganization) {
        return {
          ok: false,
          resultCode: resultCode('organization-not-found'),
          plan: null,
        };
      }

      const processPurchaseSubscriptionPreviewResult = await processPurchaseSubscriptionPreview(context, {
        billingOrganization,
        dto,
      });
      if (!processPurchaseSubscriptionPreviewResult.ok) {
        return {
          ok: false,
          resultCode: processPurchaseSubscriptionPreviewResult.resultCode,
          plan: null,
        };
      }

      const billingMethodNice = await createOrUpdateMethodNice(context, this.billingMethodNiceCaller, {
        billingOrganizationId: billingOrganization.billingOrganizationId,
        subscribeRegist: {
          registerCard,
        },
      });

      if (!processPurchaseSubscriptionPreviewResult.needPurchase) {
        return {
          ok: true,
          resultCode: resultCode('ok'),
          plan: null,
        };
      }

      billingOrganization.billingMethodNice = billingMethodNice;
      return await processPurchaseSubscription(context, this.billingMethodNiceCaller, {
        billingMethodNice,
        billingOrganization,
        billingSubscriptionPlanData: processPurchaseSubscriptionPreviewResult.billingSubscriptionPlanData,
        billingSubscriptionPlanSource: processPurchaseSubscriptionPreviewResult.billingSubscriptionPlanSource,
        newCoupon: processPurchaseSubscriptionPreviewResult.newCoupon,
        oldCoupon: processPurchaseSubscriptionPreviewResult.oldCoupon,
        totalPrice: processPurchaseSubscriptionPreviewResult.totalPrice,
        discountedAmount: processPurchaseSubscriptionPreviewResult.discountedAmount,
        previewResponse: processPurchaseSubscriptionPreviewResult.previewResponse,
        now: processPurchaseSubscriptionPreviewResult.now,
      });
    });
  }
}
