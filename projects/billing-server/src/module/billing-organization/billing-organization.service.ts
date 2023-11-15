import { CreateBillingOrganizationDto, FindBillingOrganizationDto } from '@dogu-private/console';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BillingOrganization } from '../../db/entity/billing-organization.entity';
import { RetryTransaction } from '../../db/retry-transaction';
import { DoguLogger } from '../logger/logger';
import {
  createBillingOrganization,
  findBillingOrganizationWithMethod,
  findBillingOrganizationWithMethodAndSubscriptionPlans,
  findBillingOrganizationWithSubscriptionPlans,
} from './billing-organization.serializables';

@Injectable()
export class BillingOrganizationService {
  private readonly retryTransaction: RetryTransaction;

  constructor(
    private readonly logger: DoguLogger,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {
    this.retryTransaction = new RetryTransaction(this.logger, this.dataSource);
  }

  async findOrganizationWithMethod(dto: FindBillingOrganizationDto): Promise<BillingOrganization | null> {
    return await this.retryTransaction.serializable(async (context) => {
      return await findBillingOrganizationWithMethod(context, dto);
    });
  }

  async findOrganizationWithSubscriptionPlans(dto: FindBillingOrganizationDto): Promise<BillingOrganization | null> {
    return await this.retryTransaction.serializable(async (context) => {
      return await findBillingOrganizationWithSubscriptionPlans(context, dto);
    });
  }

  async findOrganizationWithMethodAndSubscriptionPlans(dto: FindBillingOrganizationDto): Promise<BillingOrganization | null> {
    return await this.retryTransaction.serializable(async (context) => {
      return await findBillingOrganizationWithMethodAndSubscriptionPlans(context, dto);
    });
  }

  async createOrganization(dto: CreateBillingOrganizationDto): Promise<BillingOrganization> {
    return await this.retryTransaction.serializable(async (context) => {
      return await createBillingOrganization(context, dto);
    });
  }
}
