import {
  RecordPipelineBase,
  RecordTestCasePropCamel,
  RecordTestScenarioAndRecordTestCasePropCamel,
  RecordTestScenarioPropCamel,
  RecordTestScenarioPropSnake,
} from '@dogu-private/console';
import { CREATOR_TYPE, ProjectId, RecordCaseActionId, RecordDeviceJobId, RecordPipelineId, RecordTestScenarioId, RECORD_PIPELINE_STATE, UserId } from '@dogu-private/types';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { v4 } from 'uuid';
import { Device } from '../../../../db/entity/index';
import { RecordCaseAction } from '../../../../db/entity/record-case-action.entity';
import { RecordDeviceJob } from '../../../../db/entity/record-device-job.entity';
import { RecordPipeline } from '../../../../db/entity/record-pipeline.entity';
import { RecordStepAction } from '../../../../db/entity/record-step-action.entity';
import { RecordTestCase } from '../../../../db/entity/record-test-case.entity';
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
    const rv = await this.dataSource.manager.transaction(async (manager) => {
      const scenario = await manager
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
      // const sortedSteps = sortedCases.flatMap((c) => c.recordTestSteps).filter(notEmpty);

      // FIXME:(felix) test code
      const d = await manager.getRepository(Device).findOne({ where: { deviceId: '85420e5a-1733-4d79-9eaa-226f7b9e979a' } });
      const d2 = await manager.getRepository(Device).findOne({ where: { deviceId: 'd8bb319e-5b92-443f-a3c8-21392d10765a' } });
      const devices: Device[] = [d!, d2!];
      // create pipeline
      scenario.lastIndex = scenario.lastIndex + 1;
      await manager.getRepository(RecordTestScenario).update({ recordTestScenarioId }, { lastIndex: scenario.lastIndex });

      const pipeline = await this.createRecordPipeline(manager, projectId, recordTestScenarioId, creatorId, creatorType, scenario.lastIndex);
      // create device job
      const deviceJobs = await this.createRecordDeviceJob(manager, pipeline.recordPipelineId, devices);
      for (const deviceJob of deviceJobs) {
        // craete case action
        const caseActions = await this.createRecordCaseAction(manager, deviceJob.recordDeviceJobId, sortedCases);
        for (const caseAction of caseActions) {
          // create step action
          const sortedSteps = sortedCases.find((c) => c.recordTestCaseId === caseAction.recordTestCaseInfo.recordTestCaseId)!.recordTestSteps!;
          const stepActions = await this.createRecordStepAction(manager, caseAction.recordCaseActionId, sortedSteps);
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
    index: number,
  ): Promise<RecordPipeline> {
    const pipelineData = manager.getRepository(RecordPipeline).create({
      recordPipelineId: v4(),
      recordTestScenarioId,
      state: RECORD_PIPELINE_STATE.WAITING,
      index,
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
        recordPipelineId,
        state: RECORD_PIPELINE_STATE.WAITING,
        deviceId: device.deviceId,
        deviceInfo: JSON.parse(JSON.stringify(device)),
      });
      const deviceJob = await manager.getRepository(RecordDeviceJob).save(deviceJobData);
      deviceJobs.push(deviceJob);
    }
    return deviceJobs;
  }

  async createRecordCaseAction(manager: EntityManager, recordDeviceJobId: RecordDeviceJobId, recordTestCases: RecordTestCase[]): Promise<RecordCaseAction[]> {
    const actions = [];
    let index = 0;
    for (const recordTestCase of recordTestCases) {
      const actionCase = manager.getRepository(RecordCaseAction).create({
        recordCaseActionId: v4(),
        recordDeviceJobId,
        recordTestCaseId: recordTestCase.recordTestCaseId,
        state: RECORD_PIPELINE_STATE.WAITING,
        index,
        recordTestCaseInfo: JSON.parse(JSON.stringify(recordTestCase)),
      });
      await manager.getRepository(RecordCaseAction).save(actionCase);
      actions.push(actionCase);
      index++;
    }
    return actions;
  }

  async createRecordStepAction(manager: EntityManager, recordCaseActionId: RecordCaseActionId, recordTestSteps: RecordTestStep[]): Promise<RecordStepAction[]> {
    const actions = [];
    let index = 0;
    for (const recordTestStep of recordTestSteps) {
      const actionStep = manager.getRepository(RecordStepAction).create({
        recordStepActionId: v4(),
        recordCaseActionId,
        recordTestStepId: recordTestStep.recordTestStepId,
        state: RECORD_PIPELINE_STATE.WAITING,
        index,
        type: recordTestStep.type,
        recordTestStepInfo: JSON.parse(JSON.stringify(recordTestStep)),
      });
      await manager.getRepository(RecordStepAction).save(actionStep);
      actions.push(actionStep);
      index++;
    }
    return actions;
  }
}
