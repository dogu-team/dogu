import { CreateSelfHostedLicenseDto } from '@dogu-private/console';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { SelfHostedLicense } from '../../db/entity/self-hosted-license.entity';
import { retrySerialize } from '../../db/utils';
import { DoguLogger } from '../logger/logger';
import { FindSelfHostedLicenseQueryDto } from './self-hosted-license.dto';
import { createSelfHostedLicense, findSelfHostedLicense } from './self-hosted-license.serializables';

@Injectable()
export class SelfHostedLicenseService {
  constructor(
    private readonly logger: DoguLogger,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async createSelfHostedLicense(dto: CreateSelfHostedLicenseDto): Promise<SelfHostedLicense> {
    return await retrySerialize(this.logger, this.dataSource, async (context) => {
      return await createSelfHostedLicense(context, dto);
    });
  }

  async findSelfHostedLicense(dto: FindSelfHostedLicenseQueryDto): Promise<SelfHostedLicense> {
    return await retrySerialize(this.logger, this.dataSource, async (context) => {
      return await findSelfHostedLicense(context, dto);
    });
  }
}
