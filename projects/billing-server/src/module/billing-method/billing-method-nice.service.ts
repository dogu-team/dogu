import { CreateOrUpdateBillingMethodNiceDto } from '@dogu-private/console';
import { errorify } from '@dogu-tech/common';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { v4 } from 'uuid';
import { BillingMethodNice } from '../../db/entity/billing-method-nice.entity';
import { retrySerialize } from '../../db/utils';
import { DoguLogger } from '../logger/logger';
import { BillingMethodNiceCaller } from './billing-method-nice.caller';

@Injectable()
export class BillingMethodNiceService {
  constructor(
    private readonly logger: DoguLogger,
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly billingMethodNiceCaller: BillingMethodNiceCaller,
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
          const { billingOrganizationId, cardNo } = dto;
          const cardNoLast4 = cardNo.slice(-4);
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
              cardNoLast4,
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
            cardNoLast4,
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
}
