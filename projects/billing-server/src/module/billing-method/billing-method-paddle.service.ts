import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { v4 } from 'uuid';
import { BillingMethodPaddle } from '../../db/entity/billing-method-paddle.entity';
import { BillingOrganization } from '../../db/entity/billing-organization.entity';
import { RetryTransaction } from '../../db/retry-transaction';
import { DoguLogger } from '../logger/logger';
import { PaddleCaller } from '../paddle/paddle.caller';
import { BillingMethodPaddleCustomerService } from './billing-method-paddle.customer-service';

export interface CreateOrUpdateMethodPaddleOptions {
  organizationId: string;
  email: string;
}

export interface FindMethodPaddleByOrganizationIdOptions {
  organizationId: string;
}

@Injectable()
export class BillingMethodPaddleService {
  private readonly retryTransaction: RetryTransaction;

  constructor(
    private readonly logger: DoguLogger,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly paddleCaller: PaddleCaller,
    private readonly billingMethodPaddleCustomerService: BillingMethodPaddleCustomerService,
  ) {
    this.retryTransaction = new RetryTransaction(this.logger, this.dataSource);
  }

  async createOrUpdate(options: CreateOrUpdateMethodPaddleOptions): Promise<BillingMethodPaddle> {
    const { email, organizationId } = options;
    const billingMethodPaddle = await this.retryTransaction.serializable(async (context) => {
      const { manager } = context;
      return await manager.getRepository(BillingMethodPaddle).findOne({
        where: {
          billingOrganization: {
            organizationId,
          },
        },
        relations: {
          billingOrganization: true,
        },
      });
    });

    if (!billingMethodPaddle) {
      const customer = await this.billingMethodPaddleCustomerService.createCustomer(options);
      if (!customer.id) {
        throw new Error(`Paddle customer id is empty. customer: ${JSON.stringify(customer)}`);
      }

      const billingMethodPaddle = await this.retryTransaction.serializable(async (context) => {
        const { manager } = context;
        const billingOrganization = await manager.getRepository(BillingOrganization).findOne({
          where: {
            organizationId,
          },
        });
        if (!billingOrganization) {
          throw new Error(`BillingOrganization not found. organizationId: ${organizationId}`);
        }

        const created = manager.getRepository(BillingMethodPaddle).create({
          billingMethodPaddleId: v4(),
          billingOrganization,
          customerId: customer.id,
        });
        const saved = await manager.getRepository(BillingMethodPaddle).save(created);
        return saved;
      });

      return billingMethodPaddle;
    }

    const { customerId } = billingMethodPaddle;
    const customer = await this.billingMethodPaddleCustomerService.getCustomer({
      customerId,
      organizationId,
    });
    if (customer.email !== email) {
      await this.billingMethodPaddleCustomerService.updateCustomer({
        customerId,
        email,
        organizationId,
      });
      return billingMethodPaddle;
    }

    return billingMethodPaddle;
  }
}
