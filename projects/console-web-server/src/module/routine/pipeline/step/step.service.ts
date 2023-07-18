import { RoutineStepPropCamel, RuntimeInfoResponse, TestLogResponse } from '@dogu-private/console';
import { influxdbRuntimeInfoMeasurements, isCompleted, OrganizationId, ProjectId, RoutineDeviceJobId, RoutineJobId, RoutinePipelineId, RoutineStepId } from '@dogu-private/types';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { RoutineStep } from '../../../../db/entity/step.entity';
import { FindDeviceRuntimeInfosDto } from '../../../influxdb/dto/influx.dto';
import { InfluxDbDeviceService } from '../../../influxdb/influxdb-device.service';
import { InfluxDbLogService } from '../../../influxdb/influxdb-log.service';
import { DoguLogger } from '../../../logger/logger';

@Injectable()
export class StepService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @Inject(InfluxDbLogService)
    private readonly influxDbLogService: InfluxDbLogService,
    @Inject(InfluxDbDeviceService)
    private readonly influxDbDeviceService: InfluxDbDeviceService,
    private readonly logger: DoguLogger,
  ) {}

  async findCompletedStepLogs(
    organizationId: OrganizationId,
    projectId: ProjectId,
    pipelineId: RoutinePipelineId,
    jobId: RoutineJobId,
    deviceJobId: RoutineDeviceJobId,
    stepId: RoutineStepId,
  ): Promise<TestLogResponse> {
    const step = await this.dataSource.getRepository(RoutineStep).findOne({ where: { routineStepId: stepId } });
    if (!step) {
      throw new HttpException(`Step ${stepId} not found`, HttpStatus.NOT_FOUND);
    }
    if (!isCompleted(step.status)) {
      throw new HttpException(`Step ${stepId} is not completed`, HttpStatus.BAD_REQUEST);
    }

    if (step.inProgressAt === null || step.completedAt === null) {
      throw new HttpException(`Step ${stepId} inProgressAt or completedAt is not recorded`, HttpStatus.BAD_REQUEST);
    }

    if (!step.localInProgressAt) {
      throw new HttpException(`Step ${stepId} localInProgressAt is not recorded`, HttpStatus.BAD_REQUEST);
    }

    const interval = step.completedAt.getTime() - step.inProgressAt.getTime();
    let endTime = new Date(step.localInProgressAt.getTime() + interval);
    if (step.localCompletedAt) {
      endTime = new Date(step.localCompletedAt.getTime());
    }

    const logs = await this.influxDbLogService.readDeviceJobLogs(organizationId, step.routineDeviceJobId, step.localInProgressAt.toISOString(), endTime.toISOString());
    return logs;
  }

  async findStepRuntimeInfo(organizationId: OrganizationId, routineDeviceJobId: RoutineDeviceJobId, stepId: RoutineStepId): Promise<RuntimeInfoResponse> {
    const step = await this.dataSource.getRepository(RoutineStep).findOne({
      where: { routineStepId: stepId },
      relations: [RoutineStepPropCamel.routineDeviceJob],
    });
    if (!step) {
      throw new HttpException(`Step with ${stepId} not found`, HttpStatus.NOT_FOUND);
    }

    if (!isCompleted(step.status)) {
      throw new HttpException(`Step ${stepId} is not completed`, HttpStatus.BAD_REQUEST);
    }

    if (step.inProgressAt === null || step.completedAt === null) {
      throw new HttpException(`Step ${stepId} inProgressAt or completedAt is not recorded`, HttpStatus.BAD_REQUEST);
    }

    if (step.localInProgressAt === null) {
      throw new HttpException(`Step ${stepId} localInProgressAt is not recorded`, HttpStatus.BAD_REQUEST);
    }

    const interval = step.completedAt.getTime() - step.inProgressAt.getTime();
    let endTime = new Date(step.localInProgressAt.getTime() + interval);
    if (step.localCompletedAt) {
      endTime = new Date(step.localCompletedAt.getTime());
    }

    const dto: FindDeviceRuntimeInfosDto = {
      startTime: step.localInProgressAt.toISOString(),
      endTime: endTime.toISOString(),
      measurements: influxdbRuntimeInfoMeasurements,
    };

    const rv = await this.influxDbDeviceService.readRuntimeInfos(organizationId, step.routineDeviceJob!.deviceId, dto);
    return rv;
  }
}
