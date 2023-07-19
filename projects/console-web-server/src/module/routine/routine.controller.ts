import { OrganizationPropCamel, RoutineBase } from '@dogu-private/console';
import { CREATOR_TYPE, OrganizationId, ProjectId, RoutineId, UserPayload } from '@dogu-private/types';
import { Controller, Delete, Get, Inject, Param, Patch, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Routine } from '../../db/entity/routine.entity';
import { PROJECT_ROLE } from '../../module/auth/auth.types';
import { ProjectPermission, User } from '../../module/auth/decorators';
import { routineParser } from '../../utils/file';
import { PipelineService } from '../routine/pipeline/pipeline.service';
import { RoutineService } from './routine.service';

@Controller('organizations/:organizationId/projects/:projectId/routines')
export class RoutineController {
  constructor(
    @Inject(RoutineService)
    private routineService: RoutineService, //
    @Inject(PipelineService)
    private pipelineService: PipelineService,
  ) {}

  @Get('file/:routineId')
  @ProjectPermission(PROJECT_ROLE.READ)
  async readRoutineFile(
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId,
    @Param('projectId') projectId: ProjectId,
    @Param('routineId') routineId: RoutineId,
  ): Promise<string> {
    return await this.routineService.readRoutine(organizationId, projectId, routineId);
  }

  @Post('')
  @ProjectPermission(PROJECT_ROLE.WRITE)
  @UseInterceptors(FileInterceptor('file'))
  async createRoutine(
    @User() userPayload: UserPayload,
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId,
    @Param('projectId') projectId: ProjectId,
    @UploadedFile(routineParser) file: Express.Multer.File,
  ): Promise<RoutineBase> {
    return await this.routineService.createRoutine(userPayload, organizationId, projectId, file);
  }

  @Get('')
  @ProjectPermission(PROJECT_ROLE.READ)
  async findAllRoutinesByProjectId(
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId,
    @Param('projectId') projectId: ProjectId,
    @Query('name') name?: string,
  ): Promise<Routine[]> {
    return await this.routineService.findAllRoutinesByProjectId(organizationId, projectId, name);
  }

  @Get(':routineId')
  @ProjectPermission(PROJECT_ROLE.READ)
  async findRoutineById(
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId,
    @Param('projectId') projectId: ProjectId,
    @Param('routineId') routineId: RoutineId,
  ): Promise<Routine> {
    return await this.routineService.findRoutineById(organizationId, projectId, routineId);
  }

  @Patch(':routineId')
  @ProjectPermission(PROJECT_ROLE.WRITE)
  @UseInterceptors(FileInterceptor('file'))
  async updateRoutine(
    @User() userPayload: UserPayload,
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId,
    @Param('projectId') projectId: ProjectId,
    @Param('routineId') routineId: RoutineId,
    @UploadedFile(routineParser) file: Express.Multer.File,
  ): Promise<void> {
    return await this.routineService.updateRoutine(userPayload, organizationId, projectId, routineId, file);
  }

  @Delete(':routineId')
  @ProjectPermission(PROJECT_ROLE.WRITE)
  async deleteRoutine(
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId,
    @Param('projectId') projectId: ProjectId,
    @Param('routineId') routineId: RoutineId,
  ): Promise<void> {
    return await this.routineService.deleteRoutine(organizationId, projectId, routineId);
  }

  @Post(':routineId/pipelines')
  @ProjectPermission(PROJECT_ROLE.WRITE)
  async createPipeline(
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId,
    @Param('projectId') projectId: ProjectId,
    @Param('routineId') routineId: RoutineId,
    @User() userPayload: UserPayload,
  ): Promise<void> {
    await this.pipelineService.createPipelineByRoutineConfig(organizationId, projectId, routineId, userPayload.userId, CREATOR_TYPE.USER);
  }
}
