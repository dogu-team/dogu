import { CreateBillingOrganizationDto, FindBillingOrganizationDto } from '@dogu-private/console';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BillingOrganization } from '../../db/entity/billing-organization.entity';
import { retrySerialize } from '../../db/utils';
import { DoguLogger } from '../logger/logger';
import {
  createOrganization,
  findOrganizationWithMethod,
  findOrganizationWithMethodAndSubscriptionPlans,
  findOrganizationWithSubscriptionPlans,
} from './billing-organization.serializables';

@Injectable()
export class BillingOrganizationService {
  constructor(
    private readonly logger: DoguLogger,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async findOrganizationWithMethod(dto: FindBillingOrganizationDto): Promise<BillingOrganization | null> {
    return await retrySerialize(this.logger, this.dataSource, async (context) => {
      return await findOrganizationWithMethod(context, dto);
    });
  }

  async findOrganizationWithSubscriptionPlans(dto: FindBillingOrganizationDto): Promise<BillingOrganization | null> {
    return await retrySerialize(this.logger, this.dataSource, async (context) => {
      return await findOrganizationWithSubscriptionPlans(context, dto);
    });
  }

  async findOrganizationWithMethodAndSubscriptionPlans(dto: FindBillingOrganizationDto): Promise<BillingOrganization | null> {
    return await retrySerialize(this.logger, this.dataSource, async (context) => {
      return await findOrganizationWithMethodAndSubscriptionPlans(context, dto);
    });
  }

  async createOrganization(dto: CreateBillingOrganizationDto): Promise<BillingOrganization> {
    return await retrySerialize(this.logger, this.dataSource, async (context) => {
      return await createOrganization(context, dto);
    });
  }
}
