import { CreateBillingOrganizationDto, CreateOrUpdateBillingOrganizationWithNiceDto, FindBillingOrganizationDto } from '@dogu-private/console';
import { Body, Controller, Get, NotFoundException, Post, Put, Query } from '@nestjs/common';
import { BillingOrganization } from '../../db/entity/billing-organization.entity';
import { BillingTokenPermission } from '../auth/guard/billing-token.guard';
import { BillingOrganizationService } from './billing-organization.service';

@Controller('/billing/organizations')
export class BillingOrganizationController {
  constructor(private readonly billingOrganizationService: BillingOrganizationService) {}

  @Get()
  @BillingTokenPermission()
  async find(@Query() dto: FindBillingOrganizationDto): Promise<BillingOrganization> {
    const { organizationId } = dto;
    const billingOrganization = await this.billingOrganizationService.find(dto);
    if (!billingOrganization) {
      throw new NotFoundException(`BillingOrganization not found by organizationId ${organizationId}`);
    }

    return billingOrganization;
  }

  @Post()
  @BillingTokenPermission()
  async create(@Body() dto: CreateBillingOrganizationDto): Promise<BillingOrganization> {
    return await this.billingOrganizationService.create(dto);
  }

  @Put()
  @BillingTokenPermission()
  async createOrUpdate(@Body() dto: CreateOrUpdateBillingOrganizationWithNiceDto): Promise<BillingOrganization> {
    return await this.billingOrganizationService.createOrUpdateWithNice(dto);
  }
}
