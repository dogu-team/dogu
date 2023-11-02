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
import { BillingMethodNiceService } from '../billing-method/billing-method-nice.service';
import { findOrganizationWithSubscriptionPlans } from '../billing-organization/billing-organization.serializables';
import { BillingOrganizationService } from '../billing-organization/billing-organization.service';
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
        billingSubscriptionPlan: dto.billingSubscriptionPlan,
      });
    });
  }

  async createPurchaseSubscription(dto: CreatePurchaseSubscriptionDto): Promise<CreatePurchaseSubscriptionResponse> {
    return await retrySerialize(this.logger, this.dataSource, async (context) => {
      const billingOrganization = await findOrganizationWithSubscriptionPlans(context, dto);
      if (!billingOrganization) {
        return {
          ok: false,
          resultCode: resultCode('organization-not-found'),
        };
      }

      const billingSubscriptionPreview = await getSubscriptionPreview(context, {
        billingOrganization,
        billingSubscriptionPlan: dto.billingSubscriptionPlan,
      });

      if (!billingSubscriptionPreview.ok) {
        return {
          ok: false,
          resultCode: billingSubscriptionPreview.resultCode,
        };
      }

      throw new Error('not implemented');
    });
  }

  async createPurchaseSubscriptionWithNewCard(dto: CreatePurchaseSubscriptionWithNewCardDto): Promise<CreatePurchaseSubscriptionWithNewCardResponse> {
    return await retrySerialize(this.logger, this.dataSource, async (context) => {
      const billingOrganization = await findOrganizationWithSubscriptionPlans(context, dto);
      if (!billingOrganization) {
        return {
          ok: false,
          resultCode: resultCode('organization-not-found'),
        };
      }

      const billingSubscriptionPreview = await getSubscriptionPreview(context, {
        billingOrganization,
        billingSubscriptionPlan: dto.billingSubscriptionPlan,
      });

      if (!billingSubscriptionPreview.ok) {
        return {
          ok: false,
          resultCode: billingSubscriptionPreview.resultCode,
        };
      }

      throw new Error('not implemented');
    });
  }
}
