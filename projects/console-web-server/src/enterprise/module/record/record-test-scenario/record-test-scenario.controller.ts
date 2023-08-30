import { ProjectPropCamel, RecordTestScenarioBase, RecordTestScenarioPropCamel, RecordTestScenarioResponse } from '@dogu-private/console';
import { ProjectId, RecordTestScenarioId } from '@dogu-private/types';
import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Query } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PROJECT_ROLE } from '../../../../module/auth/auth.types';
import { ProjectPermission } from '../../../../module/auth/decorators';
import { Page } from '../../../../module/common/dto/pagination/page';
import { CreateRecordTestScenarioDto, FindRecordTestScenariosByProjectIdDto, UpdateRecordTestScenarioDto } from '../dto/record-test-scenario.dto';
import { RecordTestScenarioService } from './record-test-scenario.service';

@Controller('organizations/:organizationId/projects/:projectId/record-test-scenarios')
export class RecordTestScenarioController {
  constructor(
    @Inject(RecordTestScenarioService)
    private readonly recordTestScenarioService: RecordTestScenarioService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
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

  // @Post(`:${RecordTestScenarioPropCamel.recordTestScenarioId}/record-test-cases`)
  // @ProjectPermission(PROJECT_ROLE.WRITE)
  // async attachRecordTestCaseToScenario(
  //   @Param(ProjectPropCamel.projectId) projectId: ProjectId,
  //   @Param(RecordTestScenarioPropCamel.recordTestScenarioId) recordTestScenarioId: RecordTestScenarioId,
  //   @Body() dto: AddRecordTestCaseToRecordTestScenarioDto,
  // ): Promise<void> {
  //   const rv = await this.recordTestScenarioService.attachRecordTestCaseToScenario(projectId, recordTestScenarioId, dto);
  //   return rv;
  // }

  // @Delete(`:${RecordTestScenarioPropCamel.recordTestScenarioId}/record-test-cases/:recordTestCaseId`)
  // @ProjectPermission(PROJECT_ROLE.WRITE)
  // async detachRecordTestCaseFromScenario(
  //   @Param(ProjectPropCamel.projectId) projectId: ProjectId,
  //   @Param(RecordTestScenarioPropCamel.recordTestScenarioId) recordTestScenarioId: RecordTestScenarioId,
  //   @Param(RecordTestCasePropCamel.recordTestCaseId) recordTestCaseId: RecordTestCaseId,
  // ): Promise<void> {
  //   await this.recordTestScenarioService.detachRecordTestCaseFromScenario(projectId, recordTestScenarioId, recordTestCaseId);
  // }

  @Post()
  // @ProjectPermission(PROJECT_ROLE.WRITE)
  async createRecordTestScenario(
    @Param(ProjectPropCamel.projectId) projectId: ProjectId, //
    @Body() dto: CreateRecordTestScenarioDto,
  ): Promise<RecordTestScenarioBase> {
    const rv = await this.recordTestScenarioService.createRecordTestScenario(projectId, dto);
    return rv;
  }

  @Delete(`:${RecordTestScenarioPropCamel.recordTestScenarioId}`)
  @ProjectPermission(PROJECT_ROLE.WRITE)
  async softDeleteRecordTestScenario(
    @Param(ProjectPropCamel.projectId) projectId: ProjectId, //
    @Param(RecordTestScenarioPropCamel.recordTestScenarioId) recordTestScenarioId: RecordTestScenarioId,
  ): Promise<void> {
    await this.dataSource.manager.transaction(async (manager) => {
      await this.recordTestScenarioService.softDeleteRecordTestScenario(manager, projectId, recordTestScenarioId);
    });
  }
}
