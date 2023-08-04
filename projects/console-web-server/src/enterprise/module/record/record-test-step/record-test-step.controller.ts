import { ProjectPropCamel, RecordTestStepBase, RecordTestStepPropCamel } from '@dogu-private/console';
import { ProjectId, RecordTestCaseId, RecordTestStepId } from '@dogu-private/types';
import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Query } from '@nestjs/common';
import { PROJECT_ROLE } from '../../../../module/auth/auth.types';
import { ProjectPermission } from '../../../../module/auth/decorators';
import { Page } from '../../../../module/common/dto/pagination/page';
import { CreateRecordTestStepDto, FindRecordTestStepsByProjectIdDto, UpdateRecordTestStepDto } from '../dto/record-test-step.dto';
import { RecordTestStepService } from './record-test-step.service';

@Controller('organizations/:organizationId/projects/:projectId/record-test-steps')
export class RecordTestStepController {
  constructor(
    @Inject(RecordTestStepService)
    private readonly recordTestStepService: RecordTestStepService,
  ) {}

  @Get()
  @ProjectPermission(PROJECT_ROLE.READ)
  async findRecordTestCaseByProjectId(@Param(ProjectPropCamel.projectId) projectId: ProjectId, @Query() dto: FindRecordTestStepsByProjectIdDto): Promise<Page<RecordTestStepBase>> {
    const rv = await this.recordTestStepService.findRecordTestStepsByProjectId(projectId, dto);
    return rv;
  }

  @Get(`:${RecordTestStepPropCamel.recordTestStepId}`)
  @ProjectPermission(PROJECT_ROLE.READ)
  async findRecordTestCaseById(
    @Param(ProjectPropCamel.projectId) projectId: ProjectId,
    @Param(RecordTestStepPropCamel.recordTestStepId) recordTestStepId: RecordTestStepId,
  ): Promise<RecordTestStepBase> {
    const rv = await this.recordTestStepService.findRecordTestStepById(projectId, recordTestStepId);
    return rv;
  }

  @Patch(`:${RecordTestStepPropCamel.recordTestStepId}`)
  @ProjectPermission(PROJECT_ROLE.WRITE)
  async updateRecordTestCase(
    @Param(ProjectPropCamel.projectId) projectId: ProjectId,
    @Param(RecordTestStepPropCamel.recordTestStepId) recordTestStepId: RecordTestCaseId,
    @Body() dto: UpdateRecordTestStepDto,
  ): Promise<RecordTestStepBase> {
    const rv = await this.recordTestStepService.updateRecordTestStep(projectId, recordTestStepId, dto);
    return rv;
  }

  @Post()
  @ProjectPermission(PROJECT_ROLE.WRITE)
  async createRecordTestCase(@Param(ProjectPropCamel.projectId) projectId: ProjectId, @Body() dto: CreateRecordTestStepDto): Promise<RecordTestStepBase> {
    const rv = await this.recordTestStepService.createRecordTestStep(projectId, dto);
    return rv;
  }

  @Delete(`:${RecordTestStepPropCamel.recordTestStepId}`)
  @ProjectPermission(PROJECT_ROLE.WRITE)
  async deleteRecordTestCase(
    @Param(ProjectPropCamel.projectId) projectId: ProjectId,
    @Param(RecordTestStepPropCamel.recordTestStepId) recordTestStepId: RecordTestCaseId,
  ): Promise<void> {
    await this.recordTestStepService.deleteRecordTestStep(projectId, recordTestStepId);
  }
}
