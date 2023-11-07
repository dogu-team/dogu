import {
  CreatePurchaseSubscriptionDto,
  CreatePurchaseSubscriptionResponse,
  CreatePurchaseSubscriptionWithNewCardDto,
  CreatePurchaseSubscriptionWithNewCardResponse,
  getBillingMethodNicePublic,
  GetBillingSubscriptionPreviewDto,
  GetBillingSubscriptionPreviewResponse,
  resultCode,
} from '@dogu-private/console';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { retrySerialize } from '../../db/utils';
import { BillingMethodNiceCaller } from '../billing-method/billing-method-nice.caller';
import { createOrUpdateMethodNice } from '../billing-method/billing-method-nice.serializables';
import { findBillingOrganizationWithMethodAndSubscriptionPlans, findBillingOrganizationWithSubscriptionPlans } from '../billing-organization/billing-organization.serializables';
import { DoguLogger } from '../logger/logger';
import { processNextPurchaseSubscription, processNowPurchaseSubscription, processPurchaseSubscriptionPreview } from './billing-purchase.serializables';

@Injectable()
export class BillingPurchaseService {
  constructor(
    private readonly logger: DoguLogger,
    @InjectDataSource()
    private readonly dataSource: DataSource,
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

      const { previewResponse } = processPurchaseSubscriptionPreviewResult;
      return previewResponse;
    });
  }

  async createPurchaseSubscription(dto: CreatePurchaseSubscriptionDto): Promise<CreatePurchaseSubscriptionResponse> {
    return await retrySerialize(this.logger, this.dataSource, async (context) => {
      const { manager } = context;
      const billingOrganization = await findBillingOrganizationWithMethodAndSubscriptionPlans(context, dto);
      if (!billingOrganization) {
        return {
          ok: false,
          resultCode: resultCode('organization-not-found', {
            organizationId: dto.organizationId,
          }),
          plan: null,
          license: null,
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
          license: null,
        };
      }

      const { needPurchase } = processPurchaseSubscriptionPreviewResult;
      if (!needPurchase) {
        const processNextPurchaseSubscriptionResult = await processNextPurchaseSubscription(context, {
          billingOrganization,
          ...processPurchaseSubscriptionPreviewResult,
        });
        if (!processNextPurchaseSubscriptionResult.ok) {
          return {
            ok: false,
            resultCode: processNextPurchaseSubscriptionResult.resultCode,
            plan: null,
            license: null,
          };
        }

        return {
          ok: true,
          resultCode: resultCode('ok'),
          plan: null,
          license: null,
        };
      }

      return await processNowPurchaseSubscription(context, this.billingMethodNiceCaller, {
        billingMethodNice,
        billingOrganization,
        ...processPurchaseSubscriptionPreviewResult,
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
          method: null,
          license: null,
        };
      }
      const { billingOrganizationId } = billingOrganization;

      const processPurchaseSubscriptionPreviewResult = await processPurchaseSubscriptionPreview(context, {
        billingOrganization,
        dto,
      });
      if (!processPurchaseSubscriptionPreviewResult.ok) {
        return {
          ok: false,
          resultCode: processPurchaseSubscriptionPreviewResult.resultCode,
          plan: null,
          method: null,
          license: null,
        };
      }
      const { needPurchase } = processPurchaseSubscriptionPreviewResult;

      const billingMethodNice = await createOrUpdateMethodNice(context, this.billingMethodNiceCaller, {
        billingOrganizationId,
        subscribeRegist: {
          registerCard,
        },
      });

      const method = getBillingMethodNicePublic(billingMethodNice);
      if (!needPurchase) {
        const processNextPurchaseSubscriptionResult = await processNextPurchaseSubscription(context, {
          billingOrganization,
          ...processPurchaseSubscriptionPreviewResult,
        });
        if (!processNextPurchaseSubscriptionResult.ok) {
          return {
            ok: false,
            resultCode: processNextPurchaseSubscriptionResult.resultCode,
            plan: null,
            license: null,
            method,
          };
        }

        return {
          ok: true,
          resultCode: resultCode('ok'),
          plan: null,
          license: null,
          method,
        };
      }

      billingOrganization.billingMethodNice = billingMethodNice;
      const rv = await processNowPurchaseSubscription(context, this.billingMethodNiceCaller, {
        billingMethodNice,
        billingOrganization,
        ...processPurchaseSubscriptionPreviewResult,
      });

      return {
        ...rv,
        method,
      };
    });
  }
}
