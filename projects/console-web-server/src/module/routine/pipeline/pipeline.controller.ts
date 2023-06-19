import { JobDisplayQuery, JobElement, OrganizationPropCamel, RoutineJobBase, RoutinePipelineBase, RoutineStepBase } from '@dogu-private/console';
import { OrganizationId, ProjectId, RoutineDeviceJobId, RoutineJobId, RoutinePipelineId, UserPayload } from '@dogu-private/types';
import { Body, Controller, Get, Inject, Param, Post, Query } from '@nestjs/common';
import { PROJECT_ROLE } from '../../auth/auth.types';
import { ProjectPermission, User } from '../../auth/decorators';
import { Page } from '../../common/dto/pagination/page';
import { CancelPipelineEvent, CanclePipelineQueue } from '../../event/pipeline/update-pipeline-queue';
import { CreateInstantPipelineDto, FindAllPipelinesDto } from './dto/pipeline.dto';
import { PipelineService } from './pipeline.service';

@Controller('organizations/:organizationId/projects/:projectId/pipelines')
export class PipelineController {
  constructor(
    @Inject(PipelineService)
    private pipelineService: PipelineService,
    @Inject(CanclePipelineQueue)
    private readonly cancelPipelineQueue: CanclePipelineQueue,
  ) {}

  @Get('')
  @ProjectPermission(PROJECT_ROLE.READ)
  async findAllPipelines(
    @User() user: UserPayload,
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId,
    @Param('projectId') projectId: ProjectId,
    @Query() dto: FindAllPipelinesDto,
  ): Promise<Page<RoutinePipelineBase>> {
    const result = await this.pipelineService.findAllPipelines(organizationId, projectId, dto);
    return result;
  }

  @Get(':pipelineId')
  @ProjectPermission(PROJECT_ROLE.READ)
  async findPipelineById(
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId,
    @Param('projectId') projectId: ProjectId,
    @Param('pipelineId') pipelineId: RoutinePipelineId,
  ): Promise<RoutinePipelineBase> {
    const result = await this.pipelineService.findPipelineById(organizationId, projectId, pipelineId);
    return result;
  }

  @Get(':pipelineId/jobs')
  @ProjectPermission(PROJECT_ROLE.READ)
  async findAllPipelineJobs(
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId,
    @Param('projectId') projectId: ProjectId,
    @Param('pipelineId') pipelineId: RoutinePipelineId,
    @Query('display') display?: JobDisplayQuery,
  ): Promise<JobElement[] | RoutineJobBase[]> {
    const result = await this.pipelineService.findAllPipelineJobs(organizationId, projectId, pipelineId, display);
    return result;
  }

  @Get(':pipelineId/jobs/:jobId')
  @ProjectPermission(PROJECT_ROLE.READ)
  async findPipelineJobById(
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId,
    @Param('projectId') projectId: ProjectId,
    @Param('pipelineId') pipelineId: RoutinePipelineId,
    @Param('jobId') jobId: RoutineJobId,
  ): Promise<RoutineJobBase> {
    const result = await this.pipelineService.findPipelineJobById(organizationId, projectId, pipelineId, jobId);
    return result;
  }

  @Get(':pipelineId/jobs/:jobId/device-jobs/:deviceJobId/steps')
  @ProjectPermission(PROJECT_ROLE.READ)
  async findAllDeviceJobSteps(
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId,
    @Param('projectId') projectId: ProjectId,
    @Param('pipelineId') pipelineId: RoutinePipelineId,
    @Param('jobId') jobId: RoutineJobId,
    @Param('deviceJobId') deviceJobId: RoutineDeviceJobId,
  ): Promise<RoutineStepBase[]> {
    const result = await this.pipelineService.findAllDeviceJobSteps(organizationId, projectId, pipelineId, jobId, deviceJobId);
    return result;
  }

  @Post(':pipelineId/cancel')
  @ProjectPermission(PROJECT_ROLE.WRITE)
  cancelPipeline(
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId,
    @Param('projectId') projectId: ProjectId,
    @Param('pipelineId') pipelineId: RoutinePipelineId,
    @User() userPayload: UserPayload,
  ): void {
    const event: CancelPipelineEvent = new CancelPipelineEvent(organizationId, projectId, pipelineId, userPayload.userId);
    this.cancelPipelineQueue.enqueue(event);
  }

  @Post('instant')
  @ProjectPermission(PROJECT_ROLE.WRITE)
  async createInstantPipeline(
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId,
    @Param('projectId') projectId: ProjectId,
    @User() userPayload: UserPayload,
    @Body() dto: CreateInstantPipelineDto,
  ): Promise<RoutinePipelineBase> {
    const rv = await this.pipelineService.createInstantPipelineDatas(organizationId, projectId, userPayload.userId, dto);
    return rv;
  }
}
