import { BillingOrganizationProp, CloudLicenseProp, CreateCloudLicenseDto, FindCloudLicenseDto } from '@dogu-private/console';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { v4 } from 'uuid';
import { BillingOrganization } from '../../db/entity/billing-organization.entity';
import { BillingSubscriptionPlan } from '../../db/entity/billing-subscription-plan.entity';

import { CloudLicense } from '../../db/entity/cloud-license.entity';
import { retrySerialize } from '../../db/utils';
import { BillingOrganizationService } from '../billing-organization/billing-organization.service';
import { DoguLogger } from '../logger/logger';

@Injectable()
export class CloudLicenseService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly logger: DoguLogger,
  ) {}

  async createLicense(dto: CreateCloudLicenseDto): Promise<CloudLicense> {
    const { organizationId } = dto;
    return await retrySerialize(this.logger, this.dataSource, async (manager) => {
      const found = await manager.getRepository(CloudLicense).findOne({ where: { organizationId } });
      if (found) {
        throw new ConflictException(`CloudLicense already exists by organizationId ${organizationId}`);
      }

      const created = manager.getRepository(CloudLicense).create({
        cloudLicenseId: v4(),
        organizationId,
      });
      const saved = await manager.getRepository(CloudLicense).save(created);
      const billingOrganization = await BillingOrganizationService.create(manager, { organizationId, category: 'cloud' });
      return saved;
    });
  }

  async findLicense(dto: FindCloudLicenseDto): Promise<CloudLicense> {
    return await retrySerialize(this.logger, this.dataSource, async (manager) => {
      const { organizationId } = dto;
      const license = await manager
        .getRepository(CloudLicense)
        .createQueryBuilder(CloudLicense.name)
        .leftJoinAndSelect(`${CloudLicense.name}.${CloudLicenseProp.billingOrganization}`, BillingOrganization.name)
        .leftJoinAndSelect(`${BillingOrganization.name}.${BillingOrganizationProp.billingSubscriptionPlans}`, BillingSubscriptionPlan.name)
        .where(`${CloudLicense.name}.${CloudLicenseProp.organizationId} = :organizationId`, { organizationId })
        .getOne();

      if (!license) {
        throw new NotFoundException(`Organization does not have a cloud license. organizationId: ${organizationId}`);
      }

      return license;
    });
  }
}
