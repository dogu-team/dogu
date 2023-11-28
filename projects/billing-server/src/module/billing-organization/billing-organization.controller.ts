import { FindBillingOrganizationDto, UpdateBillingAddressDto, UpdateBillingAddressResponse, UpdateBillingEmailDto } from '@dogu-private/console';
import { Body, Controller, Get, NotFoundException, Patch, Put, Query } from '@nestjs/common';
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

  @Get('/with-plans')
  @BillingTokenPermission()
  async findOrganizationWithPlans(@Query() dto: FindBillingOrganizationDto): Promise<BillingOrganization> {
    const { organizationId } = dto;
    const billingOrganization = await this.billingOrganizationService.findOrganizationWithPlans(dto);
    if (!billingOrganization) {
      throw new NotFoundException(`BillingOrganization not found by organizationId ${organizationId}`);
    }

    return billingOrganization;
  }

  @Get('/with-method-and-plans')
  @BillingTokenPermission()
  async findOrganizationWithMethodAndPlans(@Query() dto: FindBillingOrganizationDto): Promise<BillingOrganization> {
    const { organizationId } = dto;
    const billingOrganization = await this.billingOrganizationService.findOrganizationWithMethodAndPlans(dto);
    if (!billingOrganization) {
      throw new NotFoundException(`BillingOrganization not found by organizationId ${organizationId}`);
    }

    return billingOrganization;
  }

  @Put('/email')
  @BillingTokenPermission()
  async updateBillingEmail(@Body() dto: UpdateBillingEmailDto): Promise<void> {
    await this.billingOrganizationService.updateBillingEmail(dto);
  }

  @Patch('/address')
  @BillingTokenPermission()
  async updateBillingAddress(@Body() dto: UpdateBillingAddressDto): Promise<UpdateBillingAddressResponse> {
    return await this.billingOrganizationService.updateBillingAddress(dto);
  }
}
