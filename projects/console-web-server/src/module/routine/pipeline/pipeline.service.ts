import {
  DevicePropCamel,
  DevicePropSnake,
  JobDisplayQuery,
  JobElement,
  ProjectAndDevicePropSnake,
  RoutineDeviceJobPropCamel,
  RoutineDeviceJobPropSnake,
  RoutineJobBase,
  RoutineJobPropCamel,
  RoutinePipelineBase,
  RoutinePipelinePropCamel,
  RoutinePipelinePropSnake,
  RoutineStepPropCamel,
} from '@dogu-private/console';
import {
  CREATOR_TYPE,
  isAllowedBrowserName,
  isAllowedBrowserPlatform,
  JobSchema,
  OrganizationId,
  PIPELINE_STATUS,
  platformTypeFromPlatform,
  ProjectId,
  RoutineDeviceJobId,
  RoutineId,
  RoutineJobId,
  RoutinePipelineId,
  RoutineSchema,
  StepSchema,
  UserId,
} from '@dogu-private/types';
import { notEmpty, stringify } from '@dogu-tech/common';
import { HttpException, HttpStatus, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import lodash from 'lodash';
import { DataSource, EntityManager } from 'typeorm';
import { RoutineDeviceJob } from '../../../db/entity/device-job.entity';
import { Device, RoutineDeviceJobBrowser, RoutineJob, RoutineJobEdge } from '../../../db/entity/index';
import { RoutinePipeline } from '../../../db/entity/pipeline.entity';
import { Routine } from '../../../db/entity/routine.entity';
import { RoutineStep } from '../../../db/entity/step.entity';
import { Page } from '../../common/dto/pagination/page';
import { ProjectFileService } from '../../file/project-file.service';
import { YamlLoaderService } from '../../init/yaml-loader/yaml-loader.service';
import { DoguLogger } from '../../logger/logger';
import { DeviceStatusService } from '../../organization/device/device-status.service';
import { validateRoutineSchema } from '../common/validator';
import { CreateInstantPipelineDto, FindAllPipelinesDto } from './dto/pipeline.dto';

enum RUNS_ON_TYPE {
  DEVICE_NAMES = 0,
  DEVICE_TAGS = 1,
  DEVICE_TAG_WITH_BROWSER = 2,
}

interface ParsedRunsOnNames {
  type: RUNS_ON_TYPE.DEVICE_NAMES;
  deviceNames: string[];
}

interface ParsedRunsOnTags {
  type: RUNS_ON_TYPE.DEVICE_TAGS;
  deviceTags: string[];
}

interface ParsedRunsOnTagWithBrowser {
  type: RUNS_ON_TYPE.DEVICE_TAG_WITH_BROWSER;
  deviceTag: string;
  browserName: string;
}

type ParsedRunsOn = ParsedRunsOnNames | ParsedRunsOnTags | ParsedRunsOnTagWithBrowser;

function createStepEnv(routineSchema: RoutineSchema, stepSchema: StepSchema): Record<string, string> {
  return lodash.merge(routineSchema.env ?? {}, stepSchema.env ?? {});
}

@Injectable()
export class PipelineService {
  constructor(
    @Inject(YamlLoaderService)
    private readonly yamlLoaderService: YamlLoaderService,
    private readonly projectFileService: ProjectFileService,
    private readonly deviceStatusService: DeviceStatusService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly logger: DoguLogger,
  ) {}

  public async findPipelineAndSubDatasById(manager: EntityManager, pipelineId: RoutinePipelineId): Promise<RoutinePipeline> {
    const pipeline = await manager //
      .getRepository(RoutinePipeline)
      .createQueryBuilder('pipeline')
      .innerJoinAndSelect(`pipeline.${RoutinePipelinePropCamel.routineJobs}`, 'job')
      .innerJoinAndSelect(`job.${RoutineJobPropCamel.routineDeviceJobs}`, 'deviceJob')
      .innerJoinAndSelect(`deviceJob.${RoutineDeviceJobPropCamel.routineSteps}`, 'step')
      .innerJoinAndSelect(`deviceJob.${RoutineDeviceJobPropCamel.device}`, 'device')
      .leftJoinAndSelect(`step.${RoutineStepPropCamel.dests}`, 'dest')
      .where(`pipeline.${RoutinePipelinePropSnake.routine_pipeline_id} = :pipelineId`, { pipelineId })
      .orderBy(`step.${RoutineStepPropCamel.routineStepId}`, 'ASC')
      .getOne();

    if (!pipeline) {
      throw new HttpException(`This pipeline does not exist. pipelineId: ${pipelineId}`, HttpStatus.NOT_FOUND);
    }
    return pipeline;
  }

  public deepComparePipelineStatus(srcPipeline: RoutinePipeline, destPipeline: RoutinePipeline): boolean {
    if (srcPipeline.routinePipelineId !== destPipeline.routinePipelineId) {
      throw new Error(`srcPipelineId: ${srcPipeline.routinePipelineId} is not equal to destPipelineId: ${destPipeline.routinePipelineId}`);
    }

    // pipeline status
    if (srcPipeline.status !== destPipeline.status) {
      // this.logger.debug(`srcPipeline.status: ${srcPipeline.status}, destPipeline.status: ${destPipeline.status}`);
      return false;
    }

    // compare jobs
    const srcJobs = srcPipeline.routineJobs ? srcPipeline.routineJobs : [];
    const destJobs = destPipeline.routineJobs ? destPipeline.routineJobs : [];
    srcJobs.sort((a, b) => a.routineJobId - b.routineJobId);
    destJobs.sort((a, b) => a.routineJobId - b.routineJobId);
    if (srcJobs.length !== destJobs.length || srcJobs.length === 0 || srcJobs.length !== destJobs.length) {
      throw new Error(`srcJobs.length: ${srcJobs.length} is not equal to destJobs.length: ${destJobs.length}`);
    }
    for (let i = 0; i < srcJobs.length; i++) {
      if (srcJobs[i].status !== destJobs[i].status) {
        // this.logger.debug(`srcJobs[i].status: ${srcJobs[i].status}, destJobs[i].status: ${destJobs[i].status}`);
        return false;
      }
    }

    // compare deviceJobs
    const srcDeviceJobs = srcJobs.flatMap((job) => job.routineDeviceJobs).filter(notEmpty);
    const destDeviceJobs = destJobs.flatMap((job) => job.routineDeviceJobs).filter(notEmpty);
    srcDeviceJobs.sort((a, b) => a.routineDeviceJobId - b.routineDeviceJobId);
    destDeviceJobs.sort((a, b) => a.routineDeviceJobId - b.routineDeviceJobId);
    if (srcDeviceJobs.length !== destDeviceJobs.length || srcDeviceJobs.length === 0 || srcDeviceJobs.length !== destDeviceJobs.length) {
      throw new Error(`srcDeviceJobs.length: ${srcDeviceJobs.length} is not equal to destDeviceJobs.length: ${destDeviceJobs.length}`);
    }
    for (let i = 0; i < srcDeviceJobs.length; i++) {
      if (srcDeviceJobs[i].status !== destDeviceJobs[i].status) {
        // this.logger.debug(`srcDeviceJobs[i].status: ${srcDeviceJobs[i].status}, destDeviceJobs[i].status: ${destDeviceJobs[i].status}`);
        return false;
      }
    }

    // compare steps
    const srcSteps = srcDeviceJobs.flatMap((deviceJob) => deviceJob.routineSteps).filter(notEmpty);
    const destSteps = destDeviceJobs.flatMap((deviceJob) => deviceJob.routineSteps).filter(notEmpty);
    srcSteps.sort((a, b) => a.routineStepId - b.routineStepId);
    destSteps.sort((a, b) => a.routineStepId - b.routineStepId);
    if (srcSteps.length !== destSteps.length || srcSteps.length === 0 || srcSteps.length !== destSteps.length) {
      throw new Error(`srcSteps.length: ${srcSteps.length} is not equal to destSteps.length: ${destSteps.length}`);
    }
    for (let i = 0; i < srcSteps.length; i++) {
      if (srcSteps[i].status !== destSteps[i].status) {
        // this.logger.debug(`srcSteps[i].status: ${srcSteps[i].status}, destSteps[i].status: ${destSteps[i].status}`);
        return false;
      }
    }

    // compare dests
    const srcDests = srcSteps.flatMap((step) => step.dests).filter(notEmpty);
    const destDests = destSteps.flatMap((step) => step.dests).filter(notEmpty);
    srcDests.sort((a, b) => a.destId - b.destId);
    destDests.sort((a, b) => a.destId - b.destId);
    if (srcDests.length === 0 && destDests.length === 0) {
      return true;
    }
    if (srcDests.length !== destDests.length) {
      return false;
    }

    for (let i = 0; i < srcDests.length; i++) {
      if (srcDests[i].state !== destDests[i].state) {
        // this.logger.debug(`srcDests[i].status: ${srcDests[i].status}, destDests[i].status: ${destDests[i].status}`);
        return false;
      }
    }

    return true;
  }

  private parseRunsOnFromJobSchema(jobSchema: JobSchema): ParsedRunsOn {
    const runsOn = jobSchema['runs-on'];
    if (typeof runsOn === 'object' && 'browserName' in runsOn && 'platformName' in runsOn) {
      return {
        type: RUNS_ON_TYPE.DEVICE_TAG_WITH_BROWSER,
        deviceTag: runsOn.platformName,
        browserName: runsOn.browserName,
      };
    } else if (typeof runsOn === 'string' || Array.isArray(runsOn)) {
      return {
        type: RUNS_ON_TYPE.DEVICE_NAMES,
        deviceNames: Array.isArray(runsOn) ? runsOn : [runsOn],
      };
    } else if (typeof runsOn === 'object' && 'group' in runsOn) {
      return {
        type: RUNS_ON_TYPE.DEVICE_TAGS,
        deviceTags: Array.isArray(runsOn.group) ? runsOn.group : [runsOn.group],
      };
    } else {
      throw new HttpException(`Invalid runs-on type: ${stringify(runsOn)}`, HttpStatus.BAD_REQUEST);
    }
  }

  private async createPipeline(
    manager: EntityManager,
    projectId: ProjectId,
    routineId: RoutineId | null,
    creatorId: UserId | null,
    creatorType: CREATOR_TYPE,
  ): Promise<RoutinePipeline> {
    // create pipeline by instanct routine
    if (!routineId) {
      const pipeline = manager.getRepository(RoutinePipeline).create({
        projectId,
        routineId,
        creatorId,
        status: PIPELINE_STATUS.WAITING,
        creatorType,
        index: 0,
      });
      const rv = await manager.getRepository(RoutinePipeline).save(pipeline);
      return rv;
    } else {
      // create pipeline by routine config
      const routine = await manager.getRepository(Routine).findOne({ where: { routineId } });
      if (!routine) {
        throw new HttpException(`This routine does not exist: ${routineId}`, HttpStatus.NOT_FOUND);
      }

      const index = routine.lastIndex + 1;
      const pipeline = manager.getRepository(RoutinePipeline).create({
        projectId,
        routineId,
        creatorId,
        status: PIPELINE_STATUS.WAITING,
        creatorType,
        index,
      });

      await manager.getRepository(Routine).save(Object.assign(routine, { lastIndex: index }));
      const rv = await manager.getRepository(RoutinePipeline).save(pipeline);
      return rv;
    }
  }

  private async createJobs(manager: EntityManager, routineSchema: RoutineSchema, pipeline: RoutinePipeline): Promise<RoutineJob[]> {
    const jobNames = Object.keys(routineSchema.jobs);
    const jobDatas = jobNames.map((jobName, index) => {
      const record = routineSchema.jobs[jobName].record ? Number(routineSchema.jobs[jobName].record) : 0;
      const job = manager.getRepository(RoutineJob).create({
        record,
        routinePipelineId: pipeline.routinePipelineId,
        name: jobName,
        index,
        status: PIPELINE_STATUS.WAITING,
      });
      return job;
    });

    const jobs = await manager.getRepository(RoutineJob).save(jobDatas);
    return jobs;
  }

  private async createJobEdges(manager: EntityManager, routineSchema: RoutineSchema, jobs: RoutineJob[]): Promise<void> {
    const jobNames = Object.keys(routineSchema.jobs);

    const jobEdges = jobNames
      .map((jobName) => {
        const jobSchema = routineSchema.jobs[jobName];
        if (!jobSchema.needs) {
          return null;
        }

        const needs = typeof jobSchema.needs === 'string' ? [jobSchema.needs] : Array.isArray(jobSchema.needs) ? jobSchema.needs : [];
        if (needs.length === 0) {
          throw new HttpException(`Invalid needs type: ${stringify(jobSchema.needs)}`, HttpStatus.BAD_REQUEST);
        }

        const routineJobId = jobs.find((job) => job.name === jobName)?.routineJobId;
        if (!routineJobId) {
          throw new HttpException(`Invalid job name: ${jobName}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        const createdJobEdgeDatas: RoutineJobEdge[] = [];
        const jobEdgeDats = needs.map((need) => {
          const parentJobId = jobs.find((job) => job.name === need)?.routineJobId;
          if (!parentJobId) {
            throw new HttpException(`Invalid need job name: ${need}`, HttpStatus.BAD_REQUEST);
          }
          const jobEdgeData = manager.getRepository(RoutineJobEdge).create({
            routineJobId,
            parentRoutineJobId: parentJobId,
          });
          return jobEdgeData;
        });
        createdJobEdgeDatas.push(...jobEdgeDats);

        return createdJobEdgeDatas;
      })
      .flat()
      .filter(notEmpty);

    await manager.getRepository(RoutineJobEdge).save(jobEdges);
  }

  private async createDeviceJobs(
    manager: EntityManager,
    organizationId: OrganizationId,
    projectId: ProjectId,
    routineSchema: RoutineSchema,
    jobs: RoutineJob[],
  ): Promise<RoutineDeviceJob[]> {
    const parsedRoutineDeviceJobPromises = jobs
      .map((routineJob) => {
        const jobSchema = routineSchema.jobs[routineJob.name];
        const record = jobSchema.record ? 1 : 0;
        const parsedRunsOn = this.parseRunsOnFromJobSchema(jobSchema);
        return {
          routineJob,
          parsedRunsOn,
          record,
        };
      })
      .map(async ({ routineJob, parsedRunsOn, record }) => {
        const { type } = parsedRunsOn;
        switch (type) {
          case RUNS_ON_TYPE.DEVICE_NAMES: {
            const { deviceNames } = parsedRunsOn;
            const devices = await this.deviceStatusService.findDevicesByName(manager, organizationId, projectId, deviceNames, true);
            if (devices.length === 0) {
              throw new HttpException(`This project has no devices with names: [${deviceNames.toString()}]`, HttpStatus.NOT_FOUND);
            }
            const routineDeviceJobs = devices.map((device) => {
              const routineDeviceJob = manager.getRepository(RoutineDeviceJob).create({
                routineJobId: routineJob.routineJobId,
                deviceId: device.deviceId,
                status: PIPELINE_STATUS.WAITING,
                record,
              });
              return routineDeviceJob;
            });
            return routineDeviceJobs.map((routineDeviceJob) => {
              return {
                type,
                routineDeviceJob,
              };
            });
          }
          case RUNS_ON_TYPE.DEVICE_TAGS: {
            const { deviceTags } = parsedRunsOn;
            const devices = await this.deviceStatusService.findDevicesByDeviceTag(manager, organizationId, projectId, deviceTags, true);
            if (devices.length === 0) {
              throw new HttpException(`This project has no device Tags: [${deviceTags.toString()}]`, HttpStatus.NOT_FOUND);
            }
            const routineDeviceJobs = devices.map((device) => {
              const routineDeviceJob = manager.getRepository(RoutineDeviceJob).create({
                routineJobId: routineJob.routineJobId,
                deviceId: device.deviceId,
                status: PIPELINE_STATUS.WAITING,
                record,
              });
              return routineDeviceJob;
            });
            return routineDeviceJobs.map((routineDeviceJob) => {
              return {
                type,
                routineDeviceJob,
              };
            });
          }
          case RUNS_ON_TYPE.DEVICE_TAG_WITH_BROWSER: {
            const { deviceTag, browserName } = parsedRunsOn;
            const device = await this.deviceStatusService.findDeviceByDeviceTagWithBrowser(manager, organizationId, projectId, deviceTag, browserName, true);
            if (!device) {
              throw new HttpException(`This project has no device Tag: [${deviceTag}]`, HttpStatus.NOT_FOUND);
            }
            const routineDeviceJob = manager.getRepository(RoutineDeviceJob).create({
              routineJobId: routineJob.routineJobId,
              deviceId: device.deviceId,
              status: PIPELINE_STATUS.WAITING,
              record,
            });

            const platformType = platformTypeFromPlatform(device.platform);
            if (isAllowedBrowserPlatform(platformType) && isAllowedBrowserName(browserName)) {
              return [
                {
                  type,
                  routineDeviceJob,
                  browserName,
                },
              ];
            } else {
              throw new HttpException(`Invalid browserName: ${browserName} or platform: ${platformType}`, HttpStatus.BAD_REQUEST);
            }
          }
          default:
            const _exhaustiveCheck: never = type;
            throw new HttpException('Invalid runs-on type', HttpStatus.BAD_REQUEST);
        }
      });

    const parsedRoutineDeviceJobInfos = (await Promise.all(parsedRoutineDeviceJobPromises)).flat();
    const routineDeviceJobs = parsedRoutineDeviceJobInfos.map((parsedRoutineDeviceJobInfo) => parsedRoutineDeviceJobInfo.routineDeviceJob);
    const savedRoutineDeviceJobs = await manager.getRepository(RoutineDeviceJob).save(routineDeviceJobs);
    const savedRoutineDeviceJobInfos = parsedRoutineDeviceJobInfos.map((parsedRoutineDeviceJobInfo, index) => {
      const { routineDeviceJob, ...rest } = parsedRoutineDeviceJobInfo;
      return {
        ...rest,
        routineDeviceJob: savedRoutineDeviceJobs[index],
      };
    });

    const routineDeviceJobBrowsers = savedRoutineDeviceJobInfos
      .filter((savedRoutineDeviceJobInfo) => savedRoutineDeviceJobInfo.type === RUNS_ON_TYPE.DEVICE_TAG_WITH_BROWSER)
      .map((savedRoutineDeviceJobInfo) => {
        const { type } = savedRoutineDeviceJobInfo;
        if (type !== RUNS_ON_TYPE.DEVICE_TAG_WITH_BROWSER) {
          throw new HttpException(`Invalid type: ${type}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
        const { routineDeviceJob, browserName } = savedRoutineDeviceJobInfo;
        const deviceJobBrowser = manager.getRepository(RoutineDeviceJobBrowser).create({
          routineDeviceJobId: routineDeviceJob.routineDeviceJobId,
          browserName,
        });
        return deviceJobBrowser;
      });
    await manager.getRepository(RoutineDeviceJobBrowser).save(routineDeviceJobBrowsers);

    return routineDeviceJobs;
  }

  private async createSteps(manager: EntityManager, routineSchema: RoutineSchema, Jobs: RoutineJob[], deviceJobs: RoutineDeviceJob[]): Promise<RoutineStep[]> {
    const steps = deviceJobs
      .map((deviceJob) => {
        const jobName = Jobs.find((job) => job.routineJobId === deviceJob.routineJobId)?.name;
        if (!jobName) {
          throw new Error('job not found');
        }

        const jobYamlData = routineSchema.jobs[jobName];
        const stepDatas = jobYamlData.steps.map((step, index) => {
          const stepData = this.dataSource.manager.getRepository(RoutineStep).create({
            routineDeviceJobId: deviceJob.routineDeviceJobId,
            name: step.name,
            index: index,
            status: PIPELINE_STATUS.WAITING,
            uses: step.uses,
            with: step.with,
            run: step.run,
            env: createStepEnv(routineSchema, step),
            cwd: step.cwd ?? '',
          });
          return stepData;
        });
        return stepDatas;
      })
      .flat();

    const rv = await manager.getRepository(RoutineStep).save(steps);
    return rv;
  }

  private async createPipelineData(
    routineSchema: RoutineSchema,
    organizationId: OrganizationId,
    projectId: ProjectId,
    routineId: RoutineId | null,
    creatorId: UserId | null,
    creatorType: CREATOR_TYPE,
  ): Promise<RoutinePipeline> {
    const pipeline = await this.dataSource.transaction(async (transactionEntityManager: EntityManager): Promise<RoutinePipeline> => {
      const pipeline = await this.createPipeline(transactionEntityManager, projectId, routineId, creatorId, creatorType);

      const jobs = await this.createJobs(transactionEntityManager, routineSchema, pipeline);
      if (jobs.length === 0) {
        throw new HttpException(`Jobs are not created. pipelineId: ${pipeline.routinePipelineId}`, HttpStatus.INTERNAL_SERVER_ERROR);
      }

      await this.createJobEdges(transactionEntityManager, routineSchema, jobs);

      const deviceJobs = await this.createDeviceJobs(transactionEntityManager, organizationId, projectId, routineSchema, jobs);
      if (deviceJobs.length === 0) {
        throw new HttpException(`DeviceJobs are not created. pipelineId: ${pipeline.routinePipelineId}`, HttpStatus.INTERNAL_SERVER_ERROR);
      }

      const steps = await this.createSteps(transactionEntityManager, routineSchema, jobs, deviceJobs);
      if (steps.length === 0) {
        throw new HttpException(`Steps are not created. pipelineId: ${pipeline.routinePipelineId}`, HttpStatus.INTERNAL_SERVER_ERROR);
      }

      // pipeline - job relation
      pipeline.routineJobs = jobs;
      // job - deviceJob relation
      jobs.forEach((job) => {
        job.routineDeviceJobs = deviceJobs.filter((deviceJob) => deviceJob.routineJobId === job.routineJobId);
      });
      // deviceJob - step relation
      deviceJobs.forEach((deviceJob) => {
        deviceJob.routineSteps = steps.filter((step) => step.routineDeviceJobId === deviceJob.routineDeviceJobId);
      });

      return pipeline;
    });

    return pipeline;
  }

  async createPipelineByRoutineConfig(
    organizationId: OrganizationId,
    projectId: ProjectId,
    routineId: RoutineId,
    creatorId: UserId | null,
    creatorType: CREATOR_TYPE,
  ): Promise<RoutinePipeline> {
    const routine = await this.dataSource.manager.getRepository(Routine).findOne({ where: { routineId } });
    if (!routine) {
      throw new HttpException(`This routine does not exist: ${routineId}`, HttpStatus.NOT_FOUND);
    }

    const routineData = await this.projectFileService.readRoutine(organizationId, projectId, routineId, routine.name);
    const routineSchema: RoutineSchema = this.yamlLoaderService.routineYamlToObject(routineData);
    validateRoutineSchema(routineSchema);

    const rv = await this.createPipelineData(routineSchema, organizationId, projectId, routineId, creatorId, creatorType);
    return rv;
  }

  async createInstantPipelineDatas(organizationId: OrganizationId, projectId: ProjectId, creatorId: UserId, dto: CreateInstantPipelineDto): Promise<RoutinePipelineBase> {
    const { scriptPath, appVersion, deviceName } = dto;

    const device = await this.dataSource.manager //
      .getRepository(Device)
      .createQueryBuilder('device')
      .leftJoinAndSelect(
        `device.${DevicePropCamel.routineDeviceJobs}`,
        'deviceJob',
        `deviceJob.${RoutineDeviceJobPropSnake.status} = :status1 OR deviceJob.${RoutineDeviceJobPropSnake.status} = :status2`,
        { status1: PIPELINE_STATUS.IN_PROGRESS, status2: PIPELINE_STATUS.WAITING },
      )
      .leftJoinAndSelect(`device.${DevicePropCamel.projectAndDevices}`, 'projectAndDevice', `projectAndDevice.${ProjectAndDevicePropSnake.project_id} = :projectId`, {
        projectId,
      })
      .where(`device.${DevicePropSnake.organization_id} = :organizationId`, { organizationId })
      .andWhere(`device.${DevicePropSnake.name} = :deviceName`, { deviceName })
      .getOne();

    if (!device) {
      throw new HttpException(`This device does not exist: ${deviceName}`, HttpStatus.NOT_FOUND);
    }
    if (device.isGlobal === 0 && (!device.projectAndDevices || device.projectAndDevices.length === 0)) {
      throw new HttpException(`This device does not belong to this project: ${deviceName}`, HttpStatus.NOT_FOUND);
    }
    if (device.routineDeviceJobs && device.routineDeviceJobs.length > 0) {
      throw new HttpException(`This device is currently in use: ${deviceName}`, HttpStatus.BAD_REQUEST);
    }

    let checkOutStep: StepSchema | null = null;
    if (appVersion) {
      checkOutStep = {
        name: 'checkout',
        uses: 'dogu-actions/prepare',
        with: {
          appVersion: {
            [platformTypeFromPlatform(device.platform)]: appVersion,
          },
        },
      };
    }

    const runStep: StepSchema = {
      name: 'run',
      uses: 'dogu-actions/run-test',
      with: {
        script: scriptPath,
      },
    };

    const job: JobSchema = {
      'runs-on': deviceName,
      steps: [checkOutStep, runStep].filter(notEmpty),
    };

    const routine: RoutineSchema = {
      on: { instant: 'instant' },
      name: 'instant',
      jobs: {
        instant: job,
      },
    };

    const pipeline = await this.createPipelineData(routine, organizationId, projectId, null, creatorId, CREATOR_TYPE.USER);
    return pipeline;
  }

  async findAllPipelines(organizationId: OrganizationId, projectId: ProjectId, dto: FindAllPipelinesDto): Promise<Page<RoutinePipeline>> {
    const [pipelines, totalCount] = await this.dataSource
      .getRepository(RoutinePipeline)
      .createQueryBuilder('pipeline')
      .where({ projectId })
      .andWhere(dto.routine ? { routineId: dto.routine } : '1=1')
      .andWhere(dto.status && dto.status.length > 0 ? `pipeline.status IN (${dto.status.map((item) => `'${item}'`).join(', ')})` : '1=1')
      .orderBy('pipeline.createdAt', 'DESC')
      .addOrderBy('pipeline.index', 'DESC')
      .leftJoinAndSelect('pipeline.creator', 'user')
      .innerJoinAndSelect('pipeline.routine', 'routine')
      .take(dto.getDBLimit())
      .skip(dto.getDBOffset())
      .getManyAndCount();

    return new Page(dto.page, dto.offset, totalCount, pipelines);
  }

  async findPipelineById(organizationId: OrganizationId, projectId: ProjectId, routinePipelineId: RoutinePipelineId): Promise<RoutinePipeline> {
    const pipeline = await this.dataSource
      .getRepository(RoutinePipeline)
      .createQueryBuilder('pipeline')
      .where({ projectId, routinePipelineId })
      .leftJoinAndSelect(`pipeline.${RoutinePipelinePropCamel.creator}`, 'user')
      .innerJoinAndSelect(`pipeline.${RoutinePipelinePropCamel.routine}`, 'routine')
      .leftJoinAndSelect(`pipeline.${RoutinePipelinePropCamel.canceler}`, 'user_canceler')
      .getOne();

    if (pipeline) {
      return pipeline;
    }

    throw new NotFoundException('Cannot find pipeline');
  }

  async findAllPipelineJobs(
    organizationId: OrganizationId,
    projectId: ProjectId,
    routinePipelineId: RoutinePipelineId,
    query: JobDisplayQuery = JobDisplayQuery.LIST,
  ): Promise<JobElement[] | RoutineJobBase[]> {
    const pipeline = await this.dataSource.getRepository(RoutinePipeline).findOne({ where: { projectId, routinePipelineId } });

    if (pipeline) {
      const jobBaseQuery = this.dataSource.getRepository(RoutineJob).createQueryBuilder('job').where({
        routinePipelineId,
      });

      if (query === JobDisplayQuery.TREE) {
        const jobs = await jobBaseQuery.leftJoinAndSelect(`job.${RoutineJobPropCamel.routineJobEdges}`, 'job_edge').getMany();

        const jobElements: JobElement[] = jobs.map((item) => ({ ...item, children: [] }));
        const rootJobs = jobElements.filter((item) => item.routineJobEdges!.length === 0);
        const elements = this.appendChildrenJob(rootJobs, jobElements);

        return elements;
      }

      const jobs = await jobBaseQuery.orderBy('job.index', 'ASC').getMany();

      return jobs;
    } else {
      throw new NotFoundException('Cannot find pipeline');
    }
  }

  async findPipelineJobById(organizationId: OrganizationId, projectId: ProjectId, routinePipelineId: RoutinePipelineId, routineJobId: RoutineJobId): Promise<RoutineJob> {
    const pipeline = await this.dataSource.getRepository(RoutinePipeline).findOne({ where: { projectId, routinePipelineId: routinePipelineId } });

    if (pipeline) {
      const job = await this.dataSource //
        .getRepository(RoutineJob)
        .createQueryBuilder('job')
        .where({ routineJobId, routinePipelineId })
        .innerJoinAndSelect(`job.${DevicePropCamel.routineDeviceJobs}`, 'deviceJobs')
        .getOne();

      if (job) {
        return job;
      }

      throw new NotFoundException('Cannot find job');
    }

    throw new NotFoundException('Cannot find pipeline');
  }

  async findAllDeviceJobSteps(
    organizationId: OrganizationId,
    projectId: ProjectId,
    routinePipelineId: RoutinePipelineId,
    routineJobId: RoutineJobId,
    routineDeviceJobId: RoutineDeviceJobId,
  ): Promise<RoutineStep[]> {
    const pipeline = await this.dataSource.getRepository(RoutinePipeline).findOne({ where: { routinePipelineId, projectId } });

    if (pipeline) {
      const job = await this.dataSource.getRepository(RoutineJob).findOne({ where: { routineJobId, routinePipelineId } });

      if (job) {
        const drj = await this.dataSource.getRepository(RoutineDeviceJob).findOne({ where: { routineDeviceJobId, routineJobId } });

        if (drj) {
          return await this.dataSource
            .getRepository(RoutineStep)
            .createQueryBuilder('step')
            .where({ routineDeviceJobId })
            .orderBy(`step.${RoutineStepPropCamel.routineStepId}`, 'ASC')
            .getMany();
        }

        throw new NotFoundException('Cannot find device job');
      }

      throw new NotFoundException('Cannot find job');
    }

    throw new NotFoundException('Cannot find pipeline');
  }

  private appendChildrenJob(roots: JobElement[], entire: JobElement[]): JobElement[] {
    if (roots.length === 0) {
      return [];
    }

    const elements = roots.map((root) => {
      return {
        ...root,
        children: this.appendChildrenJob(
          entire.filter((item) => !!item.routineJobEdges!.find((item) => item.parentRoutineJobId === root.routineJobId)),
          entire,
        ),
      };
    });

    return elements;
  }
}
