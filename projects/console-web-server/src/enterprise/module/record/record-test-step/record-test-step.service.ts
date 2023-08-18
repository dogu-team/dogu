import { RecordTestStepPropCamel, RecordTestStepPropSnake, RecordTestStepResponse } from '@dogu-private/console';
import { OrganizationId, ProjectId, RecordTestCaseId, recordTestStepActionTypeFromString, RecordTestStepId, RECORD_TEST_STEP_ACTION_TYPE } from '@dogu-private/types';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager, IsNull } from 'typeorm';
import { v4 } from 'uuid';
import { RecordTestCase } from '../../../../db/entity/record-test-case.entity';
import { RecordTestStepActionWebdriverClick } from '../../../../db/entity/record-test-step-action-webdriver-click.entity';
import { RecordTestStep } from '../../../../db/entity/record-test-step.entity';
import { ProjectFileService } from '../../../../module/file/project-file.service';
import { CreateRecordTestStepDto } from '../dto/record-test-step.dto';
import { RecordTestStepActionService } from '../record-test-action/record-test-step-action.service';

@Injectable()
export class RecordTestStepService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @Inject(RecordTestStepActionService)
    private readonly recordTestStepActionService: RecordTestStepActionService, // private readonly logger: DoguLogger,
    @Inject(ProjectFileService)
    private readonly projectFileService: ProjectFileService,
  ) {}

  async findRecordTestStepById(
    organizationId: OrganizationId,
    projectId: ProjectId,
    recordTestCaseId: RecordTestStepId,
    recordTestStepId: RecordTestStepId,
  ): Promise<RecordTestStepResponse> {
    const recordTestStep = await this.dataSource
      .getRepository(RecordTestStep) //
      .createQueryBuilder('recordTestStep')
      // .leftJoinAndSelect(`recordTestStep.${RecordTestStepPropCamel.recordTestStepActions}`, 'recordTestStepAction')
      .where(`recordTestStep.${RecordTestStepPropSnake.record_test_step_id} = :${RecordTestStepPropCamel.recordTestStepId}`, { recordTestStepId })
      .andWhere(`recordTestStep.${RecordTestStepPropSnake.record_test_case_id} = :${RecordTestStepPropCamel.recordTestCaseId}`, { recordTestCaseId })
      .andWhere(`recordTestStep.${RecordTestStepPropSnake.project_id} = :${RecordTestStepPropCamel.projectId}`, { projectId })
      .getOne();

    if (!recordTestStep) {
      throw new HttpException(`RecordTestStep not found. recordTestStepId: ${recordTestStepId}`, HttpStatus.NOT_FOUND);
    }

    let action = null;
    switch (recordTestStep.type) {
      case RECORD_TEST_STEP_ACTION_TYPE.WEBDRIVER_CLICK:
        action = await this.dataSource.getRepository(RecordTestStepActionWebdriverClick).findOne({
          where: { recordTestStepId: recordTestStep.recordTestStepId },
        });
        break;
      case RECORD_TEST_STEP_ACTION_TYPE.WEBDRIVER_INPUT:
        break;
      case RECORD_TEST_STEP_ACTION_TYPE.UNSPECIFIED:
        break;
      default:
        const _exhaustiveCheck: never = recordTestStep.type;
        throw new HttpException(`RecordTestStep type is invalid. type: ${recordTestStep.type}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    if (!action) {
      throw new HttpException(`RecordTestStepAction not found. recordTestStepId: ${recordTestStepId}`, HttpStatus.NOT_FOUND);
    }
    recordTestStep.recordTestStepAction = action;

    const screenshotUrl = await this.projectFileService.getRecordTestScreenshotUrl(organizationId, projectId, recordTestCaseId, recordTestStepId);
    const pageSourceUrl = await this.projectFileService.getRecordTestPageSourceUrl(organizationId, projectId, recordTestCaseId, recordTestStepId);
    const res: RecordTestStepResponse = {
      ...recordTestStep,
      screenshotUrl,
      pageSourceUrl,
    };

    return res;
  }

  async deleteRecordTestStep(projectId: ProjectId, recordTestCaseId: RecordTestCaseId, recordTestStepId: RecordTestStepId): Promise<void> {
    // const testStep = await this.dataSource.getRepository(RecordTestStep).findOne({ where: { projectId, recordTestCaseId, recordTestStepId } });
    // if (!testStep) {
    //   throw new HttpException(`RecordTestStep not found. recordTestStepId: ${recordTestStepId}`, HttpStatus.NOT_FOUND);
    // }
    // // FIXME: join data
    // await this.dataSource.getRepository(RecordTestStep).softRemove(testStep);
  }

  public async createRecordTestStep(
    organizationId: OrganizationId,
    projectId: ProjectId, //
    recordTestCaseId: RecordTestCaseId,
    dto: CreateRecordTestStepDto,
  ): Promise<RecordTestStepResponse> {
    const rv = await this.dataSource.manager.transaction(async (manager) => {
      const { prevRecordTestStepId } = dto;
      const testCase = await manager.getRepository(RecordTestCase).findOne({
        where: { projectId, recordTestCaseId }, //
      });
      if (!testCase) {
        throw new HttpException(`RecordTestCase not found. recordTestCaseId: ${recordTestCaseId}`, HttpStatus.NOT_FOUND);
      }
      if (!testCase.activeDeviceSerial) {
        throw new HttpException(`RecordTestCase not found. recordTestCaseId: ${recordTestCaseId}`, HttpStatus.NOT_FOUND);
      }

      // create recordTestStep
      const recordTestStepId = v4();
      const newData = manager.getRepository(RecordTestStep).create({
        recordTestStepId,
        recordTestCaseId,
        projectId,
        prevRecordTestStepId,
        deviceSerial: testCase.activeDeviceSerial,
        type: recordTestStepActionTypeFromString(dto.actionInfo.type),
      });

      let testStep: RecordTestStep;
      if (prevRecordTestStepId) {
        const prev = await manager.getRepository(RecordTestStep).findOne({ where: { projectId, recordTestStepId: prevRecordTestStepId } });
        if (!prev) {
          throw new HttpException(`RecordTestStep not found. prevRecordTestStepId: ${prevRecordTestStepId}`, HttpStatus.NOT_FOUND);
        }
        // attech prevRecordTestStep
        const next = await this.getNextRecordTestStep(manager, projectId, recordTestCaseId, prev);
        testStep = await manager.getRepository(RecordTestStep).save(newData);
        if (next) {
          next.prevRecordTestStepId = recordTestStepId;
          await manager.getRepository(RecordTestStep).save(next);
        }
      } else {
        // root test step
        const root = await manager.getRepository(RecordTestStep).findOne({ where: { projectId, recordTestCaseId, prevRecordTestStepId: IsNull() } });
        testStep = await manager.getRepository(RecordTestStep).save(newData);
        if (root) {
          root.prevRecordTestStepId = recordTestStepId;
          await manager.getRepository(RecordTestStep).save(root);
        }
      }
      // add action
      await this.recordTestStepActionService.addAction(manager, organizationId, projectId, newData, dto);
      return newData;
    });

    const res = await this.findRecordTestStepById(organizationId, projectId, recordTestCaseId, rv.recordTestStepId);
    return res;
  }

  async removeRecordTestStepFromRecordTestCase(
    manager: EntityManager,
    projectId: ProjectId,
    recordTestCaseId: RecordTestCaseId,
    recordTestStepId: RecordTestCaseId,
  ): Promise<void> {
    const testStep = await manager.getRepository(RecordTestStep).findOne({ where: { projectId, recordTestCaseId, recordTestStepId } });
    if (!testStep) {
      throw new HttpException(`RecordTestStep not found. recordTestStepId: ${recordTestStepId}`, HttpStatus.NOT_FOUND);
    }
    const next = await this.getNextRecordTestStep(manager, projectId, recordTestCaseId, testStep);
    if (!next) {
      // FIXME: (felix) remove join table
      // await manager.getRepository(RecordTestStep).softDelete({ recordTestCaseId, recordTestStepId });
      // deleteRecordTestStep
      return;
    }

    const prev = await this.getPrevRecordTestStep(manager, projectId, recordTestCaseId, testStep);
    if (prev) {
      await manager.getRepository(RecordTestStep).update({ projectId, recordTestCaseId, recordTestStepId: next.recordTestStepId }, { prevRecordTestStepId: prev.recordTestStepId });
    } else {
      await manager.getRepository(RecordTestStep).update({ projectId, recordTestCaseId, recordTestStepId: next.recordTestStepId }, { prevRecordTestStepId: null });
    }

    // FIXME: (felix) remove join table
    // await manager.getRepository(RecordTestStep).softDelete({ projectId, recordTestCaseId, recordTestStepId });
    return;
  }

  private async getNextRecordTestStep(
    manager: EntityManager, //
    projectId: ProjectId,
    recordTestCaseId: RecordTestCaseId,
    recordTestStep: RecordTestStep,
  ): Promise<RecordTestStep | null> {
    const next = await manager.getRepository(RecordTestStep).findOne({ where: { projectId, recordTestCaseId, prevRecordTestStepId: recordTestStep.recordTestStepId } });
    if (!next) {
      return null;
    }
    return next;
  }

  private async getPrevRecordTestStep(
    manager: EntityManager, //
    projectId: ProjectId,
    recordTestCaseId: RecordTestCaseId,
    recordTestStep: RecordTestStep,
  ): Promise<RecordTestStep | null> {
    if (!recordTestStep.prevRecordTestStepId) {
      return null;
    }
    const prev = await manager.getRepository(RecordTestStep).findOne({ where: { projectId, recordTestCaseId, recordTestStepId: recordTestStep.prevRecordTestStepId } });
    if (!prev) {
      throw new HttpException(
        `PrevRecordTestStep not found. recordTestStepId: ${recordTestStep.recordTestStepId}, prevRecordTestStepId: ${recordTestStep.prevRecordTestStepId}`,
        HttpStatus.NOT_FOUND,
      );
    }
    return prev;
  }

  public async getRecordTestStepScreenshotUrl(
    organizationId: OrganizationId, //
    projectId: ProjectId,
    recordTestCaseId: RecordTestCaseId,
    recordTestStepId: RecordTestStepId,
  ) {
    const url = await this.projectFileService.getRecordTestScreenshotUrl(organizationId, projectId, recordTestCaseId, recordTestStepId);
    return url;
  }

  public async getRecordTestStepPageSourceUrl(
    organizationId: OrganizationId, //
    projectId: ProjectId,
    recordTestCaseId: RecordTestCaseId,
    recordTestStepId: RecordTestStepId,
  ) {
    const url = await this.projectFileService.getRecordTestPageSourceUrl(organizationId, projectId, recordTestCaseId, recordTestStepId);
    return url;
  }
}
