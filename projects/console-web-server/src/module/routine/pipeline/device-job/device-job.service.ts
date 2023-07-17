import {
  DestPropCamel,
  RoutineDeviceJobBase,
  RoutineDeviceJobPropCamel,
  RoutineDeviceJobPropSnake,
  RoutineJobPropCamel,
  RoutinePipelinePropCamel,
  RoutineStepPropCamel,
  RuntimeInfoResponse,
  TestLogResponse,
} from '@dogu-private/console';
import { influxdbRuntimeInfoMeasurements, isCompleted, OrganizationId, ProjectId, RoutineDeviceJobId, RoutineJobId, RoutinePipelineId } from '@dogu-private/types';
import { HttpException, HttpStatus, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { Response } from 'express';
import { DataSource } from 'typeorm';
import { RoutineDeviceJob } from '../../../../db/entity/device-job.entity';
import { RoutineJob } from '../../../../db/entity/job.entity';
import { RoutinePipeline } from '../../../../db/entity/pipeline.entity';
import { ProjectFileService } from '../../../file/project-file.service';
import { FindDeviceRuntimeInfosDto } from '../../../influxdb/dto/influx.dto';
import { InfluxDbDeviceService } from '../../../influxdb/influxdb-device.service';
import { InfluxDbLogService } from '../../../influxdb/influxdb-log.service';
import { DoguLogger } from '../../../logger/logger';

@Injectable()
export class DeviceJobService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly projectFileService: ProjectFileService,
    @Inject(InfluxDbDeviceService)
    private readonly influxDbDeviceService: InfluxDbDeviceService,
    @Inject(InfluxDbLogService)
    private readonly influxDbLogService: InfluxDbLogService,
    private readonly logger: DoguLogger,
  ) {}

  async uploadDeviceJobRecord(organizationId: OrganizationId, routineDeviceJobId: RoutineDeviceJobId, record: Express.Multer.File): Promise<void> {
    const deviceJob = await this.dataSource
      .getRepository(RoutineDeviceJob)
      .createQueryBuilder(`deviceJob`)
      .innerJoinAndSelect(`deviceJob.${RoutineDeviceJobPropCamel.routineJob}`, `job`)
      .innerJoinAndSelect(`job.${RoutineJobPropCamel.routinePipeline}`, `pipeline`)
      .innerJoinAndSelect(`pipeline.${RoutinePipelinePropCamel.routine}`, `routine`)
      .where(`deviceJob.${RoutineDeviceJobPropSnake.routine_device_job_id} = :${RoutineDeviceJobPropCamel.routineDeviceJobId}`, { routineDeviceJobId })
      .getOne();

    if (!deviceJob) {
      throw new HttpException(`DeviceJob not found. organizationId: ${organizationId}, deviceJobId: ${routineDeviceJobId}`, HttpStatus.NOT_FOUND);
    }
    const job = deviceJob.routineJob;
    if (!job) {
      throw new HttpException(`Job not found. organizationId: ${organizationId}, deviceJobId: ${routineDeviceJobId}`, HttpStatus.NOT_FOUND);
    }
    const pipeline = job.routinePipeline;
    if (!pipeline) {
      throw new HttpException(`Pipeline not found. organizationId: ${organizationId}, deviceJobId: ${routineDeviceJobId}`, HttpStatus.NOT_FOUND);
    }
    if (!pipeline.routineId) {
      throw new HttpException(`Pipeline routineId not found. organizationId: ${organizationId}, deviceJobId: ${routineDeviceJobId}`, HttpStatus.NOT_FOUND);
    }

    const routine = pipeline.routine;
    if (!routine) {
      throw new HttpException(`Routine not found. organizationId: ${organizationId}, deviceJobId: ${routineDeviceJobId}`, HttpStatus.NOT_FOUND);
    }

    const recordUrl = await this.projectFileService.uploadDeviceJobRecord(
      record,
      organizationId,
      pipeline.projectId,
      pipeline.routineId,
      pipeline.routinePipelineId,
      routineDeviceJobId,
    );
    this.logger.info(`Upload record success. organizationId: ${organizationId}, deviceJobId: ${routineDeviceJobId}, recordUrl: ${recordUrl}`);
  }

  async findDeviceJobRuntimeInfo(organizationId: OrganizationId, deviceJobId: RoutineDeviceJobId): Promise<RuntimeInfoResponse> {
    const deviceJob = await this.dataSource.getRepository(RoutineDeviceJob).findOne({
      where: { routineDeviceJobId: deviceJobId },
    });
    if (!deviceJob) {
      throw new HttpException(`Device job with ${deviceJobId} not found`, HttpStatus.NOT_FOUND);
    }

    if (!isCompleted(deviceJob.status)) {
      throw new HttpException(`Device job with ${deviceJobId} is not completed`, HttpStatus.BAD_REQUEST);
    }

    if (deviceJob.inProgressAt === null || deviceJob.completedAt === null) {
      throw new HttpException(`Device job with ${deviceJobId} is not completed`, HttpStatus.BAD_REQUEST);
    }
    if (deviceJob.localInProgressAt === null) {
      throw new HttpException(`Device job with ${deviceJobId} localInProgressAt is null.`, HttpStatus.BAD_REQUEST);
    }

    const interval = deviceJob.completedAt.getTime() - deviceJob.inProgressAt.getTime();
    let endTime = new Date(deviceJob.localInProgressAt.getTime() + interval);
    if (deviceJob.localCompletedAt) {
      endTime = new Date(deviceJob.localCompletedAt.getTime());
    }

    const dto: FindDeviceRuntimeInfosDto = {
      startTime: deviceJob.localInProgressAt.toISOString(),
      endTime: endTime.toISOString(),
      measurements: influxdbRuntimeInfoMeasurements,
    };

    const rv = await this.influxDbDeviceService.readRuntimeInfos(organizationId, deviceJob.deviceId, dto);
    return rv;
  }

  async findAllDeviceJobs(organizationId: OrganizationId, projectId: ProjectId, pipelineId: RoutinePipelineId, routineJobId: RoutineJobId): Promise<RoutineDeviceJob[]> {
    const pipeline = await this.dataSource.getRepository(RoutinePipeline).findOne({ where: { routinePipelineId: pipelineId, projectId } });

    if (pipeline) {
      const job = await this.dataSource.getRepository(RoutineJob).findOne({ where: { routineJobId, routinePipelineId: pipelineId } });
      if (job) {
        return await this.dataSource
          .getRepository(RoutineDeviceJob) //
          .createQueryBuilder('drj')
          .where({ routineJobId })
          .innerJoinAndSelect('drj.device', 'device')
          .getMany();
      }
      throw new NotFoundException(`Cannot find job with ${routineJobId}`);
    }
    throw new NotFoundException(`Cannot find pipeline with ${pipelineId}`);
  }

  async findDeviceJobById(
    organizationId: OrganizationId,
    projectId: ProjectId,
    routinePipelineId: RoutinePipelineId,
    routineJobId: RoutineJobId,
    routineDeviceJobId: RoutineDeviceJobId,
  ): Promise<RoutineDeviceJobBase> {
    const pipeline = await this.dataSource.getRepository(RoutinePipeline).findOne({ where: { routinePipelineId, projectId } });

    if (pipeline) {
      const job = await this.dataSource.getRepository(RoutineJob).findOne({ where: { routineJobId, routinePipelineId } });
      if (job) {
        const result = await this.dataSource
          .getRepository(RoutineDeviceJob) //
          .createQueryBuilder('drj')
          .where({ routineDeviceJobId, routineJobId })
          .innerJoinAndSelect(`drj.${RoutineDeviceJobPropCamel.device}`, 'device')
          .getOne();
        if (result) {
          return result;
        }
        throw new NotFoundException('Cannot find device job');
      }
      throw new NotFoundException('Cannot find job');
    }
    throw new NotFoundException('Cannot find pipeline');
  }

  async findDeviceJobDetailsById(
    organizationId: OrganizationId,
    projectId: ProjectId,
    pipelineId: RoutinePipelineId,
    jobId: RoutineJobId,
    routineDeviceJobId: RoutineDeviceJobId,
  ): Promise<RoutineDeviceJobBase> {
    const deviceJob = await this.dataSource
      .getRepository(RoutineDeviceJob)
      .createQueryBuilder(`deviceJob`)
      .innerJoinAndSelect(`deviceJob.${RoutineDeviceJobPropCamel.routineSteps}`, `step`)
      .leftJoinAndSelect(`step.${RoutineStepPropCamel.dests}`, `dest`)
      .where(`deviceJob.${RoutineDeviceJobPropSnake.routine_device_job_id} = :${RoutineDeviceJobPropCamel.routineDeviceJobId}`, { routineDeviceJobId })
      .orderBy(`step.${RoutineStepPropCamel.routineStepId}`, 'ASC')
      .addOrderBy(`dest.${DestPropCamel.destId}`, 'ASC')
      .getOne();

    if (!deviceJob) {
      throw new HttpException(`DeviceJob not found. routineDeviceJobId: ${routineDeviceJobId}`, HttpStatus.NOT_FOUND);
    }
    return deviceJob;
  }

  async findCompletedDeviceJobLogs(
    organizationId: OrganizationId,
    projectId: ProjectId,
    pipelineId: RoutinePipelineId,
    jobId: RoutineJobId,
    deviceJobId: RoutineDeviceJobId,
  ): Promise<TestLogResponse> {
    const deviceJob = await this.dataSource.getRepository(RoutineDeviceJob).findOne({ where: { routineDeviceJobId: deviceJobId } });
    if (!deviceJob) {
      throw new HttpException(`Device job with ${deviceJobId} not found`, HttpStatus.NOT_FOUND);
    }

    if (!isCompleted(deviceJob.status)) {
      throw new HttpException(`Device job with ${deviceJobId} is not completed`, HttpStatus.BAD_REQUEST);
    }

    if (deviceJob.inProgressAt === null || deviceJob.completedAt === null) {
      throw new HttpException(`Device job with ${deviceJobId} is not completed`, HttpStatus.BAD_REQUEST);
    }
    if (deviceJob.localInProgressAt === null) {
      throw new HttpException(`Device job with ${deviceJobId} localInProgressAt is null.`, HttpStatus.BAD_REQUEST);
    }

    const interval = deviceJob.completedAt.getTime() - deviceJob.inProgressAt.getTime();
    let endTime = new Date(deviceJob.localInProgressAt.getTime() + interval);
    if (deviceJob.localCompletedAt) {
      endTime = new Date(deviceJob.localCompletedAt.getTime());
    }

    const deviceJobLogs = await this.influxDbLogService.readDeviceJobLogs(
      organizationId,
      deviceJob.routineDeviceJobId,
      deviceJob.localInProgressAt.toISOString(),
      endTime.toISOString(),
    );
    return deviceJobLogs;
  }

  async pipeStreamDeviceJobRecord(
    organizationId: OrganizationId,
    projectId: ProjectId,
    routinePipelineId: RoutinePipelineId,
    routineDeviceJobId: RoutineDeviceJobId,
    range: string | undefined,
    res: Response,
  ): Promise<void> {
    const deviceJob = await this.dataSource.getRepository(RoutineDeviceJob).findOne({ where: { routineDeviceJobId } });
    const pipeline = await this.dataSource.getRepository(RoutinePipeline).findOne({ where: { routinePipelineId } });
    if (!pipeline) {
      throw new HttpException(`Pipeline with ${routinePipelineId} not found`, HttpStatus.NOT_FOUND);
    }
    if (!pipeline.routineId) {
      throw new HttpException(`Pipeline with ${routinePipelineId} has no routineId`, HttpStatus.BAD_REQUEST);
    }

    if (!deviceJob) {
      throw new HttpException(`Device job with ${routineDeviceJobId} not found`, HttpStatus.NOT_FOUND);
    }
    if (!isCompleted(deviceJob.status)) {
      throw new HttpException(`Device job with ${routineDeviceJobId} is not completed`, HttpStatus.BAD_REQUEST);
    }
    const inProgressAt = deviceJob.inProgressAt?.toISOString();
    if (!inProgressAt) {
      throw new HttpException(`Device job with ${routineDeviceJobId} inProgressAt is not recorded`, HttpStatus.BAD_REQUEST);
    }
    const completedAt = deviceJob.completedAt?.toISOString();
    if (!completedAt) {
      throw new HttpException(`Device job with ${routineDeviceJobId} completedAt is not recorded`, HttpStatus.BAD_REQUEST);
    }

    const headResult = await this.projectFileService.getDeviceJobRecordMeta(organizationId, projectId, pipeline.routineId, routinePipelineId, routineDeviceJobId);
    if (!headResult) {
      throw new NotFoundException(`ERORR`);
    }
    const contentLength = headResult.contentLength;
    if (!contentLength) {
      throw new NotFoundException(`ERORR`);
    }
    const contentType = headResult.contentType;
    if (!contentType) {
      throw new NotFoundException(`ERORR`);
    }

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : contentLength - 1;
      const chunksize = end - start + 1;
      const recordStream = await this.projectFileService.getDeviceJobRecordStream(organizationId, projectId, pipeline.routineId, routinePipelineId, routineDeviceJobId, {
        start,
        end,
      });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${contentLength}`,
        'Content-Length': chunksize,
      };
      res.writeHead(HttpStatus.PARTIAL_CONTENT, head); //206
      recordStream.pipe(res);
    } else {
      const head = {
        'Content-Length': contentLength,
      };
      res.writeHead(HttpStatus.OK, head); //200
      const recordStream = await this.projectFileService.getDeviceJobRecordStream(organizationId, projectId, pipeline.routineId, routinePipelineId, routineDeviceJobId);
      recordStream.pipe(res);
    }
  }

  async getDeviceJobRecordUrl(organizationId: OrganizationId, projectId: ProjectId, pipelineId: RoutinePipelineId, deviceJobId: RoutineDeviceJobId): Promise<string> {
    const deviceJob = await this.dataSource.getRepository(RoutineDeviceJob).findOne({ where: { routineDeviceJobId: deviceJobId } });
    const pipeline = await this.dataSource.getRepository(RoutinePipeline).findOne({ where: { routinePipelineId: pipelineId } });
    if (!pipeline) {
      throw new HttpException(`Pipeline with ${pipelineId} not found`, HttpStatus.NOT_FOUND);
    }
    if (!pipeline.routineId) {
      throw new HttpException(`Pipeline with ${pipelineId} has no routineId`, HttpStatus.BAD_REQUEST);
    }
    if (!deviceJob) {
      throw new HttpException(`Device job with ${deviceJobId} not found`, HttpStatus.NOT_FOUND);
    }
    if (!isCompleted(deviceJob.status)) {
      throw new HttpException(`Device job with ${deviceJobId} is not completed`, HttpStatus.BAD_REQUEST);
    }
    const inProgressAt = deviceJob.inProgressAt?.toISOString();
    if (!inProgressAt) {
      throw new HttpException(`Device job with ${deviceJobId} inProgressAt is not recorded`, HttpStatus.BAD_REQUEST);
    }
    const completedAt = deviceJob.completedAt?.toISOString();
    if (!completedAt) {
      throw new HttpException(`Device job with ${deviceJobId} completedAt is not recorded`, HttpStatus.BAD_REQUEST);
    }

    const recordUrl = this.projectFileService.getDeviceJobRecordUrl(organizationId, projectId, pipeline.routineId, pipelineId, deviceJobId);
    return recordUrl;
  }
}
