import { CreateBillingInfoDto, CreateOrUpdateBillingInfoWithNiceDto, FindBillingInfoDto } from '@dogu-private/console';
import { Body, Controller, Get, NotFoundException, Post, Put, Query } from '@nestjs/common';
import { BillingInfo } from '../../db/entity/billing-info.entity';
import { BillingTokenPermission } from '../auth/guard/billing-token.guard';
import { BillingInfoService } from './billing-info.service';

@Controller('/billing-infos')
export class BillingInfoController {
  constructor(private readonly billingInfoService: BillingInfoService) {}

  @Get()
  @BillingTokenPermission()
  async findByOrganizationId(@Query() dto: FindBillingInfoDto): Promise<BillingInfo> {
    const { organizationId } = dto;
    const billingInfo = await this.billingInfoService.findByOrganizationId(dto);
    if (!billingInfo) {
      throw new NotFoundException(`BillingInfo not found by organizationId ${organizationId}`);
    }

    return billingInfo;
  }

  @Post()
  @BillingTokenPermission()
  async create(@Body() dto: CreateBillingInfoDto): Promise<BillingInfo> {
    return await this.billingInfoService.create(dto);
  }

  @Put()
  @BillingTokenPermission()
  async createOrUpdate(@Body() dto: CreateOrUpdateBillingInfoWithNiceDto): Promise<BillingInfo> {
    return await this.billingInfoService.createOrUpdateWithNice(dto);
  }
}
