import { ProjectPropCamel, RecordPipelineBase, RecordTestScenarioPropCamel } from '@dogu-private/console';
import { CREATOR_TYPE, ProjectId, RecordTestScenarioId, UserPayload } from '@dogu-private/types';
import { Controller, Delete, Inject, Param, Post } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PROJECT_ROLE } from '../../../../module/auth/auth.types';
import { ProjectPermission, User } from '../../../../module/auth/decorators';
import { RecordPipelineService } from './record-test-pipeline.service';

@Controller('organizations/:organizationId/projects/:projectId/record-test-scenarios/:recordTestScenarioId/record-pipelines')
export class RecordPipelineController {
  constructor(
    @Inject(RecordPipelineService)
    private readonly recordPipelineService: RecordPipelineService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  @Post()
  // @ProjectPermission(PROJECT_ROLE.WRITE)
  async createRecordPipeline(
    @Param(ProjectPropCamel.projectId) projectId: ProjectId, //
    @Param(RecordTestScenarioPropCamel.recordTestScenarioId) recordTestScenarioId: RecordTestScenarioId,
    @User() userPayload: UserPayload,
  ): Promise<RecordPipelineBase> {
    const rv = await this.recordPipelineService.createRecordPipelineData(projectId, recordTestScenarioId, null, CREATOR_TYPE.USER);
    return rv;
  }

  @Delete(`:${RecordTestScenarioPropCamel.recordTestScenarioId}`)
  @ProjectPermission(PROJECT_ROLE.WRITE)
  async softDeleteRecordTestScenario(
    @Param(ProjectPropCamel.projectId) projectId: ProjectId, //
    @Param(RecordTestScenarioPropCamel.recordTestScenarioId) recordTestScenarioId: RecordTestScenarioId,
  ): Promise<void> {
    return;
  }
}
