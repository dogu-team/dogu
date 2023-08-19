import { DestSummaryResponse, RoutineStepPropCamel, RoutineStepPropSnake, RuntimeInfoResponse, TestLogResponse } from '@dogu-private/console';
import {
  DestId,
  DEST_STATE,
  DEST_TYPE,
  influxdbRuntimeInfoMeasurements,
  isDestCompleted,
  OrganizationId,
  ProjectId,
  RoutineDeviceJobId,
  RoutineJobId,
  RoutinePipelineId,
  RoutineStepId,
} from '@dogu-private/types';
import { CreateDestRequestBody, CreateDestResponse, DestData, DestInfo } from '@dogu-tech/console-dest';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager, In } from 'typeorm';
import { Dest } from '../../../../db/entity/dest.entity';
import { RoutineDeviceJob } from '../../../../db/entity/device-job.entity';
import { DestEdge } from '../../../../db/entity/relations/dest-edge.entity';
import { RoutineStep } from '../../../../db/entity/step.entity';
import { FindDeviceRuntimeInfosDto } from '../../../influxdb/dto/influx.dto';
import { InfluxDbDeviceService } from '../../../influxdb/influxdb-device.service';
import { InfluxDbLogService } from '../../../influxdb/influxdb-log.service';
import { DoguLogger } from '../../../logger/logger';

@Injectable()
export class DestService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @Inject(InfluxDbDeviceService)
    private readonly influxDbDeviceService: InfluxDbDeviceService,
    @Inject(InfluxDbLogService)
    private readonly influxDbLogService: InfluxDbLogService,

    private readonly logger: DoguLogger,
  ) {}

  async findDestRuntimeInfo(organizationId: OrganizationId, deviceJobId: RoutineDeviceJobId, destId: DestId): Promise<RuntimeInfoResponse> {
    const deviceJob = await this.dataSource.getRepository(RoutineDeviceJob).findOne({
      where: { routineDeviceJobId: deviceJobId },
    });
    const dest = await this.dataSource.getRepository(Dest).findOne({
      where: { destId },
    });
    if (!deviceJob) {
      throw new HttpException(`Device job with ${deviceJobId} not found`, HttpStatus.NOT_FOUND);
    }
    if (!dest) {
      throw new HttpException(`Dest with ${destId} not found`, HttpStatus.NOT_FOUND);
    }
    if (dest.type !== DEST_TYPE.UNIT) {
      throw new HttpException(`Dest with ${destId} is not unit`, HttpStatus.BAD_REQUEST);
    }

    if (!isDestCompleted(dest.state)) {
      throw new HttpException(`Dest with ${destId} is not completed`, HttpStatus.BAD_REQUEST);
    }

    if (dest.inProgressAt === null || dest.completedAt === null) {
      throw new HttpException(`Dest with ${destId} inProgressAt or completedAt is not recorded.`, HttpStatus.BAD_REQUEST);
    }

    if (dest.localInProgressAt === null) {
      throw new HttpException(`Dest with ${destId} is not localCompleted`, HttpStatus.BAD_REQUEST);
    }

    const interval = dest.completedAt.getTime() - dest.inProgressAt.getTime();
    const endTime = new Date(dest.localInProgressAt.getTime() + interval);

    const dto: FindDeviceRuntimeInfosDto = {
      startTime: dest.localInProgressAt.toISOString(),
      endTime: endTime.toISOString(),
      measurements: influxdbRuntimeInfoMeasurements,
    };

    const rv = await this.influxDbDeviceService.readRuntimeInfos(organizationId, deviceJob.deviceId, dto);
    return rv;
  }

  async createDest(dto: CreateDestRequestBody): Promise<CreateDestResponse> {
    const { destInfos, stepId } = dto;
    const exist = await this.dataSource.getRepository(RoutineStep).exist({ where: { routineStepId: stepId } });
    if (!exist) {
      throw new HttpException(`stepId is not exist. stepId: ${stepId}`, HttpStatus.NOT_FOUND);
    }
    const rv = await this.dataSource.transaction(async (entityManager) => {
      const destDatas = await this.createDestDatas(entityManager, destInfos, stepId, null);
      return destDatas;
    });

    const response: CreateDestResponse = {
      dests: rv,
    };

    return response;
  }

  private async makeDestData(dests: Dest[], destEdges: DestEdge[], parentDestId: DestId | null): Promise<Dest[]> {
    let destDatas;
    if (parentDestId === null) {
      // root
      destDatas = dests.filter((dest) => !destEdges.some((destEdge) => destEdge.destId === dest.destId));
    } else {
      // children by parentDestId
      destDatas = dests.filter((dest) => destEdges.some((destEdge) => destEdge.destId === dest.destId && destEdge.parentDestId === parentDestId));
    }

    for (const destData of destDatas) {
      destData.children = await this.makeDestData(dests, destEdges, destData.destId);
    }

    return destDatas;
  }

  async findDestsByStepId(stepId: RoutineStepId): Promise<Dest[]> {
    const dests = await (
      await this.dataSource
        .getRepository(Dest) //
        .find({ where: { routineStepId: stepId } })
    ).sort((a, b) => a.destId - b.destId);

    if (dests.length === 0) {
      return [];
    }
    const destIds = dests.map((dest) => dest.destId).sort();
    const destEdges = await this.dataSource.getRepository(DestEdge).findBy({ destId: In(destIds) });

    const destDatas = await this.makeDestData(dests, destEdges, null);
    return destDatas;
  }

  private async createDestEdge(manager: EntityManager, parentDestId: DestId, destId: DestId): Promise<void> {
    const newData = manager.getRepository(DestEdge).create({ parentDestId, destId });
    await manager.getRepository(DestEdge).save(newData);
  }

  private async createDestDatas(manager: EntityManager, destInfos: DestInfo[], stepId: RoutineStepId, parentDestId: DestId | null): Promise<DestData[]> {
    const destDatas: DestData[] = [];
    let index = 0;
    for (const destInfo of destInfos) {
      const newData = manager.getRepository(Dest).create({ index, routineStepId: stepId, ...destInfo });
      const dest = await manager.getRepository(Dest).save(newData);
      if (parentDestId) {
        await this.createDestEdge(manager, parentDestId, dest.destId);
      }

      const children = await this.createDestDatas(manager, destInfo.children, stepId, dest.destId);

      const destData: DestData = {
        destId: dest.destId,
        routineStepId: dest.routineStepId,
        name: dest.name,
        index: dest.index,
        state: dest.state,
        type: dest.type,
        children,
      };
      destDatas.push(destData);
      ++index;
    }
    return destDatas;
  }

  async findCompletedDestLogs(
    organizationId: OrganizationId,
    projectId: ProjectId,
    pipelineId: RoutinePipelineId,
    jobId: RoutineJobId,
    deviceJobId: RoutineDeviceJobId,
    destId: DestId,
  ): Promise<TestLogResponse> {
    const dest = await this.dataSource.getRepository(Dest).findOne({ where: { destId } });
    if (!dest) {
      throw new HttpException(`Dest with ${destId} not found`, HttpStatus.NOT_FOUND);
    }

    if (!isDestCompleted(dest.state)) {
      throw new HttpException(`Dest with ${destId} is not completed`, HttpStatus.BAD_REQUEST);
    }

    if (dest.inProgressAt === null || dest.completedAt === null) {
      throw new HttpException(`Dest with ${destId} inProgressAt or completedAt is not recorded.`, HttpStatus.BAD_REQUEST);
    }

    if (dest.localInProgressAt === null) {
      throw new HttpException(`Dest with ${destId} is not localCompleted`, HttpStatus.BAD_REQUEST);
    }

    const interval = dest.completedAt.getTime() - dest.inProgressAt.getTime();
    let endTime = new Date(dest.localInProgressAt.getTime() + interval);
    if (dest.localCompletedAt) {
      endTime = new Date(dest.localCompletedAt.getTime());
    }

    const deviceJobLogs = await this.influxDbLogService.readDeviceJobLogs(organizationId, deviceJobId, {
      type: 'timeRange',
      startTime: dest.localInProgressAt,
      endTime,
    });
    return deviceJobLogs;
  }

  async getDestSummary(
    organizationId: OrganizationId,
    projectId: ProjectId,
    pipelineId: RoutinePipelineId,
    jobId: RoutineJobId,
    deviceJobId: RoutineDeviceJobId,
    stepId: RoutineStepId,
  ): Promise<DestSummaryResponse> {
    const step = await this.dataSource
      .getRepository(RoutineStep) //
      .createQueryBuilder('step')
      .leftJoinAndSelect(`step.${RoutineStepPropCamel.dests}`, 'dest')
      .where(`step.${RoutineStepPropSnake.routine_step_id} = :stepId`, { stepId })
      .getOne();
    if (!step) {
      throw new HttpException(`Step with ${stepId} not found`, HttpStatus.NOT_FOUND);
    }

    const dests = step.dests ? step.dests : [];
    if (dests.length === 0) {
      throw new HttpException(`Dest with ${stepId} not found`, HttpStatus.NOT_FOUND);
    }

    const totalJobCount = dests.filter((dest) => dest.type === DEST_TYPE.JOB).length;
    const totalUnitCount = dests.filter((dest) => dest.type === DEST_TYPE.UNIT).length;
    const passedJobCount = dests.filter((dest) => dest.type === DEST_TYPE.JOB && dest.state === DEST_STATE.PASSED).length;
    const passedUnitCount = dests.filter((dest) => dest.type === DEST_TYPE.UNIT && dest.state === DEST_STATE.PASSED).length;
    const failedJobCount = dests.filter((dest) => dest.type === DEST_TYPE.JOB && dest.state === DEST_STATE.FAILED).length;
    const failedUnitCount = dests.filter((dest) => dest.type === DEST_TYPE.UNIT && dest.state === DEST_STATE.FAILED).length;
    const skippedJobCount = dests.filter((dest) => dest.type === DEST_TYPE.JOB && dest.state === DEST_STATE.SKIPPED).length;
    const skippedUnitCount = dests.filter((dest) => dest.type === DEST_TYPE.UNIT && dest.state === DEST_STATE.SKIPPED).length;
    const pendingJobCount = dests.filter((dest) => dest.type === DEST_TYPE.JOB && dest.state === DEST_STATE.PENDING).length;
    const pendingUnitCount = dests.filter((dest) => dest.type === DEST_TYPE.UNIT && dest.state === DEST_STATE.PENDING).length;
    const unspecifiedJobCount = dests.filter((dest) => dest.type === DEST_TYPE.JOB && dest.state === DEST_STATE.UNSPECIFIED).length;
    const unspecifiedUnitCount = dests.filter((dest) => dest.type === DEST_TYPE.UNIT && dest.state === DEST_STATE.UNSPECIFIED).length;

    const destSummary: DestSummaryResponse = {
      totalJobCount,
      totalUnitCount,
      passedJobCount,
      passedUnitCount,
      failedJobCount,
      failedUnitCount,
      skippedJobCount,
      skippedUnitCount,
      pendingJobCount,
      pendingUnitCount,
      unspecifiedJobCount,
      unspecifiedUnitCount,
    };

    return destSummary;
  }
}
