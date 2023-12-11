import { Injectable } from '@nestjs/common';
import { FeatureConfig } from '../../feature.config';
import { DoguLogger } from '../logger/logger';
import { CreateCustomerOptions, GetCustomerOptions as GetCustomerOptionsOrigin, PaddleCaller, UpdateCustomerOptions as UpdateCustomerOptionsOrigin } from '../paddle/paddle.caller';
import { Paddle } from '../paddle/paddle.types';

const EmailPattern = /^(?<prefix>[a-f\d]{8}(-[a-f\d]{4}){4}[a-f\d]{8}\+)*.+@.+$/;

export type UpdateCustomerOptions = UpdateCustomerOptionsOrigin & {
  organizationId: string;
};

export type GetCustomerOptions = GetCustomerOptionsOrigin & {
  organizationId: string;
};

type ResolveEmailOptions = {
  organizationId: string;
  email: string;
};

@Injectable()
export class BillingMethodPaddleCustomerService {
  constructor(
    private readonly logger: DoguLogger,
    private readonly paddleCaller: PaddleCaller,
  ) {}

  async createCustomer(options: CreateCustomerOptions): Promise<Paddle.Customer> {
    const { organizationId } = options;
    const email = this.resolveEmail({
      organizationId,
      email: options.email,
    });
    this.logger.warn('BillingMethodPaddleCustomerService.createCustomer resolved email', {
      organizationId,
      originalEmail: options.email,
      email,
    });
    return await this.paddleCaller.createCustomer({
      ...options,
      email,
    });
  }

  async updateCustomer(options: UpdateCustomerOptions): Promise<Paddle.Customer> {
    const { organizationId } = options;
    const email = this.resolveEmail({
      organizationId,
      email: options.email,
    });
    this.logger.warn('BillingMethodPaddleCustomerService.updateCustomer resolved email', {
      organizationId,
      originalEmail: options.email,
      email,
    });
    return await this.paddleCaller.updateCustomer({
      ...options,
      email,
    });
  }

  async getCustomer(options: GetCustomerOptions): Promise<Paddle.Customer> {
    const { organizationId } = options;
    const customer = await this.paddleCaller.getCustomer(options);
    if (!customer.email) {
      return customer;
    }

    const email = this.resolveEmail({
      organizationId,
      email: customer.email,
    });
    this.logger.warn('BillingMethodPaddleCustomerService.getCustomer resolved email', {
      organizationId,
      originalEmail: customer.email,
      email,
    });
    return {
      ...customer,
      email,
    };
  }

  resolveEmail(options: ResolveEmailOptions): string {
    const { organizationId, email } = options;
    if (FeatureConfig.get('sandbox')) {
      const parsed = email.match(EmailPattern);
      if (!parsed) {
        throw new Error(`Invalid email. email: ${email}`);
      }

      if (parsed.groups?.prefix) {
        return email;
      }

      const prefix = `${organizationId}+`;
      return `${prefix}${email}`;
    } else {
      return email;
    }
  }
}
