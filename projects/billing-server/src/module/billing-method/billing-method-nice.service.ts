import { UpdateBillingMethodResponse, UpdateMethodNiceDto } from '@dogu-private/console';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { RetryTransaction } from '../../db/retry-transaction';
import { DateTimeSimulatorService } from '../date-time-simulator/date-time-simulator.service';
import { DoguLogger } from '../logger/logger';
import { NiceCaller } from '../nice/nice.caller';
import { updateBillingMethod } from './billing-method-nice.serializables';

@Injectable()
export class BillingMethodNiceService {
  private readonly retryTransaction: RetryTransaction;

  constructor(
    private readonly logger: DoguLogger,
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly niceCaller: NiceCaller,
    private readonly dateTimeSimulatorService: DateTimeSimulatorService,
  ) {
    this.retryTransaction = new RetryTransaction(this.logger, this.dataSource);
  }

  async updateBillingMethod(dto: UpdateMethodNiceDto): Promise<UpdateBillingMethodResponse> {
    return await this.retryTransaction.serializable(async (context) => {
      const now = this.dateTimeSimulatorService.now();
      return await updateBillingMethod(context, {
        niceCaller: this.niceCaller,
        dto,
        now,
      });
    });
  }
}
