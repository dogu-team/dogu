import { FindBillingMethodDto, FindBillingMethodResponse, UpdateBillingMethodResponse, UpdateMethodNiceDto } from '@dogu-private/console';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { retrySerialize } from '../../db/utils';
import { DoguLogger } from '../logger/logger';
import { BillingMethodNiceCaller } from './billing-method-nice.caller';
import { findBillingMethods, updateBillingMethod } from './billing-method-nice.serializables';

@Injectable()
export class BillingMethodNiceService {
  constructor(
    private readonly logger: DoguLogger,
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly billingMethodNiceCaller: BillingMethodNiceCaller,
  ) {}

  async findBillingMethods(dto: FindBillingMethodDto): Promise<FindBillingMethodResponse> {
    return await retrySerialize(this.logger, this.dataSource, async (context) => {
      return await findBillingMethods(context, dto);
    });
  }

  async updateBillingMethod(dto: UpdateMethodNiceDto): Promise<UpdateBillingMethodResponse> {
    return await retrySerialize(this.logger, this.dataSource, async (context) => {
      return await updateBillingMethod(context, this.billingMethodNiceCaller, dto);
    });
  }
}
