import { DeviceBase, MemberAndRoleGroupBase, OrganizationPropCamel, ProjectPipelineReportResponse, ProjectPropCamel, ProjectResponse } from '@dogu-private/console';
import { OrganizationId, ProjectId, UserPayload } from '@dogu-private/types';
import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Query } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ORGANIZATION_ROLE, PROJECT_ROLE } from '../../module/auth/auth.types';
import { OrganizationPermission, ProjectPermission, User } from '../../module/auth/decorators';
import { Page } from '../../module/common/dto/pagination/page';
// import { GitlabService } from '../gitlab/gitlab.service';
import { CreatePipelineReportDto, CreateProjectDto, FindMembersByProjectIdDto, FindProjectDeviceDto, FindProjectDto, UpdateProjectDto } from './dto/project.dto';
import { ProjectService } from './project.service';

@Controller('organizations/:organizationId/projects')
export class ProjectController {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,

    @Inject(ProjectService)
    private projectService: ProjectService, // @Inject(GitlabService) // private readonly gitlabService: GitlabService,
  ) {}

  // project CRUD Start
  @Post()
  @OrganizationPermission(ORGANIZATION_ROLE.ADMIN)
  async createProject(
    @User() user: UserPayload,
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId,
    @Body() createProjectDto: CreateProjectDto,
  ): Promise<ProjectResponse> {
    const rv = await this.dataSource.transaction(async (manager) => {
      const project = await this.projectService.createProject(manager, user.userId, organizationId, createProjectDto);
      return project;
    });
    return rv;
  }

  @Get('')
  @OrganizationPermission(ORGANIZATION_ROLE.MEMBER)
  async findProjectsByOrganizationId(
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId, //
    @Query() dto: FindProjectDto,
    @User() userPayload: UserPayload,
  ): Promise<Page<ProjectResponse>> {
    const rv = await this.projectService.findProjectsByOrganizationId(organizationId, userPayload.userId, dto);
    return rv;
  }

  @Get(':projectId')
  @ProjectPermission(PROJECT_ROLE.READ)
  async findProject(
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId, //
    @Param(ProjectPropCamel.projectId) projectId: ProjectId,
    // @User() userPayload: UserPayload,
  ): Promise<ProjectResponse | undefined> {
    const rv = await this.projectService.findProject(organizationId, projectId);
    return rv;
  }

  @Patch(':projectId')
  @ProjectPermission(PROJECT_ROLE.ADMIN)
  async updateProject(
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId, //
    @Param('projectId') projectId: ProjectId,
    @Body() updateProjectDto: UpdateProjectDto,
  ): Promise<ProjectResponse> {
    const rv = await this.projectService.updateProject(organizationId, projectId, updateProjectDto);
    return rv;
  }

  @Delete('/:projectId')
  @OrganizationPermission(ORGANIZATION_ROLE.ADMIN)
  async softRemoveProject(
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId, //
    @Param('projectId') projectId: ProjectId,
  ): Promise<void> {
    await this.projectService.softRemoveProject(projectId);
  }

  @Get('/:projectId/members')
  @ProjectPermission(PROJECT_ROLE.READ)
  async findProjectMembers(
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId, //
    @Param('projectId') projectId: ProjectId,
    @Query() dto: FindMembersByProjectIdDto,
  ): Promise<Page<MemberAndRoleGroupBase>> {
    const rv = await this.projectService.findMembersByProjectId(organizationId, projectId, dto);
    return rv;
  }

  @Get(':projectId/devices')
  @ProjectPermission(PROJECT_ROLE.READ)
  async findProjectDevices(
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId,
    @Param('projectId') projectId: ProjectId,
    @Query() dto: FindProjectDeviceDto,
  ): Promise<Page<DeviceBase>> {
    return await this.projectService.findProjectDevices(organizationId, projectId, dto);
  }

  @Get(':projectId/pipeline-report')
  @ProjectPermission(PROJECT_ROLE.READ)
  async createPipelineReport(
    @User() userPayload: UserPayload,
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId,
    @Param('projectId') projectId: ProjectId,
    @Query() dto: CreatePipelineReportDto,
  ): Promise<ProjectPipelineReportResponse> {
    return await this.projectService.createPipelineReport(userPayload, organizationId, projectId, dto);
  }

  // @Get(':projectId/repository/file')
  // @ProjectPermission(PROJECT_ROLE.READ)
  // async getProjectFile(@Param('projectId') projectId: ProjectId, @Query() dto: GetProjectRepositoryFileDto): Promise<RepositoryRawFile> {
  //   const file = await this.gitlabService.getProjectFile(dto.path, projectId);
  //   return file;
  // }

  // @Get(':projectId/repository/tree')
  // @ProjectPermission(PROJECT_ROLE.READ)
  // async getProjectFileTree(@Param('projectId') projectId: ProjectId): Promise<RepositoryFileTree> {
  //   const tree = await this.gitlabService.getProjectFileTree(projectId);
  //   return tree;
  // }

  // @Get(':projectId/repository/meta/:path')
  // @ProjectPermission(PROJECT_ROLE.READ)
  // async getProjectFileMetaTree(@Param('projectId') projectId: ProjectId, @Param('path') path: string): Promise<RepositoryFileMetaTree> {
  //   const meta = await this.gitlabService.getProjectFileMetaTree(projectId, path);
  //   return meta;
  // }

  // @Get(':projectId/repository/scripts')
  // @ProjectPermission(PROJECT_ROLE.READ)
  // async getProjectScriptMeta(@Param('projectId') projectId: ProjectId, @Query() dto: GetProjectScriptMetaDto): Promise<RepositoryFileMetaTree> {
  //   const scripts = await this.gitlabService.getScriptFileMeta(projectId, dto.type);
  //   return scripts;
  // }
}
