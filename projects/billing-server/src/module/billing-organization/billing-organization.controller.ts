import { FindBillingOrganizationDto } from '@dogu-private/console';
import { Controller, Get, NotFoundException, Query } from '@nestjs/common';
import { BillingOrganization } from '../../db/entity/billing-organization.entity';
import { BillingTokenPermission } from '../auth/guard/billing-token.guard';
import { BillingOrganizationService } from './billing-organization.service';

@Controller('/billing/organizations')
export class BillingOrganizationController {
  constructor(private readonly billingOrganizationService: BillingOrganizationService) {}

  @Get()
  @BillingTokenPermission()
  async findOrganizationWithMethod(@Query() dto: FindBillingOrganizationDto): Promise<BillingOrganization> {
    const { organizationId } = dto;
    const billingOrganization = await this.billingOrganizationService.findOrganizationWithMethod(dto);
    if (!billingOrganization) {
      throw new NotFoundException(`BillingOrganization not found by organizationId ${organizationId}`);
    }

    return billingOrganization;
  }

  @Get('/with-subscription-plans')
  @BillingTokenPermission()
  async findOrganizationWithSubscriptionPlans(@Query() dto: FindBillingOrganizationDto): Promise<BillingOrganization> {
    const { organizationId } = dto;
    const billingOrganization = await this.billingOrganizationService.findOrganizationWithSubscriptionPlans(dto);
    if (!billingOrganization) {
      throw new NotFoundException(`BillingOrganization not found by organizationId ${organizationId}`);
    }

    return billingOrganization;
  }

  @Get('/with-method-and-subscription-plans')
  @BillingTokenPermission()
  async findOrganizationWithMethodAndSubscriptionPlans(@Query() dto: FindBillingOrganizationDto): Promise<BillingOrganization> {
    const { organizationId } = dto;
    const billingOrganization = await this.billingOrganizationService.findOrganizationWithMethodAndSubscriptionPlans(dto);
    if (!billingOrganization) {
      throw new NotFoundException(`BillingOrganization not found by organizationId ${organizationId}`);
    }

    return billingOrganization;
  }
}
