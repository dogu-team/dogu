import { CreateSelfHostedLicenseDto, SelfHostedLicenseResponse } from '@dogu-private/console';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { SelfHostedLicense } from '../../db/entity/self-hosted-license.entity';
import { RetryTransaction } from '../../db/retry-transaction';
import { BillingOrganizationResponseBuilder } from '../common/plan-info-common.module';
import { DateTimeSimulatorService } from '../date-time-simulator/date-time-simulator.service';
import { DoguLogger } from '../logger/logger';
import { PaddleCaller } from '../paddle/paddle.caller';
import { FindSelfHostedLicenseQueryDto } from './self-hosted-license.dto';
import { createSelfHostedLicense, findSelfHostedLicense } from './self-hosted-license.serializables';

@Injectable()
export class SelfHostedLicenseService {
  private readonly retryTransaction: RetryTransaction;

  constructor(
    private readonly logger: DoguLogger,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly dateTimeSimulatorService: DateTimeSimulatorService,
    private readonly paddleCaller: PaddleCaller,
  ) {
    this.retryTransaction = new RetryTransaction(this.logger, this.dataSource);
  }

  async createSelfHostedLicense(dto: CreateSelfHostedLicenseDto): Promise<SelfHostedLicense> {
    return await this.retryTransaction.serializable(async (context) => {
      const now = this.dateTimeSimulatorService.now();
      return await createSelfHostedLicense(context, dto, now);
    });
  }

  async findSelfHostedLicense(dto: FindSelfHostedLicenseQueryDto): Promise<SelfHostedLicenseResponse> {
    const selfHostedLicense = await this.retryTransaction.serializable(async (context) => {
      return await findSelfHostedLicense(context, dto);
    });

    if (!selfHostedLicense.billingOrganization) {
      throw new InternalServerErrorException(`Self-hosted license does not have a billing organization. organizationId: ${dto.organizationId}`);
    }

    const builder = new BillingOrganizationResponseBuilder(selfHostedLicense.billingOrganization, []);
    selfHostedLicense.billingOrganization = builder.build();
    const selfHostedLicenseResponse = selfHostedLicense as SelfHostedLicenseResponse;
    return selfHostedLicenseResponse;
  }
}
