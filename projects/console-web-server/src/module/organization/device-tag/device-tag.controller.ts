import { DeviceTagBase, OrganizationPropCamel } from '@dogu-private/console';
import { DeviceTagId, OrganizationId } from '@dogu-private/types';
import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Query } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { ORGANIZATION_ROLE } from '../../auth/auth.types';
import { OrganizationPermission } from '../../auth/decorators';
import { Page } from '../../common/dto/pagination/page';
import { DeviceTagService } from './device-tag.service';
import { CreateDeviceTagDto, FindDeviceTagsByOrganizationIdDto, UpdateDeviceTagDto } from './dto/device-tag.dto';

@Controller('organizations/:organizationId/tags')
export class DeviceTagController {
  constructor(
    @Inject(DeviceTagService)
    private readonly tagService: DeviceTagService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  // Tags CRUD by organizationId and tagId
  @Post()
  @OrganizationPermission(ORGANIZATION_ROLE.ADMIN)
  async createTag(@Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId, @Body() dto: CreateDeviceTagDto): Promise<DeviceTagBase> {
    const rv = await this.tagService.createTag(this.dataSource.manager, organizationId, dto);
    return rv;
  }

  @Get()
  @OrganizationPermission(ORGANIZATION_ROLE.MEMBER)
  async findTagsByOrganizationId(
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId, //
    @Query() dto: FindDeviceTagsByOrganizationIdDto,
  ): Promise<Page<DeviceTagBase>> {
    const rv = await this.tagService.findTagsByOrganizationId(organizationId, dto);
    return rv;
  }

  @Patch(':tagId')
  @OrganizationPermission(ORGANIZATION_ROLE.ADMIN)
  async updateTag(
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId,
    @Param('tagId') tagId: DeviceTagId,
    @Body() dto: UpdateDeviceTagDto,
  ): Promise<DeviceTagBase> {
    const rv = await this.tagService.updateTag(organizationId, tagId, dto);
    return rv;
  }

  @Get(':tagId')
  @OrganizationPermission(ORGANIZATION_ROLE.MEMBER)
  async findTag(@Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId, @Param('tagId') tagId: DeviceTagId): Promise<DeviceTagBase> {
    const rv = await this.tagService.findTag(organizationId, tagId);
    return rv;
  }

  @Delete(':tagId')
  @OrganizationPermission(ORGANIZATION_ROLE.ADMIN)
  async deleteTag(@Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId, @Param('tagId') tagId: DeviceTagId): Promise<DeviceTagBase> {
    const rv = await this.tagService.softRemoveTag(organizationId, tagId);
    return rv;
  }
}
