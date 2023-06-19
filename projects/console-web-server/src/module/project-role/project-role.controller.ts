import { OrganizationPropCamel, ProjectRoleBase } from '@dogu-private/console';
import { OrganizationId } from '@dogu-private/types';
import { Controller, Get, Param, Query } from '@nestjs/common';
import { Page } from '../../module/common/dto/pagination/page';
import { ORGANIZATION_ROLE } from '../auth/auth.types';
import { OrganizationPermission } from '../auth/decorators';
import { FindProjectRoleDto } from './dto/project-role.dto';
import { ProjectRoleService } from './project-role.service';

@Controller('organizations/:organizationId/project-roles')
export class ProjectRoleController {
  constructor(private readonly projectRoleService: ProjectRoleService) {}

  @Get()
  @OrganizationPermission(ORGANIZATION_ROLE.MEMBER)
  async findProjectRole(
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId, //
    @Query() dto: FindProjectRoleDto,
  ): Promise<Page<ProjectRoleBase>> {
    const rv = await this.projectRoleService.findProjectRole(organizationId, dto);
    return rv;
  }

  // @Post()
  // @OrganizationPermission(ORGANIZATION_ROLE.ADMIN)
  // async createRoleGroup(
  //   @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId, //
  //   @Body() dto: CreateProjectRoleDto,
  // ): Promise<ProjectRoleBase> {
  //   throw new HttpException(`not implemented`, HttpStatus.NOT_IMPLEMENTED);
  //   const rv = await this.projectRoleService.createProjectRole(organizationId, dto);
  //   return rv;
  // }

  // @Patch('/:projectRoleId')
  // @OrganizationPermission(ORGANIZATION_ROLE.ADMIN)
  // async updateRoleGroup(
  //   @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId, //
  //   @Param('projectRoleId') roleGroupId: ProjectRoleId,
  //   @Body() dto: UpdateProjectRoleDto,
  // ): Promise<ProjectRoleBase> {
  //   throw new HttpException(`not implemented`, HttpStatus.NOT_IMPLEMENTED);
  //   const rv = await this.projectRoleService.updateProjectRole(organizationId, roleGroupId, dto);
  //   return rv;
  // }

  // @Delete('/:roleGroupId')
  // @OrganizationPermission(ORGANIZATION_ROLE.ADMIN)
  // async deleteRoleGroup(
  //   @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId, //
  //   @Param('roleGroupId') roleGroupId: RoleGroupId,
  // ): Promise<RoleGroupResponse> {
  //   throw new HttpException(`not implemented`, HttpStatus.NOT_IMPLEMENTED);
  //   const rv = await this.roleGroupService.deleteRoleGroup(organizationId, roleGroupId);
  //   return rv;
  // }

  // // role-group-project-role mapping
  // @Post('/:roleGroupId/project-roles')
  // @OrganizationPermission(ORGANIZATION_ROLE.ADMIN)
  // async attachProjectRole(
  //   @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId, //
  //   @Param('roleGroupId') roleGroupId: RoleGroupId,
  //   @Body() dto: AddProjectRoleDto,
  // ): Promise<void> {
  //   throw new HttpException(`not implemented`, HttpStatus.NOT_IMPLEMENTED);
  //   await this.roleGroupService.attachProjectRole(organizationId, roleGroupId, dto);
  // }

  // @Delete('/:roleGroupId/project-roles/:projectRoleId')
  // @OrganizationPermission(ORGANIZATION_ROLE.ADMIN)
  // async detachProjectRole(
  //   @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId, //
  //   @Param('roleGroupId') roleGroupId: RoleGroupId,
  //   @Param('projectRoleId') projectRoleId: ProjectRoleId,
  // ): Promise<void> {
  //   throw new HttpException(`not implemented`, HttpStatus.NOT_IMPLEMENTED);
  //   await this.roleGroupService.detachProjectRole(organizationId, roleGroupId, projectRoleId);
  // }
}
