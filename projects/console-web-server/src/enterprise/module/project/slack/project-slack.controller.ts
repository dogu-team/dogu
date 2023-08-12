import { UpdateProjectSlackRemoteDtoBase, UpdateProjectSlackRoutineDtoBase } from '@dogu-private/console';
import { ProjectId, RoutineId } from '@dogu-private/types';
import { Body, Controller, Get, Inject, Param, Put } from '@nestjs/common';
import { PROJECT_ROLE } from '../../../../module/auth/auth.types';
import { ProjectPermission } from '../../../../module/auth/decorators';
import { ProjectSlackService } from './project-slack.service';

@Controller('organizations/:organizationId/projects/:projectId/slack')
export class ProjectSlackController {
  constructor(
    @Inject(ProjectSlackService)
    private readonly projectSlackService: ProjectSlackService,
  ) {}

  @Get('remote')
  @ProjectPermission(PROJECT_ROLE.READ)
  async getProjectSlackRemote(@Param('projectId') projectId: ProjectId) {
    return await this.projectSlackService.getProjectSlackRemote(projectId);
  }

  @Get('routine/:routineId')
  @ProjectPermission(PROJECT_ROLE.READ)
  async getProjectSlackRoutine(@Param('projectId') projectId: ProjectId, @Param('routineId') routineId: RoutineId) {
    return await this.projectSlackService.getProjectSlackRoutine(projectId, routineId);
  }

  @Put('remote')
  @ProjectPermission(PROJECT_ROLE.READ)
  async updateProjectSlackRemote(@Param('projectId') projectId: ProjectId, @Body() dto: UpdateProjectSlackRemoteDtoBase) {
    return await this.projectSlackService.updateProjectSlackRemote(projectId, dto);
  }

  @Put('routine')
  @ProjectPermission(PROJECT_ROLE.READ)
  async updateProjectSlackRoutine(@Param('projectId') projectId: ProjectId, @Body() dto: UpdateProjectSlackRoutineDtoBase) {
    return await this.projectSlackService.updateProjectSlackRoutine(projectId, dto);
  }
}
