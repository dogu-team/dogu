import { CreateCloudLicenseDto } from '@dogu-private/console';
import { OrganizationId } from '@dogu-private/types';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { v4 } from 'uuid';

import { CloudLicense } from '../../db/entity/cloud-license.entity';

@Injectable()
export class CloudLicenseService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async createLicense(dto: CreateCloudLicenseDto): Promise<CloudLicense> {
    const { organizationId } = dto;
    const existingLicense = await this.dataSource.manager.getRepository(CloudLicense).findOne({ where: { organizationId } });

    if (existingLicense) {
      throw new ConflictException(`Organization already has a cloud license. organizationId: ${organizationId}`);
    }

    const license = this.dataSource.manager.getRepository(CloudLicense).create({ cloudLicenseId: v4(), organizationId });
    const rv = await this.dataSource.manager.getRepository(CloudLicense).save(license);
    return rv;
  }

  async findLicense(organizationId: OrganizationId): Promise<CloudLicense> {
    const license = await this.dataSource.manager.getRepository(CloudLicense).findOne({
      where: { organizationId },
      relations: ['cloudSubscriptionItems'],
    });

    if (!license) {
      throw new NotFoundException(`Organization does not have a cloud license. organizationId: ${organizationId}`);
    }

    return license;
  }
}
