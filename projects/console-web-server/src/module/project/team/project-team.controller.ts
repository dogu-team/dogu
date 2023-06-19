import { OrganizationPropCamel } from '@dogu-private/console';
import { OrganizationId, ProjectId, TeamId } from '@dogu-private/types';
import { Body, Controller, Delete, Inject, Param, Patch, Post } from '@nestjs/common';

import { PROJECT_ROLE } from '../../auth/auth.types';
import { ProjectPermission } from '../../auth/decorators';

import { AddTeamToProjectDto, UpdateTeamProjectRoleDto } from './dto/project-team.dto';
import { ProjectTeamService } from './project-team.service';

@Controller('organizations/:organizationId/projects')
export class ProjectTeamController {
  constructor(
    @Inject(ProjectTeamService)
    private projectTeamService: ProjectTeamService, //
  ) {}

  @Post('/:projectId/teams')
  @ProjectPermission(PROJECT_ROLE.ADMIN)
  async AddTeamToProject(
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId, //
    @Param('projectId') projectId: ProjectId,
    @Body() dto: AddTeamToProjectDto,
  ): Promise<void> {
    await this.projectTeamService.addTeamToProject(organizationId, projectId, dto);
  }

  @Patch('/:projectId/teams/:teamId/role')
  @ProjectPermission(PROJECT_ROLE.ADMIN)
  async updateTeamProjectRole(
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId, //
    @Param('projectId') projectId: ProjectId,
    @Param('teamId') teamId: TeamId,
    @Body() dto: UpdateTeamProjectRoleDto,
  ): Promise<void> {
    await this.projectTeamService.updateTeamProjectRole(organizationId, projectId, teamId, dto);
  }

  @Delete('/:projectId/teams/:teamId')
  @ProjectPermission(PROJECT_ROLE.ADMIN)
  async softRemoveTeamFromProject(
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId, //
    @Param('projectId') projectId: ProjectId,
    @Param('teamId') teamId: TeamId,
  ): Promise<void> {
    await this.projectTeamService.softRemoveTeamFromProject(organizationId, projectId, teamId);
  }
}
