import { DeviceBase, DevicePropCamel, DeviceResponse, DeviceTagBase, OrganizationPropCamel, ProjectBase, RuntimeInfoResponse } from '@dogu-private/console';
import { DeviceId, DeviceTagId, LocalDeviceDetectToken, OrganizationId, ProjectId, ProtoRTCPeerDescription, UserPayload } from '@dogu-private/types';
import { Body, Controller, Delete, ForbiddenException, Get, Head, Inject, Param, Patch, Post, Query } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ORGANIZATION_ROLE } from '../../auth/auth.types';
import { OrganizationPermission, User } from '../../auth/decorators';
import { Page } from '../../common/dto/pagination/page';
import { FindDeviceRuntimeInfosDto } from '../../influxdb/dto/influx.dto';
import { InfluxDbDeviceService } from '../../influxdb/influxdb-device.service';
import { DeviceTagService } from '../device-tag/device-tag.service';
import { DeviceCommandService } from './device-command.service';
import { DeviceStatusService } from './device-status.service';
import { IsDeviceConnected } from './device.decorators';
import {
  AttachTagToDeviceDto,
  DeviceStreamingOfferDto,
  EnableDeviceDto,
  FindAddableDevicesByOrganizationIdDto,
  FindDevicesByOrganizationIdDto,
  UpdateDeviceDto,
  UpdateDeviceMaxParallelJobsDto,
} from './dto/device.dto';

@Controller('organizations/:organizationId/devices')
export class DeviceController {
  constructor(
    @Inject(DeviceStatusService)
    private readonly deviceStatusService: DeviceStatusService,
    @Inject(InfluxDbDeviceService)
    private readonly influxDbDeviceService: InfluxDbDeviceService,
    @Inject(DeviceCommandService)
    private readonly deviceCommandService: DeviceCommandService,
    @Inject(DeviceTagService)
    private readonly tagService: DeviceTagService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  @Get('')
  @OrganizationPermission(ORGANIZATION_ROLE.MEMBER)
  async findDevicesByOrganizationId(
    @User() user: UserPayload, //
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId,
    @Query() dto: FindDevicesByOrganizationIdDto,
  ): Promise<Page<DeviceResponse>> {
    const rv = await this.deviceStatusService.findDevicesByOrganizationId(user, organizationId, dto);
    return rv;
  }

  @Get('addable')
  @OrganizationPermission(ORGANIZATION_ROLE.MEMBER)
  async findAddableDevicesByOrganizationId(
    @User() user: UserPayload, //
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId,
    @Query() dto: FindAddableDevicesByOrganizationIdDto,
  ): Promise<Page<DeviceBase>> {
    const rv = await this.deviceStatusService.findAddableDevicesByOrganizationId(user, organizationId, dto);
    return rv;
  }

  @Post(':deviceId/disable')
  @OrganizationPermission(ORGANIZATION_ROLE.ADMIN)
  async disableDevice(@Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId, @Param('deviceId') deviceId: DeviceId): Promise<void> {
    return await this.deviceStatusService.disableDevice(organizationId, deviceId);
  }

  @Post(':deviceId/enable')
  @OrganizationPermission(ORGANIZATION_ROLE.ADMIN)
  async enableDevice(
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId, //
    @Param(DevicePropCamel.deviceId) deviceId: DeviceId,
    @Body() dto: EnableDeviceDto,
  ): Promise<void> {
    return await this.deviceStatusService.enableAndUpateDevice(organizationId, deviceId, dto);
  }

  @Get(':deviceId/projects')
  @OrganizationPermission(ORGANIZATION_ROLE.MEMBER)
  async findAllocatedProjects(@User() userPayload: UserPayload, @Param(DevicePropCamel.deviceId) deviceId: DeviceId): Promise<ProjectBase[]> {
    return await this.deviceStatusService.findAllocatedProjects(deviceId);
  }

  @Delete(':deviceId/projects/:projectId')
  @OrganizationPermission(ORGANIZATION_ROLE.ADMIN)
  async softRemoveDeviceFromProjects(
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId, //
    @Param(DevicePropCamel.deviceId) deviceId: DeviceId,
    @Param('projectId') projectId: ProjectId,
  ): Promise<void> {
    return await this.deviceStatusService.softRemoveDeviceFromProject(organizationId, deviceId, projectId);
  }

  @Head(':deviceId')
  @OrganizationPermission(ORGANIZATION_ROLE.MEMBER)
  async checkDeviceStreamingAvailable(@Param(DevicePropCamel.deviceId) deviceId: DeviceId): Promise<void> {
    return await this.deviceStatusService.checkDeviceStreamingAvailable(deviceId);
  }

  @Patch(':deviceId')
  @OrganizationPermission(ORGANIZATION_ROLE.ADMIN)
  async updateDevice(
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId, //
    @Param(DevicePropCamel.deviceId) deviceId: DeviceId,
    @Body() updateDeviceDto: UpdateDeviceDto,
  ): Promise<DeviceResponse> {
    const device = await this.dataSource.transaction(async (manager) => {
      return await this.deviceStatusService.updateDevice(manager, organizationId, deviceId, updateDeviceDto);
    });
    return device;
  }

  @Patch(':deviceId/max-parallel-job')
  @OrganizationPermission(ORGANIZATION_ROLE.ADMIN)
  async updateMaxParallelJob(
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId, //
    @Param(DevicePropCamel.deviceId) deviceId: DeviceId,
    @Body() dto: UpdateDeviceMaxParallelJobsDto,
  ): Promise<DeviceResponse> {
    const device = await this.dataSource.transaction(async (manager) => {
      return await this.deviceStatusService.updateDeviceMaxParallelJobs(manager, organizationId, deviceId, dto);
    });
    return device;
  }

  @Delete(':deviceId')
  @OrganizationPermission(ORGANIZATION_ROLE.ADMIN)
  async softRemoveDevice(@Param(DevicePropCamel.deviceId) deviceId: DeviceId): Promise<void> {
    await this.deviceStatusService.softRemoveDevice(deviceId);
    return;
  }

  @Get(':deviceId')
  @OrganizationPermission(ORGANIZATION_ROLE.MEMBER)
  async findDevice(@Param(DevicePropCamel.deviceId) deviceId: DeviceId): Promise<DeviceResponse> {
    const device: DeviceResponse | undefined = await this.deviceStatusService.findDevice(deviceId);
    return device;
  }

  @Get(':deviceId/tags')
  @OrganizationPermission(ORGANIZATION_ROLE.MEMBER)
  async findTagsByDeviceId(@Param(DevicePropCamel.deviceId) deviceId: DeviceId): Promise<DeviceTagBase[]> {
    const rv = await this.tagService.findTagsByDeviceId(deviceId);
    return rv;
  }

  @Post(':deviceId/tags')
  @OrganizationPermission(ORGANIZATION_ROLE.ADMIN)
  async addTag(
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId,
    @Param(DevicePropCamel.deviceId) deviceId: DeviceId,
    @Body() dto: AttachTagToDeviceDto,
  ): Promise<void> {
    await this.deviceStatusService.addTagToDevice(this.dataSource.manager, deviceId, dto);
  }

  @Delete(':deviceId/tags/:tagId')
  @OrganizationPermission(ORGANIZATION_ROLE.ADMIN)
  async deleteTag(
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId,
    @Param(DevicePropCamel.deviceId) deviceId: DeviceId,
    @Param('tagId') tagId: DeviceTagId,
  ): Promise<void> {
    await this.deviceStatusService.softRemoveTagFromDevice(organizationId, deviceId, tagId);
  }

  @Post(':deviceId/streaming')
  @OrganizationPermission(ORGANIZATION_ROLE.OWNER)
  async startDeviceStreaming(
    @User() user: UserPayload,
    @Param(DevicePropCamel.deviceId, IsDeviceConnected) deviceId: DeviceId,
    @Body() streamingDto: DeviceStreamingOfferDto,
  ): Promise<ProtoRTCPeerDescription> {
    throw new ForbiddenException('Cannot use this API.');
    // const peerDescription = await this.deviceCommandService.startDeviceStreaming(streamingDto);
    // return peerDescription;
  }

  @Post(':deviceId/reboot')
  @OrganizationPermission(ORGANIZATION_ROLE.ADMIN)
  async reboot(@Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId, @Param(DevicePropCamel.deviceId, IsDeviceConnected) deviceId: DeviceId): Promise<void> {
    const serial = await this.deviceStatusService.findSerialByDeviceId(deviceId);
    this.deviceCommandService.reboot(organizationId, deviceId, serial);
  }

  @Get(':deviceId/localDeviceDetectTokens')
  @OrganizationPermission(ORGANIZATION_ROLE.MEMBER)
  async findLocalDeviceDetectTokens(
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId,
    @Param(DevicePropCamel.deviceId, IsDeviceConnected) deviceId: DeviceId,
  ): Promise<LocalDeviceDetectToken[]> {
    // const { organizationId } = user;
    const serial = await this.deviceStatusService.findSerialByDeviceId(deviceId);
    return await this.deviceCommandService.findLocalDeviceDetectTokens(organizationId, deviceId, serial);
  }
  // DB END

  // IDB START
  @Get(':deviceId/device-runtime-infos')
  @OrganizationPermission(ORGANIZATION_ROLE.MEMBER)
  async getDeviceRunTimeInfosFromTSDB(
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId,
    @Param(DevicePropCamel.deviceId) deviceId: DeviceId,
    @Query() dto: FindDeviceRuntimeInfosDto,
  ): Promise<RuntimeInfoResponse> {
    const rv = await this.influxDbDeviceService.readRuntimeInfos(organizationId, deviceId, dto);
    return rv;
  }
  // IDB END
}
