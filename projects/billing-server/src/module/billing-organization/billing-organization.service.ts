import { CreateBillingOrganizationDto, FindBillingOrganizationDto, UpdateBillingAddressDto, UpdateBillingAddressResponse, UpdateBillingEmailDto } from '@dogu-private/console';
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BillingOrganization } from '../../db/entity/billing-organization.entity';
import { RetryTransaction } from '../../db/retry-transaction';
import { DoguLogger } from '../logger/logger';
import { PaddleCaller } from '../paddle/paddle.caller';
import { createBillingOrganization, findBillingOrganization } from './billing-organization.serializables';

@Injectable()
export class BillingOrganizationService {
  private readonly retryTransaction: RetryTransaction;

  constructor(
    private readonly logger: DoguLogger,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly paddleCaller: PaddleCaller,
  ) {
    this.retryTransaction = new RetryTransaction(this.logger, this.dataSource);
  }

  async findOrganization(dto: FindBillingOrganizationDto): Promise<BillingOrganization | null> {
    return await this.retryTransaction.serializable(async (context) => {
      return await findBillingOrganization(context, dto);
    });
  }

  async createOrganization(dto: CreateBillingOrganizationDto): Promise<BillingOrganization> {
    return await this.retryTransaction.serializable(async (context) => {
      return await createBillingOrganization(context, dto);
    });
  }

  async updateBillingEmail(dto: UpdateBillingEmailDto): Promise<void> {
    const { organizationId, email } = dto;
    return await this.retryTransaction.serializable(async (context) => {
      const organization = await findBillingOrganization(context, dto);
      if (!organization) {
        throw new NotFoundException({
          message: 'BillingOrganization not found',
          organizationId,
        });
      }

      if (!organization.billingMethodPaddle) {
        throw new InternalServerErrorException({
          message: 'BillingMethodPaddle not found',
          organizationId,
        });
      }

      const { customerId } = organization.billingMethodPaddle;
      await this.paddleCaller.updateCustomer({ customerId, email });
    });
  }

  async updateBillingAddress(dto: UpdateBillingAddressDto): Promise<UpdateBillingAddressResponse> {
    const { organizationId, ...rest } = dto;
    return await this.retryTransaction.serializable(async (context) => {
      const organization = await findBillingOrganization(context, { organizationId });
      if (!organization) {
        throw new NotFoundException({
          message: 'BillingOrganization not found',
          organizationId,
        });
      }

      if (!organization.billingMethodPaddle) {
        throw new InternalServerErrorException({
          message: 'BillingMethodPaddle not found',
          organizationId,
        });
      }

      const { customerId } = organization.billingMethodPaddle;
      const paddleAddresses = await this.paddleCaller.listAddressesAll({ customerId });
      if (paddleAddresses.length === 0) {
        throw new InternalServerErrorException({
          message: 'PaddleAddress not found',
          customerId,
        });
      }

      const firstAddress = paddleAddresses[0];
      const { id: addressId } = firstAddress;
      if (!addressId) {
        throw new InternalServerErrorException({
          message: 'PaddleAddress id not found',
          customerId,
        });
      }

      const paddleAddress = await this.paddleCaller.updateAddress({ customerId, addressId, ...rest });
      return {
        firstLine: paddleAddress.first_line ?? null,
        secondLine: paddleAddress.second_line ?? null,
        city: paddleAddress.city ?? null,
        postalCode: paddleAddress.postal_code ?? null,
        region: paddleAddress.region ?? null,
        countryCode: paddleAddress.country_code ?? null,
      };
    });
  }
}
