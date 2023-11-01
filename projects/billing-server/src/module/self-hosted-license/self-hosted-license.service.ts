import { BillingOrganizationPropCamel, CreateSelfHostedLicenseDto, SelfHostedLicensePropCamel } from '@dogu-private/console';
import { stringify } from '@dogu-tech/common';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { v4 } from 'uuid';
import { BillingOrganization } from '../../db/entity/billing-organization.entity';
import { BillingSubscriptionPlan } from '../../db/entity/billing-subscription-plan.entity';

import { SelfHostedLicense } from '../../db/entity/self-hosted-license.entity';
import { retrySerialize } from '../../db/utils';
import { LicenseKeyService } from '../common/license-key.service';
import { DoguLogger } from '../logger/logger';
import { FindSelfHostedLicenseQueryDto } from './self-hosted-license.dto';

@Injectable()
export class SelfHostedLicenseService {
  constructor(
    private readonly logger: DoguLogger,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async createLicense(dto: CreateSelfHostedLicenseDto): Promise<SelfHostedLicense> {
    const { organizationId, companyName, expiredAt } = dto;
    const existingLicense = await this.dataSource.manager.getRepository(SelfHostedLicense).findOne({ where: { organizationId, companyName } });

    if (existingLicense) {
      throw new ConflictException(`Organization already has a self-hosted license. organizationId: ${stringify(organizationId)}`);
    }

    const licenseKey = LicenseKeyService.createLicensKey();

    const license = this.dataSource.manager.getRepository(SelfHostedLicense).create({ selfHostedLicenseId: v4(), organizationId, companyName, expiredAt, licenseKey });
    const rv = await this.dataSource.manager.getRepository(SelfHostedLicense).save(license);
    return rv;
  }

  async findLicense(dto: FindSelfHostedLicenseQueryDto): Promise<SelfHostedLicense> {
    return await retrySerialize(this.logger, this.dataSource, async (manager) => {
      const { organizationId, licenseKey } = dto;
      const license = await manager
        .getRepository(SelfHostedLicense)
        .createQueryBuilder(SelfHostedLicense.name)
        .leftJoinAndSelect(`${SelfHostedLicense.name}.${SelfHostedLicensePropCamel.billingOrganization}`, BillingOrganization.name)
        .leftJoinAndSelect(`${BillingOrganization.name}.${BillingOrganizationPropCamel.billingSubscriptionPlans}`, BillingSubscriptionPlan.name)
        .where({ organizationId, licenseKey })
        .getOne();

      if (!license) {
        throw new NotFoundException(`Organization does not have a self-hosted license. organizationId: ${organizationId}`);
      }

      return license;
    });
  }
}
