import { CreateOrUpdateBillingMethodNiceDto, CreatePurchaseBillingMethodNiceDto } from '@dogu-private/console';
import { errorify } from '@dogu-tech/common';
import { forwardRef, Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { v4 } from 'uuid';
import { BillingMethodNice } from '../../db/entity/billing-method-nice.entity';
import { retrySerialize } from '../../db/utils';
import { BillingOrganizationService } from '../billing-organization/billing-organization.service';
import { DoguLogger } from '../logger/logger';
import { BillingMethodNiceCaller } from './billing-method-nice.caller';

@Injectable()
export class BillingMethodNiceService {
  constructor(
    private readonly logger: DoguLogger,
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly billingMethodNiceCaller: BillingMethodNiceCaller,
    @Inject(forwardRef(() => BillingOrganizationService))
    private readonly billingOrganizationService: BillingOrganizationService,
  ) {}

  async createOrUpdate(dto: CreateOrUpdateBillingMethodNiceDto): Promise<BillingMethodNice> {
    let bid: string | null = null;
    const subscribeExpire = async (): Promise<void> => {
      if (bid) {
        try {
          await this.billingMethodNiceCaller.subscribeExpire({ bid });
        } catch (e) {
          this.logger.error('BillingMethodNiceService.createOrUpdate.subscribeExpire failed', { bid, error: errorify(e) });
        } finally {
          bid = null;
        }
      }
    };

    try {
      const billingMethodNice = await retrySerialize(
        this.logger,
        this.dataSource,
        async (manager) => {
          const { billingOrganizationId, cardNumber } = dto;
          const cardNumberLast4Digits = cardNumber.slice(-4);
          const billingOrganization = await manager.getRepository(BillingMethodNice).findOne({ where: { billingOrganizationId } });
          bid = billingOrganization?.bid ?? null;
          await subscribeExpire();

          const subscribeRegistResponse = await this.billingMethodNiceCaller.subscribeRegist(dto);
          const { cardCode, cardName } = subscribeRegistResponse;
          bid = subscribeRegistResponse.bid;

          if (billingOrganization) {
            const updated = manager.getRepository(BillingMethodNice).merge(billingOrganization, {
              bid,
              cardCode,
              cardName,
              cardNumberLast4Digits,
              subscribeRegistResponse: subscribeRegistResponse as unknown as Record<string, unknown>,
            });
            const saved = await manager.getRepository(BillingMethodNice).save(updated);
            return saved;
          }

          const created = manager.getRepository(BillingMethodNice).create({
            billingMethodNiceId: v4(),
            billingOrganizationId,
            bid,
            cardCode,
            cardName,
            cardNumberLast4Digits,
            subscribeRegistResponse: subscribeRegistResponse as unknown as Record<string, unknown>,
          });
          const saved = await manager.getRepository(BillingMethodNice).save(created);
          return saved;
        },
        {
          onAfterRollback: async (error) => {
            await subscribeExpire();
          },
        },
      );

      return billingMethodNice;
    } catch (e) {
      const error = errorify(e);
      this.logger.error('BillingMethodNiceService.create failed', { error });
      await subscribeExpire();

      throw new InternalServerErrorException(error);
    }
  }

  async createPurchase(dto: CreatePurchaseBillingMethodNiceDto): Promise<void> {
    const { organizationId, amount, goodsName } = dto;
    const billingOrganization = await this.billingOrganizationService.find({ organizationId });
    if (!billingOrganization?.billingMethodNice?.bid) {
      throw new InternalServerErrorException('payment method not found');
    }

    const response = await this.billingMethodNiceCaller.subscribePayments({
      bid: billingOrganization?.billingMethodNice?.bid,
      amount,
      goodsName,
    });
    this.logger.info('BillingMethodNiceService.createPurchase.subscribePayments', { response });
  }
}
