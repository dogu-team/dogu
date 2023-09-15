import { OrganizationPropCamel, ProjectApplicationPropCamel, ProjectPropCamel } from '@dogu-private/console';
import { OrganizationId, ProjectApplicationId, ProjectId } from '@dogu-private/types';
import { Instance, transform } from '@dogu-tech/common';
import { Application, GetApplicationListQuery, PublicAction } from '@dogu-tech/console-action';
import { Controller, Get, Inject, Param, ParseIntPipe, Query } from '@nestjs/common';
import { HOST_ACTION_TYPE } from '../auth/auth.types';
import { HostPermission } from '../auth/decorators';
import { ApplicationService } from '../project/application/application.service';
import { FindProjectApplicationDto } from '../project/application/dto/application.dto';
import { ProjectScmService } from '../project/project-scm/project-scm.service';

@Controller(PublicAction.controller.path)
export class PublicActionController {
  constructor(
    @Inject(ProjectScmService)
    private readonly projectScmService: ProjectScmService,
    private readonly applicationService: ApplicationService,
  ) {}

  @Get(PublicAction.getGitUrl.path)
  @HostPermission(HOST_ACTION_TYPE.PROJECT_ACTION_API)
  async getGitUrl(
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId, //
    @Param(ProjectPropCamel.projectId) projectId: ProjectId,
  ): Promise<Instance<typeof PublicAction.getGitUrl.responseBody>> {
    const url = await this.projectScmService.getGitUrlWithAuth(organizationId, projectId);
    return { url };
  }

  @Get(PublicAction.getApplicationList.path)
  @HostPermission(HOST_ACTION_TYPE.PROJECT_ACTION_API)
  async getApplicationList(
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId, //
    @Param(ProjectPropCamel.projectId) projectId: ProjectId,
    @Query() query: GetApplicationListQuery,
  ): Promise<Instance<typeof PublicAction.getApplicationList.responseBody>> {
    const dto = transform(FindProjectApplicationDto, query);
    const applicationListSource = await this.applicationService.getApplicationList(organizationId, projectId, dto);
    const { items } = applicationListSource;
    const applicationList = items.map(({ projectApplicationId, name, fileName, fileSize, package: packageName }) => {
      const application: Instance<typeof Application> = {
        id: projectApplicationId,
        name,
        fileName,
        packageName,
        fileSize,
      };
      return application;
    });
    return {
      applications: applicationList,
    };
  }

  @Get(PublicAction.getApplicationsWithUniquePackage.path)
  @HostPermission(HOST_ACTION_TYPE.PROJECT_ACTION_API)
  async getApplicationsWithUniquePackage(
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId, //
    @Param(ProjectPropCamel.projectId) projectId: ProjectId,
    @Query() query: GetApplicationListQuery,
  ): Promise<Instance<typeof PublicAction.getApplicationList.responseBody>> {
    const dto = transform(FindProjectApplicationDto, query);
    const applicationListSource = await this.applicationService.getApplicationWithUniquePackage(organizationId, projectId, dto);
    const applicationList = applicationListSource.map(({ projectApplicationId, name, fileName, fileSize, package: packageName }) => {
      const application: Instance<typeof Application> = {
        id: projectApplicationId,
        name,
        fileName,
        packageName,
        fileSize,
      };
      return application;
    });
    return {
      applications: applicationList,
    };
  }

  @Get(PublicAction.getApplicationDownloadUrl.path)
  @HostPermission(HOST_ACTION_TYPE.PROJECT_ACTION_API)
  async getApplicationDownloadUrl(
    @Param(ProjectApplicationPropCamel.projectApplicationId, ParseIntPipe) projectApplicationId: ProjectApplicationId,
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId, //
    @Param(ProjectPropCamel.projectId) projectId: ProjectId,
  ): Promise<Instance<typeof PublicAction.getApplicationDownloadUrl.responseBody>> {
    const url = await this.applicationService.getApplicationDownladUrl(projectApplicationId, organizationId, projectId);
    return { url };
  }
}
