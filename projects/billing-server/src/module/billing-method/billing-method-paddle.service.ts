import { BillingResult, CreateOrUpdateMethodPaddleDto, resultCode } from '@dogu-private/console';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { v4 } from 'uuid';
import { BillingMethodPaddle } from '../../db/entity/billing-method-paddle.entity';
import { BillingOrganization } from '../../db/entity/billing-organization.entity';
import { RetryTransaction } from '../../db/retry-transaction';
import { DoguLogger } from '../logger/logger';
import { PaddleCaller } from '../paddle/paddle.caller';

@Injectable()
export class BillingMethodPaddleService {
  private readonly retryTransaction: RetryTransaction;

  constructor(
    private readonly logger: DoguLogger,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly paddleCaller: PaddleCaller,
  ) {
    this.retryTransaction = new RetryTransaction(this.logger, this.dataSource);
  }

  async createOrUpdate(dto: CreateOrUpdateMethodPaddleDto): Promise<BillingResult<BillingMethodPaddle>> {
    const { email, organizationId } = dto;
    const billingMethodPaddleResult = await this.retryTransaction.serializable<BillingResult<BillingMethodPaddle>>(async (context) => {
      const { manager } = context;
      const billingMethodPaddle = await manager.getRepository(BillingMethodPaddle).findOne({
        where: {
          billingOrganization: {
            organizationId,
          },
        },
        relations: {
          billingOrganization: true,
        },
      });

      if (billingMethodPaddle) {
        if (billingMethodPaddle.customerId) {
          return {
            ok: true,
            value: billingMethodPaddle,
          };
        }

        const result = await this.paddleCaller.createCustomer({
          email,
          organizationId,
        });
        if (!result.ok) {
          return result;
        }

        const customerId = result.value.id;
        if (!customerId) {
          return {
            ok: false,
            resultCode: resultCode('method-paddle-customer-id-not-found', {
              organizationId,
            }),
          };
        }

        const updated = await this.retryTransaction.serializable(async (context) => {
          const { manager } = context;
          billingMethodPaddle.customerId = customerId;
          const updated = await manager.getRepository(BillingMethodPaddle).save(billingMethodPaddle);
          return updated;
        });

        return {
          ok: true,
          value: updated,
        };
      }

      const billingOrganization = await manager.getRepository(BillingOrganization).findOne({
        where: {
          organizationId,
        },
      });
      if (!billingOrganization) {
        return {
          ok: false,
          resultCode: resultCode('organization-not-found', {
            organizationId,
          }),
        };
      }

      const created = manager.getRepository(BillingMethodPaddle).create({
        billingMethodPaddleId: v4(),
        billingOrganizationId: billingOrganization.billingOrganizationId,
      });
      const saved = await manager.getRepository(BillingMethodPaddle).save(created);
      return {
        ok: true,
        value: saved,
      };
    });

    if (!billingMethodPaddleResult.ok) {
      return billingMethodPaddleResult;
    }

    const billingMethodPaddle = billingMethodPaddleResult.value;
    if (!billingMethodPaddle.customerId) {
      const result = await this.paddleCaller.createCustomer({
        email,
        organizationId,
      });
      if (!result.ok) {
        return result;
      }

      const customerId = result.value.id;
      if (!customerId) {
        return {
          ok: false,
          resultCode: resultCode('method-paddle-customer-id-not-found', {
            organizationId,
          }),
        };
      }

      const updated = await this.retryTransaction.serializable(async (context) => {
        const { manager } = context;
        billingMethodPaddle.customerId = customerId;
        const updated = await manager.getRepository(BillingMethodPaddle).save(billingMethodPaddle);
        return updated;
      });

      return {
        ok: true,
        value: updated,
      };
    }

    const { customerId } = billingMethodPaddle;
    const result = await this.paddleCaller.getCustomer({ customerId });
    if (!result.ok) {
      return result;
    }

    const customer = result.value;
    if (customer.email !== email) {
      const result = await this.paddleCaller.updateCustomer({
        customerId,
        email,
      });
      if (!result.ok) {
        return result;
      }

      return {
        ok: true,
        value: billingMethodPaddle,
      };
    }

    return {
      ok: true,
      value: billingMethodPaddle,
    };
  }
}
