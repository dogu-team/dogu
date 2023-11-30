import { BillingPlanInfoResponse, GetUpdatePaymentMethodTransactionResponse, UpdateBillingPlanInfoStateDto } from '@dogu-private/console';
import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { BillingOrganization } from '../../db/entity/billing-organization.entity';
import { BillingPlanInfo } from '../../db/entity/billing-plan-info.entity';
import { RetryTransaction } from '../../db/retry-transaction';
import { BillingPlanInfoResponseBuilder } from '../common/plan-info-common.module';
import { DoguLogger } from '../logger/logger';
import { PaddleCaller } from '../paddle/paddle.caller';
import { SlackService } from '../slack/slack.service';
import { clearChangeRequested } from './billing-plan-info.utils';

@Injectable()
export class BillingPlanInfoService {
  private readonly retryTransaction: RetryTransaction;

  constructor(
    private readonly logger: DoguLogger,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly slackService: SlackService,
    private readonly paddleCaller: PaddleCaller,
  ) {
    this.retryTransaction = new RetryTransaction(this.logger, this.dataSource);
  }

  async getBillingPlanInfo(billingPlanInfoId: string): Promise<BillingPlanInfo> {
    return await this.retryTransaction.serializable(async (context) => {
      const { manager } = context;
      const found = await manager.getRepository(BillingPlanInfo).findOne({
        where: { billingPlanInfoId },
      });
      if (!found) {
        throw new NotFoundException(`BillingPlanInfo not found by id ${billingPlanInfoId}`);
      }
      return found;
    });
  }

  async cancelUnsubscribe(billingPlanInfoId: string, dto: UpdateBillingPlanInfoStateDto): Promise<BillingPlanInfoResponse> {
    return await this.retryTransaction.serializable(async (context) => {
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

      const found = await manager.getRepository(BillingPlanInfo).findOne({
        where: { billingPlanInfoId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!found) {
        throw new NotFoundException(`BillingPlanInfo not found by id ${billingPlanInfoId}`);
      }

      if (found.state !== 'unsubscribe-requested') {
        throw new BadRequestException(`state is not unsubscribe-requested`);
      }

      found.state = 'subscribed';
      clearChangeRequested(found);
      found.billingOrganization = undefined;

      const saved = await manager.getRepository(BillingPlanInfo).save(found);

      if (!billingOrganization.billingMethodPaddle) {
        throw new InternalServerErrorException(`BillingOrganization does not have a billingMethodPaddle. organizationId: ${organizationId}`);
      }

      const paddleSubscriptions = await this.paddleCaller.listSubscriptionsAll({
        customerId: billingOrganization.billingMethodPaddle.customerId,
      });
      const subscription = paddleSubscriptions.find((subscription) => subscription.custom_data?.billingPlanInfoId === billingPlanInfoId);
      if (subscription) {
        if (!subscription.id) {
          throw new InternalServerErrorException({
            reason: `PaddleSubscription does not have a id. billingPlanInfoId: ${billingPlanInfoId}`,
            subscription,
          });
        }

        await this.paddleCaller.resumeSubscription({ subscriptionId: subscription.id });
      }

      return new BillingPlanInfoResponseBuilder(billingOrganization, paddleSubscriptions).build(saved);
    });
  }

  async cancelChangeOptionOrPeriod(billingPlanInfoId: string, dto: UpdateBillingPlanInfoStateDto): Promise<BillingPlanInfoResponse> {
    return await this.retryTransaction.serializable(async (context) => {
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

      const found = await manager.getRepository(BillingPlanInfo).findOne({
        where: { billingPlanInfoId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!found) {
        throw new NotFoundException(`BillingPlanInfo not found by id ${billingPlanInfoId}`);
      }

      if (found.state !== 'change-option-or-period-requested') {
        throw new BadRequestException(`state is not change-option-or-period-requested`);
      }

      found.state = 'subscribed';
      clearChangeRequested(found);

      const saved = await manager.getRepository(BillingPlanInfo).save(found);

      if (!billingOrganization.billingMethodPaddle) {
        throw new InternalServerErrorException(`BillingOrganization does not have a billingMethodPaddle. organizationId: ${organizationId}`);
      }

      const paddleSubscriptions = await this.paddleCaller.listSubscriptionsAll({
        customerId: billingOrganization.billingMethodPaddle.customerId,
      });
      return new BillingPlanInfoResponseBuilder(billingOrganization, paddleSubscriptions).build(saved);
    });
  }

  async unsubscribe(billingPlanInfoId: string, dto: UpdateBillingPlanInfoStateDto): Promise<BillingPlanInfoResponse> {
    return await this.retryTransaction.serializable(async (context) => {
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

      const found = await manager.getRepository(BillingPlanInfo).findOne({
        where: { billingPlanInfoId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!found) {
        throw new NotFoundException(`BillingPlanInfo not found by id ${billingPlanInfoId}`);
      }

      if (found.state === 'unsubscribed' || found.state === 'unsubscribe-requested') {
        throw new BadRequestException(`state is already unsubscribed`);
      }

      found.state = 'unsubscribe-requested';
      clearChangeRequested(found);

      const saved = await manager.getRepository(BillingPlanInfo).save(found);

      if (!billingOrganization.billingMethodPaddle) {
        throw new InternalServerErrorException(`BillingOrganization does not have a billingMethodPaddle. organizationId: ${organizationId}`);
      }

      const paddleSubscriptions = await this.paddleCaller.listSubscriptionsAll({
        customerId: billingOrganization.billingMethodPaddle.customerId,
      });
      const subscription = paddleSubscriptions.find((subscription) => subscription.custom_data?.billingPlanInfoId === billingPlanInfoId);
      if (subscription) {
        if (!subscription.id) {
          throw new InternalServerErrorException({
            reason: `PaddleSubscription does not have a id. billingPlanInfoId: ${billingPlanInfoId}`,
            subscription,
          });
        }

        await this.paddleCaller.pauseSubscription({ subscriptionId: subscription.id });
      }

      const billingPlanInfoResponse = new BillingPlanInfoResponseBuilder(billingOrganization, paddleSubscriptions).build(saved);

      this.slackService
        .sendUnsubscribeSlackMessage({
          organizationId,
          plan: {
            option: billingPlanInfoResponse.option,
            type: billingPlanInfoResponse.type,
          },
        })
        .catch((e) => this.logger.error(`planInfoService. Failed to send unsubscribe slack message`));
      return billingPlanInfoResponse;
    });
  }

  async getUpdatePaymentMethodTransaction(billingPlanInfoId: string): Promise<GetUpdatePaymentMethodTransactionResponse> {
    const billingPlanInfo = await this.dataSource.getRepository(BillingPlanInfo).findOne({
      where: { billingPlanInfoId },
      relations: {
        billingOrganization: {
          billingMethodPaddle: true,
        },
      },
    });

    if (!billingPlanInfo) {
      throw new NotFoundException(`BillingPlanInfo not found by id ${billingPlanInfoId}`);
    }

    if (!billingPlanInfo.billingOrganization) {
      throw new InternalServerErrorException(`BillingPlanInfo does not have a billingOrganization. billingPlanInfoId: ${billingPlanInfoId}`);
    }

    if (billingPlanInfo.billingOrganization.billingMethod !== 'paddle') {
      throw new BadRequestException(`BillingOrganization's billingMethod is not paddle. billingPlanInfoId: ${billingPlanInfoId}`);
    }

    if (!billingPlanInfo.billingOrganization.billingMethodPaddle) {
      throw new InternalServerErrorException(`BillingOrganization does not have a billingMethodPaddle. organizationId: ${billingPlanInfo.billingOrganization.organizationId}`);
    }

    const { customerId } = billingPlanInfo.billingOrganization.billingMethodPaddle;
    const paddleSubscription = await this.paddleCaller.findSubscription({ customerId, billingPlanInfoId });
    if (!paddleSubscription) {
      throw new NotFoundException(`PaddleSubscription not found by billingPlanInfoId ${billingPlanInfoId}`);
    }

    if (!paddleSubscription.id) {
      throw new InternalServerErrorException(`PaddleSubscription does not have a id. billingPlanInfoId: ${billingPlanInfoId}`);
    }

    const transaction = await this.paddleCaller.getUpdatePaymentMethodTransaction({ subscriptionId: paddleSubscription.id });
    if (!transaction.id) {
      throw new InternalServerErrorException(`PaddleTransaction does not have a id. billingPlanInfoId: ${billingPlanInfoId}`);
    }

    return {
      paddle: {
        customerId,
        transactionId: transaction.id,
      },
    };
  }
}
