import { OrganizationPropCamel, ProjectPropCamel } from '@dogu-private/console';
import { OrganizationId } from '@dogu-private/types';
import { Body, Controller, Get, Inject, Param, Patch } from '@nestjs/common';
import { ProjectScm } from '../../../db/entity/project-scm.entity';
import { PROJECT_ROLE } from '../../auth/auth.types';
import { ProjectPermission } from '../../auth/decorators';
import { UpdateProjectGitDto } from './dto/project-scm.dto';
// import { ProjectGitService } from './project-git.service';
import { ProjectScmService } from './project-scm.service';

@Controller('organizations/:organizationId/projects/:projectId/scm')
export class ProjectScmController {
  constructor(
    @Inject(ProjectScmService)
    private readonly projectScmService: ProjectScmService,
  ) {}

  @Get()
  @ProjectPermission(PROJECT_ROLE.READ)
  async getProjectGit(@Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId, @Param(ProjectPropCamel.projectId) projectId: string): Promise<ProjectScm> {
    return await this.projectScmService.getProjectGit(organizationId, projectId);
  }

  @Patch()
  @ProjectPermission(PROJECT_ROLE.ADMIN)
  async updateProjectGit(
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId,
    @Param(ProjectPropCamel.projectId) projectId: string,
    @Body() updateProjectGitDto: UpdateProjectGitDto,
  ): Promise<void> {
    return await this.projectScmService.updateProjectGit(organizationId, projectId, updateProjectGitDto);
  }

  @Get('scripts')
  async getTestScripts(@Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId, @Param(ProjectPropCamel.projectId) projectId: string) {
    return await this.projectScmService.findTestScripts(organizationId, projectId);
  }
}
