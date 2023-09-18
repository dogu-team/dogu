import { DevicePropCamel, OrganizationPropCamel } from '@dogu-private/console';
import {
  PrivateDeviceJob,
  UpdateDeviceJobLocalStartedAtRequestBody,
  UpdateDeviceJobStatusRequestBody,
  UpdateDeviceJobWindowRequestBody,
  WriteDeviceJobLogsRequestBody,
} from '@dogu-private/console-host-agent';
import { DeviceId, OrganizationId, RoutineDeviceJobId } from '@dogu-private/types';
import { Body, Controller, HttpException, HttpStatus, Inject, Param, Patch, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { RoutineDeviceJob } from '../../db/entity/device-job.entity';
import { recordFileParser } from '../../utils/file';
import { HOST_ACTION_TYPE } from '../auth/auth.types';
import { HostPermission } from '../auth/decorators';
import { UpdateDeviceJobStatusEvent, UpdateDeviceJobStatusQueue } from '../event/pipeline/update-pipeline-queue';
import { InfluxDbLogService } from '../influxdb/influxdb-log.service';
import { DoguLogger } from '../logger/logger';
import { IsOrganizationExist } from '../organization/organization.decorators';
import { IsDeviceJobExist } from '../routine/pipeline/decorator/device-job.decorators';
import { DeviceJobService } from '../routine/pipeline/device-job/device-job.service';
import { DeviceJobRunner } from '../routine/pipeline/processor/runner/device-job-runner';

@Controller(PrivateDeviceJob.controller.path)
export class PrivateDeviceJobController {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @Inject(DeviceJobService)
    private readonly deviceJobService: DeviceJobService,
    private readonly logger: DoguLogger,
    @Inject(DeviceJobRunner)
    private readonly deviceJobRunner: DeviceJobRunner,
    @Inject(UpdateDeviceJobStatusQueue)
    private readonly updateDeviceJobStatusQueue: UpdateDeviceJobStatusQueue,
    @Inject(InfluxDbLogService)
    private readonly influxDbLogService: InfluxDbLogService,
  ) {}

  @Post(PrivateDeviceJob.uploadDeviceJobRecord.path)
  @UseInterceptors(FileInterceptor('record'))
  @HostPermission(HOST_ACTION_TYPE.DEVICE_API)
  async uploadDeviceJobRecord(
    @UploadedFile(recordFileParser) record: Express.Multer.File,
    @Param(OrganizationPropCamel.organizationId, IsOrganizationExist) organizationId: OrganizationId,
    @Param('deviceJobId', IsDeviceJobExist) deviceJobId: RoutineDeviceJobId,
  ): Promise<void> {
    await this.deviceJobService.uploadDeviceJobRecord(organizationId, deviceJobId, record);
  }

  @Patch(PrivateDeviceJob.updateDeviceJobStatus.path)
  @HostPermission(HOST_ACTION_TYPE.DEVICE_API)
  async updateDeviceJobStatus(
    @Param(OrganizationPropCamel.organizationId, IsOrganizationExist) organizationId: OrganizationId,
    @Param('deviceJobId', IsDeviceJobExist) deviceJobId: RoutineDeviceJobId,
    @Body() body: UpdateDeviceJobStatusRequestBody,
  ): Promise<void> {
    const updateEvent: UpdateDeviceJobStatusEvent = new UpdateDeviceJobStatusEvent(organizationId, deviceJobId, body);
    this.updateDeviceJobStatusQueue.enqueue(updateEvent);
  }

  @Patch(PrivateDeviceJob.updateDeviceJobLocalStartedAt.path)
  @HostPermission(HOST_ACTION_TYPE.DEVICE_API)
  async updateDeviceJobLocalStartedAt(
    @Param(OrganizationPropCamel.organizationId, IsOrganizationExist) organizationId: OrganizationId,
    @Param('deviceJobId', IsDeviceJobExist) deviceJobId: RoutineDeviceJobId,
    @Body() body: UpdateDeviceJobLocalStartedAtRequestBody,
  ): Promise<void> {
    const exist = await this.dataSource.getRepository(RoutineDeviceJob).exist({ where: { routineDeviceJobId: deviceJobId } });
    if (!exist) {
      throw new HttpException(`Device job not found. organizationId: ${organizationId}, deviceJobId: ${deviceJobId}`, HttpStatus.NOT_FOUND);
    }
    await this.dataSource.getRepository(RoutineDeviceJob).update({ routineDeviceJobId: deviceJobId }, { localInProgressAt: body.localStartedAt });
  }

  @Patch(PrivateDeviceJob.updateDeviceJobHeartbeatNow.path)
  @HostPermission(HOST_ACTION_TYPE.DEVICE_API)
  async updateDeviceJobHeartbeatNow(
    @Param(OrganizationPropCamel.organizationId, IsOrganizationExist) organizationId: OrganizationId,
    @Param('deviceJobId', IsDeviceJobExist) deviceJobId: RoutineDeviceJobId,
  ): Promise<void> {
    this.logger.debug('DeviceJob heartbeat updated', { organizationId, deviceJobId, timestamp: new Date() });
    const exist = await this.dataSource.getRepository(RoutineDeviceJob).exist({ where: { routineDeviceJobId: deviceJobId } });
    if (!exist) {
      throw new HttpException(`Device job not found. organizationId: ${organizationId}, deviceJobId: ${deviceJobId}`, HttpStatus.NOT_FOUND);
    }
    await this.dataSource.getRepository(RoutineDeviceJob).update({ routineDeviceJobId: deviceJobId }, { heartbeat: () => 'NOW()' });
  }

  @Post(PrivateDeviceJob.writeDeviceJobLogs.path)
  @HostPermission(HOST_ACTION_TYPE.DEVICE_API)
  async writeDeviceJobLogs(
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId,
    @Param(DevicePropCamel.deviceId) deviceId: DeviceId,
    @Param('deviceJobId') deviceJobId: RoutineDeviceJobId,
    @Body() body: WriteDeviceJobLogsRequestBody,
  ): Promise<void> {
    await this.influxDbLogService.writeDeviceJobLogs(organizationId, deviceId, deviceJobId, body);
  }

  @Patch(PrivateDeviceJob.updateDeviceJobWindow.path)
  @HostPermission(HOST_ACTION_TYPE.DEVICE_API)
  async updateDeviceJobWindow(
    @Param(OrganizationPropCamel.organizationId, IsOrganizationExist) organizationId: OrganizationId,
    @Param('deviceJobId', IsDeviceJobExist) deviceJobId: RoutineDeviceJobId,
    @Body() body: UpdateDeviceJobWindowRequestBody,
  ): Promise<void> {
    this.logger.debug('DeviceJob window updated', { organizationId, deviceJobId, timestamp: new Date() });
    const exist = await this.dataSource.getRepository(RoutineDeviceJob).exist({ where: { routineDeviceJobId: deviceJobId } });
    if (!exist) {
      throw new HttpException(`Device job not found. organizationId: ${organizationId}, deviceJobId: ${deviceJobId}`, HttpStatus.NOT_FOUND);
    }
    await this.dataSource.getRepository(RoutineDeviceJob).update({ routineDeviceJobId: deviceJobId }, { windowProcessId: body.windowProcessId });
  }
}
