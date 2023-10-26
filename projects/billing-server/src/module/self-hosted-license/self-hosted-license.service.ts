import { CreateSelfHostedLicenseDto } from '@dogu-private/console';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { v4 } from 'uuid';

import { SelfHostedLicense } from '../../db/entity/self-hosted-license.entity';
import { LicenseKeyService } from '../common/license-key.service';
import { FindSelfHostedLicenseQueryDto } from './self-hosted-license.dto';

@Injectable()
export class SelfHostedLicenseService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async createLicense(dto: CreateSelfHostedLicenseDto): Promise<SelfHostedLicense> {
    const { organizationId, companyName, expiredAt } = dto;
    const existingLicense = await this.dataSource.manager.getRepository(SelfHostedLicense).findOne({ where: { organizationId, companyName } });

    if (existingLicense) {
      throw new ConflictException(`Organization already has a self-hosted license. organizationId: ${organizationId}`);
    }

    const licenseKey = LicenseKeyService.createLicensKey();

    const license = this.dataSource.manager.getRepository(SelfHostedLicense).create({ selfHostedLicenseId: v4(), organizationId, companyName, expiredAt, licenseKey });
    const rv = await this.dataSource.manager.getRepository(SelfHostedLicense).save(license);
    return rv;
  }

  async findLicense(dto: FindSelfHostedLicenseQueryDto): Promise<SelfHostedLicense> {
    const { organizationId, licenseKey } = dto;
    const license = await this.dataSource.manager.getRepository(SelfHostedLicense).findOne({ where: { organizationId, licenseKey } });

    if (!license) {
      throw new NotFoundException(`Organization does not have a self-hosted license. organizationId: ${organizationId}`);
    }

    return license;
  }
}
