import { OrganizationPropCamel } from '@dogu-private/console';
import { OrganizationId, ProjectId, UserId, UserPayload } from '@dogu-private/types';
import { Body, Controller, Delete, HttpException, HttpStatus, Inject, Param, Patch, Post } from '@nestjs/common';
import { PROJECT_ROLE } from '../../auth/auth.types';
import { ProjectPermission, User } from '../../auth/decorators';
import { AddUserToProjectDto, UpdateUserProjectRoleDto } from './dto/project-user.dto';
import { ProjectUserService } from './project-user.service';

@Controller('organizations/:organizationId/projects')
export class ProjectUserController {
  constructor(
    @Inject(ProjectUserService)
    private projectUserService: ProjectUserService, //
  ) {}

  @Post('/:projectId/users')
  @ProjectPermission(PROJECT_ROLE.ADMIN)
  async AddUserToProject(
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId, //
    @Param('projectId') projectId: ProjectId,
    @Body() dto: AddUserToProjectDto,
  ): Promise<void> {
    await this.projectUserService.addUserToProject(organizationId, projectId, dto);
  }

  @Patch('/:projectId/users/:userId/role')
  @ProjectPermission(PROJECT_ROLE.ADMIN)
  async UpdateUserProjectRole(
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId, //
    @Param('projectId') projectId: ProjectId,
    @Param('userId') userId: UserId,
    @User() userPayload: UserPayload,
    @Body() dto: UpdateUserProjectRoleDto,
  ): Promise<void> {
    if (userPayload.userId === userId) {
      throw new HttpException('You can not change your own role', HttpStatus.BAD_REQUEST);
    }
    await this.projectUserService.updateUserProjectRole(organizationId, projectId, userId, dto);
  }

  @Delete('/:projectId/users/:userId')
  @ProjectPermission(PROJECT_ROLE.ADMIN)
  async softRemoveUserFromProject(
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId, //
    @Param('projectId') projectId: ProjectId,
    @Param('userId') userId: UserId,
    @User() userPayload: UserPayload,
  ): Promise<void> {
    if (userPayload.userId === userId) {
      throw new HttpException('You can not delete yourself from project', HttpStatus.BAD_REQUEST);
    }
    await this.projectUserService.softRemoveUserFromProject(organizationId, projectId, userId);
  }
}
