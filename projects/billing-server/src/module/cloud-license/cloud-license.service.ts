import { CloudLicenseResponse, CreateCloudLicenseDto, FindCloudLicenseDto } from '@dogu-private/console';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { CloudLicense } from '../../db/entity/cloud-license.entity';
import { retrySerialize } from '../../db/utils';
import { DoguLogger } from '../logger/logger';
import { createCloudLicense, findCloudLicense } from './cloud-license.serializables';

@Injectable()
export class CloudLicenseService {
  constructor(
    private readonly logger: DoguLogger,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async createCloudLicense(dto: CreateCloudLicenseDto): Promise<CloudLicense> {
    return await retrySerialize(this.logger, this.dataSource, async (context) => {
      return await createCloudLicense(context, dto);
    });
  }

  async findCloudLicense(dto: FindCloudLicenseDto): Promise<CloudLicenseResponse> {
    return await retrySerialize(this.logger, this.dataSource, async (context) => {
      return await findCloudLicense(context, dto);
    });
  }
}
