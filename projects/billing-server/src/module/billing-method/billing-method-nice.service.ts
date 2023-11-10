import { UpdateBillingMethodResponse, UpdateMethodNiceDto } from '@dogu-private/console';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { retrySerialize } from '../../db/utils';
import { DateTimeSimulatorService } from '../date-time-simulator/date-time-simulator.service';
import { DoguLogger } from '../logger/logger';
import { BillingMethodNiceCaller } from './billing-method-nice.caller';
import { updateBillingMethod } from './billing-method-nice.serializables';

@Injectable()
export class BillingMethodNiceService {
  constructor(
    private readonly logger: DoguLogger,
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly billingMethodNiceCaller: BillingMethodNiceCaller,
    private readonly dateTimeSimulatorService: DateTimeSimulatorService,
  ) {}

  async updateBillingMethod(dto: UpdateMethodNiceDto): Promise<UpdateBillingMethodResponse> {
    return await retrySerialize(this.logger, this.dataSource, async (context) => {
      const now = this.dateTimeSimulatorService.now();
      return await updateBillingMethod(context, {
        billingMethodNiceCaller: this.billingMethodNiceCaller,
        dto,
        now,
      });
    });
  }
}
