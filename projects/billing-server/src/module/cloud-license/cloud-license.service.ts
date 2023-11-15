import { CloudLicenseResponse, CreateCloudLicenseDto, FindCloudLicenseDto } from '@dogu-private/console';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { CloudLicense } from '../../db/entity/cloud-license.entity';
import { RetryTransaction } from '../../db/retry-transaction';
import { DoguLogger } from '../logger/logger';
import { createCloudLicense, findCloudLicense } from './cloud-license.serializables';

@Injectable()
export class CloudLicenseService {
  private readonly retryTransaction: RetryTransaction;

  constructor(
    private readonly logger: DoguLogger,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {
    this.retryTransaction = new RetryTransaction(this.logger, this.dataSource);
  }

  async createCloudLicense(dto: CreateCloudLicenseDto): Promise<CloudLicense> {
    return await this.retryTransaction.serializable(async (context) => {
      return await createCloudLicense(context, dto);
    });
  }

  async findCloudLicense(dto: FindCloudLicenseDto): Promise<CloudLicenseResponse> {
    return await this.retryTransaction.serializable(async (context) => {
      return await findCloudLicense(context, dto);
    });
  }
}
