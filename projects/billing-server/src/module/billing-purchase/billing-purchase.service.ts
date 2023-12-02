import {
  CreatePurchaseDto,
  CreatePurchaseResponse,
  CreatePurchaseWithNewCardDto,
  CreatePurchaseWithNewCardResponse,
  GetBillingPrecheckoutDto,
  GetBillingPrecheckoutResponse,
  GetBillingPreviewDto,
  GetBillingPreviewResponse,
  RefundFullDto,
  RefundPlanDto,
} from '@dogu-private/console';
import { assertUnreachable } from '@dogu-tech/common';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { RetryTransaction } from '../../db/retry-transaction';
import { ConsoleService } from '../console/console.service';
import { DateTimeSimulatorService } from '../date-time-simulator/date-time-simulator.service';
import { DoguLogger } from '../logger/logger';
import { NiceCaller } from '../nice/nice.caller';
import { PaddleCaller } from '../paddle/paddle.caller';
import { SlackService } from '../slack/slack.service';
import { BillingPurchaseNiceService } from './billing-purchase.nice.service';
import { BillingPurchasePaddleService } from './billing-purchase.paddle.service';

@Injectable()
export class BillingPurchaseService {
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
    private readonly billingPurchaseNiceService: BillingPurchaseNiceService,
    private readonly billingPurchasePaddleService: BillingPurchasePaddleService,
  ) {
    this.retryTransaction = new RetryTransaction(this.logger, this.dataSource);
  }

  async getPreview(dto: GetBillingPreviewDto): Promise<GetBillingPreviewResponse> {
    const { method } = dto;
    switch (method) {
      case 'nice': {
        return await this.billingPurchaseNiceService.getPreview(dto);
      }
      case 'paddle': {
        return await this.billingPurchasePaddleService.getPreview(dto);
      }
      default: {
        assertUnreachable(method);
      }
    }
  }

  async createPurchase(dto: CreatePurchaseDto): Promise<CreatePurchaseResponse> {
    const { method } = dto;
    switch (method) {
      case 'nice': {
        return await this.billingPurchaseNiceService.createPurchase(dto);
      }
      case 'paddle': {
        return await this.billingPurchasePaddleService.createPurchase(dto);
      }
      default: {
        assertUnreachable(method);
      }
    }
  }

  async createPurchaseWithNewCard(dto: CreatePurchaseWithNewCardDto): Promise<CreatePurchaseWithNewCardResponse> {
    const { method } = dto;
    switch (method) {
      case 'nice': {
        return await this.billingPurchaseNiceService.createPurchaseWithNewCard(dto);
      }
      case 'paddle': {
        throw new BadRequestException({
          reason: 'not supported method',
        });
      }
      default: {
        assertUnreachable(method);
      }
    }
  }

  async refundPlan(dto: RefundPlanDto): Promise<void> {
    const { method } = dto;
    switch (method) {
      case 'nice': {
        return await this.billingPurchaseNiceService.refundPlan(dto);
      }
      case 'paddle': {
        throw new BadRequestException({
          reason: 'not supported method',
          method,
        });
      }
      default: {
        assertUnreachable(method);
      }
    }
  }

  async refundFull(dto: RefundFullDto): Promise<void> {
    const { method } = dto;
    switch (method) {
      case 'nice': {
        return await this.billingPurchaseNiceService.refundFull(dto);
      }
      case 'paddle': {
        throw new BadRequestException({
          reason: 'not supported method',
          method,
        });
      }
      default: {
        assertUnreachable(method);
      }
    }
  }

  async getPrecheckout(dto: GetBillingPrecheckoutDto): Promise<GetBillingPrecheckoutResponse> {
    return await this.billingPurchasePaddleService.getPrecheckout(dto);
  }
}
