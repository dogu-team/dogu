import { ProjectPropCamel, RecordTestCasePropCamel, RecordTestScenarioBase, RecordTestScenarioPropCamel, RecordTestScenarioResponse } from '@dogu-private/console';
import { ProjectId, RecordTestCaseId, RecordTestScenarioId } from '@dogu-private/types';
import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Query } from '@nestjs/common';
import { PROJECT_ROLE } from '../../../../module/auth/auth.types';
import { ProjectPermission } from '../../../../module/auth/decorators';
import { Page } from '../../../../module/common/dto/pagination/page';
import { AddRecordTestCaseToRecordTestScenarioDto, FindRecordTestScenariosByProjectIdDto, UpdateRecordTestScenarioDto } from '../dto/record-test-scenario.dto';
import { RecordTestScenarioService } from './record-test-scenario.service';

@Controller('organizations/:organizationId/projects/:projectId/record-test-scenarios')
export class RecordTestScenarioController {
  constructor(
    @Inject(RecordTestScenarioService)
    private readonly recordTestScenarioService: RecordTestScenarioService,
  ) {}

  @Get()
  @ProjectPermission(PROJECT_ROLE.READ)
  async findRecordTestScenarioByProjectId(
    @Param(ProjectPropCamel.projectId) projectId: ProjectId,
    @Query() dto: FindRecordTestScenariosByProjectIdDto,
  ): Promise<Page<RecordTestScenarioBase>> {
    const rv = await this.recordTestScenarioService.findRecordTestScenarioByProjectId(projectId, dto);
    return rv;
  }

  @Get(`:${RecordTestScenarioPropCamel.recordTestScenarioId}`)
  @ProjectPermission(PROJECT_ROLE.READ)
  async findRecordTestScenarioById(
    @Param(ProjectPropCamel.projectId) projectId: ProjectId,
    @Param(RecordTestScenarioPropCamel.recordTestScenarioId) recordTestScenarioId: RecordTestScenarioId,
  ): Promise<RecordTestScenarioResponse> {
    const rv = await this.recordTestScenarioService.findRecordTestScenarioById(projectId, recordTestScenarioId);
    return rv;
  }

  @Patch(`:${RecordTestScenarioPropCamel.recordTestScenarioId}`)
  @ProjectPermission(PROJECT_ROLE.WRITE)
  async updateRecordTestScenario(
    @Param(ProjectPropCamel.projectId) projectId: ProjectId,
    @Param(RecordTestScenarioPropCamel.recordTestScenarioId) recordTestScenarioId: RecordTestScenarioId,
    @Body() dto: UpdateRecordTestScenarioDto,
  ): Promise<RecordTestScenarioBase> {
    const rv = await this.recordTestScenarioService.updateRecordTestScenario(projectId, recordTestScenarioId, dto);
    return rv;
  }

  @Post(`:${RecordTestScenarioPropCamel.recordTestScenarioId}/record-test-cases`)
  @ProjectPermission(PROJECT_ROLE.WRITE)
  async AddRecordTestCaseToScenario(
    @Param(ProjectPropCamel.projectId) projectId: ProjectId,
    @Param(RecordTestScenarioPropCamel.recordTestScenarioId) recordTestScenarioId: RecordTestScenarioId,
    @Body() dto: AddRecordTestCaseToRecordTestScenarioDto,
  ): Promise<void> {
    const rv = await this.recordTestScenarioService.addRecordTestCaseToRecordTestScenario(projectId, recordTestScenarioId, dto);
    return rv;
  }

  @Delete(`:${RecordTestScenarioPropCamel.recordTestScenarioId}/record-test-cases/:recordTestCaseId`)
  @ProjectPermission(PROJECT_ROLE.WRITE)
  async removeRecordTestCaseFromScenario(
    @Param(ProjectPropCamel.projectId) projectId: ProjectId,
    @Param(RecordTestScenarioPropCamel.recordTestScenarioId) recordTestScenarioId: RecordTestScenarioId,
    @Param(RecordTestCasePropCamel.recordTestCaseId) recordTestCaseId: RecordTestCaseId,
  ): Promise<void> {
    const rv = await this.recordTestScenarioService.removeRecordTestCaseFromRecordTestScenario(projectId, recordTestScenarioId, recordTestCaseId);
    return rv;
  }

  @Post()
  @ProjectPermission(PROJECT_ROLE.WRITE)
  async createRecordTestScenario(
    @Param(ProjectPropCamel.projectId) projectId: ProjectId, //
    @Body() dto: UpdateRecordTestScenarioDto,
  ): Promise<RecordTestScenarioBase> {
    const rv = await this.recordTestScenarioService.createRecordTestScenario(projectId, dto);
    return rv;
  }

  @Delete(`:${RecordTestScenarioPropCamel.recordTestScenarioId}`)
  @ProjectPermission(PROJECT_ROLE.WRITE)
  async deleteRecordTestScenario(
    @Param(ProjectPropCamel.projectId) projectId: ProjectId, //
    @Param(RecordTestScenarioPropCamel.recordTestScenarioId) recordTestScenarioId: RecordTestScenarioId,
  ): Promise<void> {
    await this.recordTestScenarioService.deleteRecordTestScenario(projectId, recordTestScenarioId);
  }
}