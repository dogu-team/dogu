import { CloudLicenseResponse, CreateCloudLicenseDto, FindCloudLicenseDto } from '@dogu-private/console';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { v4 } from 'uuid';

import { CloudLicense } from '../../db/entity/cloud-license.entity';
import { RetryTransaction } from '../../db/retry-transaction';
import { BillingMethodPaddleService } from '../billing-method/billing-method-paddle.service';
import { createBillingOrganization } from '../billing-organization/billing-organization.serializables';
import { BillingOrganizationResponseBuilder } from '../common/plan-info-common.module';
import { DoguLogger } from '../logger/logger';
import { PaddleCaller } from '../paddle/paddle.caller';
import { findCloudLicense } from './cloud-license.serializables';

@Injectable()
export class CloudLicenseService {
  private readonly retryTransaction: RetryTransaction;

  constructor(
    private readonly logger: DoguLogger,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly billingMethodPaddleService: BillingMethodPaddleService,
    private readonly paddleCaller: PaddleCaller,
  ) {
    this.retryTransaction = new RetryTransaction(this.logger, this.dataSource);
  }

  async createOrUpdateCloudLicense(dto: CreateCloudLicenseDto): Promise<CloudLicense> {
    const { organizationId } = dto;
    const cloudLicense = await this.retryTransaction.serializable(async (context) => {
      const { manager } = context;
      const cloudLicense = await manager.getRepository(CloudLicense).findOne({
        where: {
          organizationId,
        },
        relations: {
          billingOrganization: {
            billingMethodPaddle: true,
          },
        },
      });
      if (cloudLicense) {
        return cloudLicense;
      }

      const billingOrganization = await createBillingOrganization(context, {
        organizationId,
        category: 'cloud',
      });
      const created = manager.getRepository(CloudLicense).create({
        cloudLicenseId: v4(),
        organizationId,
        category: 'cloud',
        billingOrganization,
      });
      const saved = await manager.getRepository(CloudLicense).save(created);
      return saved;
    });

    const billingMethodPaddle = await this.billingMethodPaddleService.createOrUpdate(dto);
    if (!cloudLicense.billingOrganization) {
      throw new InternalServerErrorException('CloudLicense must have a billingOrganization');
    }

    cloudLicense.billingOrganization.billingMethodPaddle = billingMethodPaddle;
    return cloudLicense;
  }

  async findCloudLicense(dto: FindCloudLicenseDto): Promise<CloudLicenseResponse> {
    const cloudLicense = await this.retryTransaction.serializable(async (context) => {
      return await findCloudLicense(context, dto);
    });

    if (!cloudLicense.billingOrganization) {
      throw new InternalServerErrorException(`Cloud license does not have a billing organization. organizationId: ${dto.organizationId}`);
    }

    if (!cloudLicense.billingOrganization.billingMethodPaddle) {
      throw new InternalServerErrorException(`Cloud license does not have a billing method. organizationId: ${dto.organizationId}`);
    }

    const paddleSubscriptions = await this.paddleCaller.listSubscriptionsAll({
      customerId: cloudLicense.billingOrganization.billingMethodPaddle.customerId,
    });
    const paddleAddresses = await this.paddleCaller.listAddressesAll({
      customerId: cloudLicense.billingOrganization.billingMethodPaddle.customerId,
    });
    const builder = new BillingOrganizationResponseBuilder(cloudLicense.billingOrganization, paddleSubscriptions, paddleAddresses);
    cloudLicense.billingOrganization = builder.build();
    const cloudLicenseResponse = cloudLicense as CloudLicenseResponse;
    return cloudLicenseResponse;
  }
}
