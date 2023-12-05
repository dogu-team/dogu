import { OrganizationApplicationPropCamel, OrganizationPropCamel } from '@dogu-private/console';
import { OrganizationId } from '@dogu-private/types';
import { Instance, transform } from '@dogu-tech/common';
import { Application, GetApplicationListQuery, GetApplicationsWithUniquePackageQuery, GetGitUrlQuery, PublicAction } from '@dogu-tech/console-action';
import { Controller, Get, Param, Query } from '@nestjs/common';
import { HOST_ACTION_TYPE } from '../auth/auth.types';
import { HostPermission } from '../auth/decorators';
import { FindOrganizationApplicationDto } from '../organization/application/application.dto';
import { OrganizationApplicationService } from '../organization/application/application.service';
import { OrganizationScmService } from '../organization/scm/scm.service';

@Controller(PublicAction.controller.path)
export class PublicActionController {
  constructor(
    private readonly organizationScmService: OrganizationScmService,
    private readonly applicationService: OrganizationApplicationService,
  ) {}

  @Get(PublicAction.getGitUrl.path)
  // @HostPermission(HOST_ACTION_TYPE.HOST_API)
  async getGitUrl(
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId, //
    @Query() dto: GetGitUrlQuery,
  ): Promise<Instance<typeof PublicAction.getGitUrl.responseBody>> {
    const url = await this.organizationScmService.getGitUrlWithAuth(organizationId, dto.repository);
    return { url };
  }

  @Get(PublicAction.getApplicationList.path)
  @HostPermission(HOST_ACTION_TYPE.HOST_API)
  async getApplicationList(
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId, //
    @Query() query: GetApplicationListQuery,
  ): Promise<Instance<typeof PublicAction.getApplicationList.responseBody>> {
    const dto = transform(FindOrganizationApplicationDto, query);
    const applicationListSource = await this.applicationService.findApplications(organizationId, dto);
    const { items } = applicationListSource;
    const applicationList = items.map(({ organizationApplicationId, name, fileName, fileSize, package: packageName }) => {
      const application: Instance<typeof Application> = {
        id: organizationApplicationId,
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
  @HostPermission(HOST_ACTION_TYPE.HOST_API)
  async getApplicationsWithUniquePackage(
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId, //
    @Query() query: GetApplicationsWithUniquePackageQuery,
  ): Promise<Instance<typeof PublicAction.getApplicationList.responseBody>> {
    const { packageName } = query;
    const dto = transform(FindOrganizationApplicationDto, query);
    const applicationListSource = await this.applicationService.findApplicationsByPackageName(organizationId, packageName, dto);
    const applicationList = applicationListSource.items.map(({ organizationApplicationId, name, fileName, fileSize, package: packageName }) => {
      const application: Instance<typeof Application> = {
        id: organizationApplicationId,
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
  @HostPermission(HOST_ACTION_TYPE.HOST_API)
  async getApplicationDownloadUrl(
    @Param(OrganizationApplicationPropCamel.organizationApplicationId) organizationApplicationId: string,
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId, //
  ): Promise<Instance<typeof PublicAction.getApplicationDownloadUrl.responseBody>> {
    const url = await this.applicationService.getApplicationDownladUrl(organizationApplicationId, organizationId);
    return { url };
  }
}
