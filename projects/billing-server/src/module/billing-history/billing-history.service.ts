import { GetBillingHistoriesDto, PageBase } from '@dogu-private/console';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BillingHistory } from '../../db/entity/billing-history.entity';
import { retrySerialize } from '../../db/utils';
import { DoguLogger } from '../logger/logger';
import { getHistories } from './billing-history.serializables';

@Injectable()
export class BillingHistoryService {
  constructor(
    private readonly logger: DoguLogger,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async getHistories(dto: GetBillingHistoriesDto): Promise<PageBase<BillingHistory>> {
    return await retrySerialize(this.logger, this.dataSource, async (context) => {
      return await getHistories(context, dto);
    });
  }
}
