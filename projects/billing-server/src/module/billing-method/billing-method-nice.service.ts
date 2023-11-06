import { FindBillingMethodDto, FindBillingMethodResponse } from '@dogu-private/console';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { retrySerialize } from '../../db/utils';
import { DoguLogger } from '../logger/logger';
import { findBillingMethods } from './billing-method-nice.serializables';

@Injectable()
export class BillingMethodNiceService {
  constructor(
    private readonly logger: DoguLogger,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async findBillingMethods(dto: FindBillingMethodDto): Promise<FindBillingMethodResponse> {
    return await retrySerialize(this.logger, this.dataSource, async (context) => {
      return await findBillingMethods(context, dto);
    });
  }
}
