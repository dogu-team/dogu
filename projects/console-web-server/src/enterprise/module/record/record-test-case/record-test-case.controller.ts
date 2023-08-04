import { ProjectPropCamel, RecordTestCaseBase, RecordTestCasePropCamel, RecordTestCaseResponse, RecordTestStepPropCamel } from '@dogu-private/console';
import { ProjectId, RecordTestCaseId, RecordTestStepId } from '@dogu-private/types';
import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Query } from '@nestjs/common';
import { PROJECT_ROLE } from '../../../../module/auth/auth.types';
import { ProjectPermission } from '../../../../module/auth/decorators';
import { Page } from '../../../../module/common/dto/pagination/page';
import { AddRecordTestStepToRecordTestCaseDto, CreateRecordTestCaseDto, FindRecordTestCaseByProjectIdDto, UpdateRecordTestCaseDto } from '../dto/record-test-case.dto';
import { RecordTestCaseService } from './record-test-case.service';

@Controller('organizations/:organizationId/projects/:projectId/record-test-cases')
export class RecordTestCaseController {
  constructor(
    @Inject(RecordTestCaseService)
    private readonly recordTestCaseService: RecordTestCaseService,
  ) {}

  @Get()
  @ProjectPermission(PROJECT_ROLE.READ)
  async findRecordTestCaseByProjectId(@Param(ProjectPropCamel.projectId) projectId: ProjectId, @Query() dto: FindRecordTestCaseByProjectIdDto): Promise<Page<RecordTestCaseBase>> {
    const rv = await this.recordTestCaseService.findRecordTestCasesByProjectId(projectId, dto);
    return rv;
  }

  @Get(`:${RecordTestCasePropCamel.recordTestCaseId}`)
  @ProjectPermission(PROJECT_ROLE.READ)
  async findRecordTestCaseById(
    @Param(ProjectPropCamel.projectId) projectId: ProjectId,
    @Param(RecordTestCasePropCamel.recordTestCaseId) recordTestCaseId: RecordTestCaseId,
  ): Promise<RecordTestCaseResponse> {
    const rv = await this.recordTestCaseService.findRecordTestCaseById(projectId, recordTestCaseId);
    return rv;
  }

  @Patch(`:${RecordTestCasePropCamel.recordTestCaseId}`)
  @ProjectPermission(PROJECT_ROLE.WRITE)
  async updateRecordTestCase(
    @Param(ProjectPropCamel.projectId) projectId: ProjectId,
    @Param(RecordTestCasePropCamel.recordTestCaseId) recordTestCaseId: RecordTestCaseId,
    @Body() dto: UpdateRecordTestCaseDto,
  ): Promise<RecordTestCaseBase> {
    const rv = await this.recordTestCaseService.updateRecordTestCase(projectId, recordTestCaseId, dto);
    return rv;
  }

  @Post()
  @ProjectPermission(PROJECT_ROLE.WRITE)
  async createRecordTestCase(@Param(ProjectPropCamel.projectId) projectId: ProjectId, @Body() dto: CreateRecordTestCaseDto): Promise<RecordTestCaseBase> {
    const rv = await this.recordTestCaseService.createRecordTestCase(projectId, dto);
    return rv;
  }

  @Delete(`:${RecordTestCasePropCamel.recordTestCaseId}`)
  @ProjectPermission(PROJECT_ROLE.WRITE)
  async deleteRecordTestCase(
    @Param(ProjectPropCamel.projectId) projectId: ProjectId,
    @Param(RecordTestCasePropCamel.recordTestCaseId) recordTestCaseId: RecordTestCaseId,
  ): Promise<void> {
    await this.recordTestCaseService.deleteRecordTestCase(projectId, recordTestCaseId);
  }

  @Post(`:${RecordTestCasePropCamel.recordTestCaseId}/record-test-steps`)
  @ProjectPermission(PROJECT_ROLE.WRITE)
  async addRecordTestStepToRecordTestCase(
    @Param(ProjectPropCamel.projectId) projectId: ProjectId,
    @Param(RecordTestCasePropCamel.recordTestCaseId) recordTestCaseId: RecordTestCaseId,
    @Body() dto: AddRecordTestStepToRecordTestCaseDto,
  ): Promise<void> {
    await this.recordTestCaseService.addRecordTestStepToRecordTestCase(projectId, recordTestCaseId, dto);
  }

  @Delete(`:${RecordTestCasePropCamel.recordTestCaseId}/record-test-steps/:recordTestStepId`)
  @ProjectPermission(PROJECT_ROLE.WRITE)
  async removeRecordTestStepFromRecordTestCase(
    @Param(ProjectPropCamel.projectId) projectId: ProjectId,
    @Param(RecordTestCasePropCamel.recordTestCaseId) recordTestCaseId: RecordTestCaseId,
    @Param(RecordTestStepPropCamel.recordTestStepId) recordTestStepId: RecordTestStepId,
  ): Promise<void> {
    await this.recordTestCaseService.removeRecordTestStepFromRecordTestCase(projectId, recordTestCaseId, recordTestStepId);
  }
}
