import { CreateSelfHostedLicenseDto } from '@dogu-private/console';
import { OrganizationId } from '@dogu-private/types';
import { ConflictException, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { v4 } from 'uuid';

import { SelfHostedLicense } from '../../db/entity/self-hosted-license.entity';

@Injectable()
export class SelfHostedLicenseService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async createLicense(dto: CreateSelfHostedLicenseDto): Promise<SelfHostedLicense> {
    const { organizationId, companyName } = dto;
    const existingLicense = await this.dataSource.manager.getRepository(SelfHostedLicense).findOne({ where: { organizationId, companyName } });

    if (existingLicense) {
      throw new ConflictException(`Organization already has a self-hosted license. organizationId: ${organizationId}`);
    }

    const license = this.dataSource.manager.getRepository(SelfHostedLicense).create({ selfHostedLicenseId: v4(), organizationId, companyName });
    const rv = await this.dataSource.manager.getRepository(SelfHostedLicense).save(license);
    return rv;
  }

  async getLicense(organizationId: OrganizationId): Promise<SelfHostedLicense> {
    const license = await this.dataSource.manager.getRepository(SelfHostedLicense).findOne({ where: { organizationId } });

    if (!license) {
      throw new ConflictException(`Organization does not have a self-hosted license. organizationId: ${organizationId}`);
    }

    return license;
  }
}
