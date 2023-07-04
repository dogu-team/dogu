import { OrganizationPropCamel, ProjectPropCamel } from '@dogu-private/console';
import { OrganizationId } from '@dogu-private/types';
import { Body, Controller, Get, Inject, Param, Patch } from '@nestjs/common';

import { PROJECT_ROLE } from '../../auth/auth.types';
import { ProjectPermission } from '../../auth/decorators';
import { UpdateProjectGitDto } from './dto/project-git.dto';
import { ProjectGitService } from './project-git.service';

@Controller('organizations/:organizationId/projects/:projectId/git')
export class ProjectGitController {
  constructor(
    @Inject(ProjectGitService)
    private readonly projectGitService: ProjectGitService,
  ) {}

  @Get()
  @ProjectPermission(PROJECT_ROLE.READ)
  async getProjectGit(@Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId, @Param(ProjectPropCamel.projectId) projectId: string) {
    return await this.projectGitService.getProjectGit(organizationId, projectId);
  }

  @Patch()
  @ProjectPermission(PROJECT_ROLE.ADMIN)
  async updateProjectGit(
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId, //
    @Param(ProjectPropCamel.projectId) projectId: string,
    @Body() updateProjectGitDto: UpdateProjectGitDto,
  ) {
    return await this.projectGitService.updateProjectGit(organizationId, projectId, updateProjectGitDto);
  }
}
