import { OrganizationPropCamel, ProjectPropCamel, RecordTestCaseBase, RecordTestCasePropCamel, RecordTestCaseResponse } from '@dogu-private/console';
import { OrganizationId, ProjectId, RecordTestCaseId } from '@dogu-private/types';
import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Query } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PROJECT_ROLE } from '../../../../module/auth/auth.types';
import { ProjectPermission } from '../../../../module/auth/decorators';
import { Page } from '../../../../module/common/dto/pagination/page';
import { CreateRecordTestCaseDto, FindRecordTestCaseByProjectIdDto, NewSessionRecordTestCaseDto, UpdateRecordTestCaseDto } from '../dto/record-test-case.dto';
import { RecordTestCaseService } from './record-test-case.service';

@Controller('organizations/:organizationId/projects/:projectId/record-test-cases')
export class RecordTestCaseController {
  constructor(
    @Inject(RecordTestCaseService)
    private readonly recordTestCaseService: RecordTestCaseService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
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
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId,
    @Param(ProjectPropCamel.projectId) projectId: ProjectId,
    @Param(RecordTestCasePropCamel.recordTestCaseId) recordTestCaseId: RecordTestCaseId,
  ): Promise<RecordTestCaseResponse> {
    const rv = await this.recordTestCaseService.findRecordTestCaseById(organizationId, projectId, recordTestCaseId);
    return rv;
  }

  @Post(`:${RecordTestCasePropCamel.recordTestCaseId}/new-session`)
  @ProjectPermission(PROJECT_ROLE.WRITE)
  async newSessionRecordTestCase(
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId,
    @Param(ProjectPropCamel.projectId) projectId: ProjectId,
    @Param(RecordTestCasePropCamel.recordTestCaseId) recordTestCaseId: RecordTestCaseId,
    @Body() dto: NewSessionRecordTestCaseDto,
  ): Promise<RecordTestCaseBase> {
    const rv = await this.recordTestCaseService.newSession(this.dataSource.manager, projectId, recordTestCaseId, dto);
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

  @Get(`:${RecordTestCasePropCamel.recordTestCaseId}/keyboard`)
  @ProjectPermission(PROJECT_ROLE.WRITE)
  async getKeyboardState(
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId,
    @Param(ProjectPropCamel.projectId) projectId: ProjectId,
    @Param(RecordTestCasePropCamel.recordTestCaseId) recordTestCaseId: RecordTestCaseId,
  ): Promise<boolean> {
    const rv = await this.recordTestCaseService.getKeyboardShown(organizationId, projectId, recordTestCaseId);
    return rv;
  }

  @Post()
  @ProjectPermission(PROJECT_ROLE.WRITE)
  async createRecordTestCase(
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId,
    @Param(ProjectPropCamel.projectId) projectId: ProjectId,
    @Body() dto: CreateRecordTestCaseDto,
  ): Promise<RecordTestCaseBase> {
    const rv = await this.recordTestCaseService.createRecordTestCase(organizationId, projectId, dto);
    return rv;
  }

  @Delete(`:${RecordTestCasePropCamel.recordTestCaseId}`)
  @ProjectPermission(PROJECT_ROLE.WRITE)
  async deleteRecordTestCase(
    @Param(ProjectPropCamel.projectId) projectId: ProjectId,
    @Param(RecordTestCasePropCamel.recordTestCaseId) recordTestCaseId: RecordTestCaseId,
  ): Promise<void> {
    await this.dataSource.manager.transaction(async (manager) => {
      await this.recordTestCaseService.softRemoveRecordTestCase(manager, projectId, recordTestCaseId);
    });
  }
}
