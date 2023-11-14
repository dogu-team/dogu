import { BillingSubscriptionPlanInfoResponse, UpdateBillingSubscriptionPlanInfoStateDto } from '@dogu-private/console';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { BillingOrganization } from '../../db/entity/billing-organization.entity';
import { BillingSubscriptionPlanInfo } from '../../db/entity/billing-subscription-plan-info.entity';
import { retrySerialize } from '../../db/utils';
import { BillingSubscriptionPlanInfoCommonModule } from '../common/plan-info-common.module';
import { DoguLogger } from '../logger/logger';
import { clearChangeRequested } from './billing-subscription-plan-info.utils';

@Injectable()
export class BillingSubscriptionPlanInfoService {
  constructor(
    private readonly logger: DoguLogger,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async getBillingSubscriptionPlanInfo(billingSubscriptionPlanInfoId: string): Promise<BillingSubscriptionPlanInfo> {
    return await retrySerialize(this.logger, this.dataSource, async (context) => {
      const { manager } = context;
      const found = await manager.getRepository(BillingSubscriptionPlanInfo).findOne({
        where: { billingSubscriptionPlanInfoId },
      });
      if (!found) {
        throw new NotFoundException(`BillingSubscriptionPlanInfo not found by id ${billingSubscriptionPlanInfoId}`);
      }
      return found;
    });
  }

  async cancelUnsubscribe(billingSubscriptionPlanInfoId: string, dto: UpdateBillingSubscriptionPlanInfoStateDto): Promise<BillingSubscriptionPlanInfoResponse> {
    return await retrySerialize(this.logger, this.dataSource, async (context) => {
      const { manager } = context;
      const { organizationId } = dto;
      const billingOrganization = await manager.getRepository(BillingOrganization).findOne({
        where: {
          organizationId,
        },
      });

      if (!billingOrganization) {
        throw new NotFoundException(`BillingOrganization not found by id ${organizationId}`);
      }

      const found = await manager.getRepository(BillingSubscriptionPlanInfo).findOne({
        where: { billingSubscriptionPlanInfoId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!found) {
        throw new NotFoundException(`BillingSubscriptionPlanInfo not found by id ${billingSubscriptionPlanInfoId}`);
      }

      if (found.state !== 'unsubscribe-requested') {
        throw new BadRequestException(`state is not unsubscribe-requested`);
      }

      found.state = 'subscribed';
      clearChangeRequested(found);
      found.billingOrganization = undefined;

      const saved = await manager.getRepository(BillingSubscriptionPlanInfo).save(found);
      return BillingSubscriptionPlanInfoCommonModule.createPlanInfoResponse(billingOrganization, saved);
    });
  }

  async cancelChangeOptionOrPeriod(billingSubscriptionPlanInfoId: string, dto: UpdateBillingSubscriptionPlanInfoStateDto): Promise<BillingSubscriptionPlanInfoResponse> {
    return await retrySerialize(this.logger, this.dataSource, async (context) => {
      const { manager } = context;
      const { organizationId } = dto;
      const billingOrganization = await manager.getRepository(BillingOrganization).findOne({
        where: {
          organizationId,
        },
      });

      if (!billingOrganization) {
        throw new NotFoundException(`BillingOrganization not found by id ${organizationId}`);
      }

      const found = await manager.getRepository(BillingSubscriptionPlanInfo).findOne({
        where: { billingSubscriptionPlanInfoId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!found) {
        throw new NotFoundException(`BillingSubscriptionPlanInfo not found by id ${billingSubscriptionPlanInfoId}`);
      }

      if (found.state !== 'change-option-or-period-requested') {
        throw new BadRequestException(`state is not change-option-or-period-requested`);
      }

      found.state = 'subscribed';
      clearChangeRequested(found);

      const saved = await manager.getRepository(BillingSubscriptionPlanInfo).save(found);
      return BillingSubscriptionPlanInfoCommonModule.createPlanInfoResponse(billingOrganization, saved);
    });
  }

  async unsubscribe(billingSubscriptionPlanInfoId: string, dto: UpdateBillingSubscriptionPlanInfoStateDto): Promise<BillingSubscriptionPlanInfoResponse> {
    return await retrySerialize(this.logger, this.dataSource, async (context) => {
      const { manager } = context;
      const { organizationId } = dto;
      const billingOrganization = await manager.getRepository(BillingOrganization).findOne({
        where: {
          organizationId,
        },
      });

      if (!billingOrganization) {
        throw new NotFoundException(`BillingOrganization not found by id ${organizationId}`);
      }

      const found = await manager.getRepository(BillingSubscriptionPlanInfo).findOne({
        where: { billingSubscriptionPlanInfoId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!found) {
        throw new NotFoundException(`BillingSubscriptionPlanInfo not found by id ${billingSubscriptionPlanInfoId}`);
      }

      if (found.state === 'unsubscribed' || found.state === 'unsubscribe-requested') {
        throw new BadRequestException(`state is already unsubscribed`);
      }

      found.state = 'unsubscribe-requested';
      clearChangeRequested(found);

      const saved = await manager.getRepository(BillingSubscriptionPlanInfo).save(found);
      return BillingSubscriptionPlanInfoCommonModule.createPlanInfoResponse(billingOrganization, saved);
    });
  }
}
