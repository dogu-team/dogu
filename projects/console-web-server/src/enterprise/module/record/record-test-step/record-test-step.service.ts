import { RecordTestStepPropCamel, RecordTestStepPropSnake, RecordTestStepResponse } from '@dogu-private/console';
import { OrganizationId, ProjectId, RecordTestCaseId, recordTestStepActionTypeFromString, RecordTestStepId } from '@dogu-private/types';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager, IsNull } from 'typeorm';
import { v4 } from 'uuid';
import { RecordTestCase } from '../../../../db/entity/record-test-case.entity';
import { RecordTestStep } from '../../../../db/entity/record-test-step.entity';
import { ProjectFileService } from '../../../../module/file/project-file.service';
import { detechRecordTestStepFromCase, getNextRecordTestStepInCase } from '../common';
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
    recordTestCaseId: RecordTestCaseId,
    recordTestStepId: RecordTestStepId,
  ): Promise<RecordTestStepResponse> {
    const recordTestStep = await this.dataSource
      .getRepository(RecordTestStep) //
      .createQueryBuilder('recordTestStep')
      .where(`recordTestStep.${RecordTestStepPropSnake.record_test_step_id} = :${RecordTestStepPropCamel.recordTestStepId}`, { recordTestStepId })
      .andWhere(`recordTestStep.${RecordTestStepPropSnake.record_test_case_id} = :${RecordTestStepPropCamel.recordTestCaseId}`, { recordTestCaseId })
      .andWhere(`recordTestStep.${RecordTestStepPropSnake.project_id} = :${RecordTestStepPropCamel.projectId}`, { projectId })
      .getOne();

    if (!recordTestStep) {
      throw new HttpException(`RecordTestStep not found. recordTestStepId: ${recordTestStepId}`, HttpStatus.NOT_FOUND);
    }

    const screenshotUrl = await this.projectFileService.getRecordTestScreenshotUrl(organizationId, projectId, recordTestCaseId, recordTestStepId);
    const pageSourceUrl = await this.projectFileService.getRecordTestPageSourceUrl(organizationId, projectId, recordTestCaseId, recordTestStepId);
    const res: RecordTestStepResponse = {
      ...recordTestStep,
      screenshotUrl,
      pageSourceUrl,
    };

    return res;
  }

  async softDeleteRecordTestStep(manager: EntityManager, projectId: ProjectId, recordTestCaseId: RecordTestCaseId, recordTestStepId: RecordTestStepId): Promise<void> {
    const recordTestStep = await manager.getRepository(RecordTestStep).findOne({ where: { projectId, recordTestCaseId, recordTestStepId } });
    if (!recordTestStep) {
      throw new HttpException(`RecordTestStep not found. recordTestStepId: ${recordTestStepId}`, HttpStatus.NOT_FOUND);
    }

    await detechRecordTestStepFromCase(manager, projectId, recordTestCaseId, recordTestStepId);
    await manager.getRepository(RecordTestStep).softDelete({ projectId, recordTestCaseId, recordTestStepId });
  }

  public async createRecordTestStep(
    organizationId: OrganizationId,
    projectId: ProjectId, //
    recordTestCaseId: RecordTestCaseId,
    dto: CreateRecordTestStepDto,
  ): Promise<RecordTestStepResponse> {
    const id = await this.dataSource.manager.transaction(async (manager) => {
      const { prevRecordTestStepId } = dto;
      const testCase = await manager.getRepository(RecordTestCase).findOne({
        where: { projectId, recordTestCaseId },
        relations: [RecordTestStepPropCamel.device],
      });
      if (!testCase) {
        throw new HttpException(`RecordTestCase not found. recordTestCaseId: ${recordTestCaseId}`, HttpStatus.NOT_FOUND);
      }
      if (!testCase.activeDeviceId) {
        throw new HttpException(`RecordTestCase not found. recordTestCaseId: ${recordTestCaseId}`, HttpStatus.NOT_FOUND);
      }

      const device = testCase.device!;

      const recordTestStepId = v4();
      const newData = manager.getRepository(RecordTestStep).create({
        recordTestStepId,
        recordTestCaseId,
        projectId,
        prevRecordTestStepId,
        deviceId: testCase.activeDeviceId,
        deviceInfo: JSON.parse(JSON.stringify(device)),
        type: recordTestStepActionTypeFromString(dto.actionInfo.type),
      });

      if (prevRecordTestStepId) {
        const prev = await manager.getRepository(RecordTestStep).findOne({ where: { projectId, recordTestStepId: prevRecordTestStepId } });
        if (!prev) {
          throw new HttpException(`RecordTestStep not found. prevRecordTestStepId: ${prevRecordTestStepId}`, HttpStatus.NOT_FOUND);
        }
        // attach prevRecordTestStep
        const next = await getNextRecordTestStepInCase(manager, projectId, recordTestCaseId, prev);
        if (next) {
          next.prevRecordTestStepId = recordTestStepId;
          await manager.getRepository(RecordTestStep).save(next);
        }
      } else {
        // root test step
        const root = await manager.getRepository(RecordTestStep).findOne({ where: { projectId, recordTestCaseId, prevRecordTestStepId: IsNull() } });
        if (root) {
          root.prevRecordTestStepId = recordTestStepId;
          await manager.getRepository(RecordTestStep).save(root);
        }
      }
      // add action
      await this.recordTestStepActionService.addAction(manager, organizationId, projectId, newData, dto);
      return recordTestStepId;
    });

    const res = await this.findRecordTestStepById(organizationId, projectId, recordTestCaseId, id);
    return res;
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
