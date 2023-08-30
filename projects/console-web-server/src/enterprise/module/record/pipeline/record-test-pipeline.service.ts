import {
  RecordPipelineBase,
  RecordTestCasePropCamel,
  RecordTestScenarioAndRecordTestCasePropCamel,
  RecordTestScenarioPropCamel,
  RecordTestScenarioPropSnake,
} from '@dogu-private/console';
import { CREATOR_TYPE, ProjectId, RecordDeviceJobId, RecordPipelineId, RecordTestScenarioId, RECORD_PIPELINE_STATE, UserId } from '@dogu-private/types';
import { notEmpty } from '@dogu-tech/common';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { v4 } from 'uuid';
import { Device } from '../../../../db/entity/index';
import { RecordAction } from '../../../../db/entity/record-action.entity';
import { RecordDeviceJob } from '../../../../db/entity/record-device-job.entity';
import { RecordPipeline } from '../../../../db/entity/record-pipeline.entity';
import { RecordTestScenario } from '../../../../db/entity/record-test-scenario.entity';
import { RecordTestStep } from '../../../../db/entity/record-test-step.entity';
import { getSortedRecordTestCases } from '../common';

@Injectable()
export class RecordPipelineService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async createRecordPipelineData(
    // organizationId: OrganizationId,
    projectId: ProjectId,
    recordTestScenarioId: RecordTestScenarioId,
    creatorId: UserId | null,
    creatorType: CREATOR_TYPE,
  ): Promise<RecordPipelineBase> {
    const scenario = await this.dataSource
      .getRepository(RecordTestScenario)
      .createQueryBuilder('scenario')
      .leftJoinAndSelect(`scenario.${RecordTestScenarioPropCamel.recordTestScenarioAndRecordTestCases}`, 'scenarioAndCase')
      .leftJoinAndSelect(`scenarioAndCase.${RecordTestScenarioAndRecordTestCasePropCamel.recordTestCase}`, 'case')
      .leftJoinAndSelect(`case.${RecordTestCasePropCamel.recordTestSteps}`, 'step')
      .where(`scenario.${RecordTestScenarioPropSnake.record_test_scenario_id} = :${RecordTestScenarioPropCamel.recordTestScenarioId}`, { recordTestScenarioId })
      .getOne();
    if (!scenario) {
      throw new HttpException('RecordTestScenario not found', HttpStatus.NOT_FOUND);
    }

    const sortedCases = getSortedRecordTestCases(scenario);
    const sortedSteps = sortedCases.flatMap((c) => c.recordTestSteps).filter(notEmpty);

    const d = await this.dataSource.manager.getRepository(Device).findOne({ where: { deviceId: '85420e5a-1733-4d79-9eaa-226f7b9e979a' } });
    const devices: Device[] = [d!];

    const rv = await this.dataSource.manager.transaction(async (manager) => {
      // create pipeline
      const pipeline = await this.createRecordPipeline(manager, projectId, recordTestScenarioId, creatorId, creatorType);

      // create device job
      const deviceJobs = await this.createRecordDeviceJob(manager, pipeline.recordPipelineId, devices);

      for (const deviceJob of deviceJobs) {
        // craete action
        let index = 0;
        for (const step of sortedSteps) {
          index++;
          const actionData = await this.createRecordAction(manager, deviceJob.recordDeviceJobId, step, index);
          await manager.getRepository(RecordAction).save(actionData);
        }
      }
      return pipeline;
    });
    return rv;
  }

  async createRecordPipeline(
    manager: EntityManager,
    projectId: ProjectId,
    recordTestScenarioId: RecordTestScenarioId,
    creatorId: UserId | null,
    creatorType: CREATOR_TYPE,
  ): Promise<RecordPipeline> {
    const pipelineData = manager.getRepository(RecordPipeline).create({
      recordPipelineId: v4(),
      recordTestScenarioId,
      state: RECORD_PIPELINE_STATE.WAITING,
      projectId,
      creatorId,
      creatorType,
    });
    const pipeline = await manager.getRepository(RecordPipeline).save(pipelineData);
    return pipeline;
  }

  async createRecordDeviceJob(manager: EntityManager, recordPipelineId: RecordPipelineId, devices: Device[]): Promise<RecordDeviceJob[]> {
    const deviceJobs = [];
    for (const device of devices) {
      const deviceJobData = manager.getRepository(RecordDeviceJob).create({
        recordDeviceJobId: v4(),
        recordPipelineId: recordPipelineId,
        state: RECORD_PIPELINE_STATE.WAITING,
        deviceId: device.deviceId,
        deviceInfo: JSON.parse(JSON.stringify(device)),
      });
      const deviceJob = await manager.getRepository(RecordDeviceJob).save(deviceJobData);
      deviceJobs.push(deviceJob);
    }
    return deviceJobs;
  }

  async createRecordAction(manager: EntityManager, recordDeviceJobId: RecordDeviceJobId, recordTestStep: RecordTestStep, index: number): Promise<RecordAction> {
    const actionData = manager.getRepository(RecordAction).create({
      recordActionId: v4(),
      recordDeviceJobId: recordDeviceJobId,
      recordTestStepId: recordTestStep.recordTestStepId,
      state: RECORD_PIPELINE_STATE.WAITING,
      index,
      type: recordTestStep.type,
      actionInfo: JSON.parse(JSON.stringify(recordTestStep)),
    });
    return actionData;
  }
}
