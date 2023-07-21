import { ProjectId, UserPayload } from '@dogu-private/types';
import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { config } from '../../../config';
import { DoguLogger } from '../../logger/logger';
import { ORGANIZATION_ROLE, PROJECT_ROLE, PROJECT_ROLE_KEY } from '../auth.types';
import { getOrganizationIdFromRequest, printLog, UserPermission } from './common';

@Injectable()
export class ProjectGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector, //
    private readonly logger: DoguLogger,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const controllerRoleType: PROJECT_ROLE = this.reflector.get<PROJECT_ROLE>(PROJECT_ROLE_KEY, ctx.getHandler());
    if (!controllerRoleType) {
      throw new HttpException(`ProjectGuard. The role is not defined.`, HttpStatus.UNAUTHORIZED);
    }

    if (config.gaurd.role.logging) {
      printLog(ctx, 'ProjectGuard', controllerRoleType);
    }
    const userId = ctx.switchToHttp().getRequest<{ user: UserPayload }>().user.userId;
    const projectId = ctx.switchToHttp().getRequest<{ params: { projectId: ProjectId } }>().params.projectId;
    const organizationId = getOrganizationIdFromRequest(ctx);
    const organizationRole = await UserPermission.getOrganizationUserRole(this.dataSource.manager, organizationId, userId);
    if (UserPermission.validateOrganizationRolePermission(organizationRole, ORGANIZATION_ROLE.ADMIN)) {
      return true;
    }

    const userWithOrgProjectRole = await UserPermission.getUserWithOrganizationRoleAndProjectRoleGroup(this.dataSource.manager, organizationId, projectId, userId);
    if (!userWithOrgProjectRole) {
      this.logger.error(`The user is not a member of the organization.`);
      throw new HttpException(`The user is not a member of the organization.`, HttpStatus.UNAUTHORIZED);
    }

    if (!UserPermission.checkProjectPermission(userWithOrgProjectRole, controllerRoleType)) {
      throw new HttpException(`The user is not a member of the project.`, HttpStatus.UNAUTHORIZED);
    }

    return false;
  }

  // private checkRoleGroupPermission(projectRole: ProjectRole, controllerRoleType: PROJECT_ROLE): boolean {
  //   if (projectRole.customise === 1) {
  //     // custom role type validation
  //     this.logger.info(` Project Role Type Customise`);
  //     this.logger.error(`not implemented. ProjectGaurd()`);
  //     throw new HttpException(`not implemented`, HttpStatus.NOT_IMPLEMENTED);
  //   }
  //   if (controllerRoleType > PROJECT_ROLE.READ || projectRole.projectRoleId > PROJECT_ROLE.READ) {
  //     this.logger.error(`not implemented. ProjectGaurd()`);
  //     throw new HttpException(`not implemented`, HttpStatus.NOT_IMPLEMENTED);
  //   }

  //   const requiredRoleName = PROJECT_ROLE[controllerRoleType];
  //   if (!UserPermission.checkProjectRolePermission(projectRole.projectRoleId, controllerRoleType)) {
  //     this.logger.info(`The user is not a ${requiredRoleName} role of the project.`);
  //     // throw new HttpException(`The user is not a ${requiredRoleName} role of the project.`, HttpStatus.UNAUTHORIZED);
  //     return false;
  //   }

  //   return true;
  // }

  // private checkOrganizationAdmin(user: User): boolean {
  //   const orgUserRoles = user.organizationAndUserAndOrganizationRoles ? user.organizationAndUserAndOrganizationRoles : [];
  //   if (orgUserRoles.length === 0) {
  //     this.logger.error(`The user is not a member of the organization.`);
  //     throw new HttpException(`The user is not a member of the organization.`, HttpStatus.UNAUTHORIZED);
  //   }
  //   if (orgUserRoles.length > 1) {
  //     this.logger.error(`The user is duplicated in the organization.`);
  //     throw new HttpException(`The user is duplicated in the organization.`, HttpStatus.UNAUTHORIZED);
  //   }
  //   const orgRoleId = orgUserRoles[0].organizationRoleId;

  //   if (UserPermission.checkOrganizationRolePermission(orgRoleId, ORGANIZATION_ROLE.ADMIN)) {
  //     return true;
  //   } else {
  //     return false;
  //   }
  // }

  // private checkProjectPermission(user: User, controllerRoleType: PROJECT_ROLE): boolean {
  //   // user permission
  //   if (this.checkProjectUserPermission(user, controllerRoleType)) {
  //     return true;
  //   }

  //   // team with user permission
  //   if (this.checkProjectTeamPermission(user, controllerRoleType)) {
  //     return true;
  //   }

  //   return false;
  // }

  // private checkProjectUserPermission(user: User, controllerRoleType: PROJECT_ROLE): boolean {
  //   const projectUserRoles = user.projectAndUserAndProjectRoles ? user.projectAndUserAndProjectRoles : [];
  //   if (projectUserRoles.length === 0) {
  //     // this.logger.error(`The user is not a member of the project.`);
  //     // throw new HttpException(`The user is not a member of the project.`, HttpStatus.CONFLICT);
  //     return false;
  //   }

  //   if (projectUserRoles.length > 1) {
  //     this.logger.error(`The user is duplicated in the project.`);
  //     throw new HttpException(`The user is duplicated in the project.`, HttpStatus.CONFLICT);
  //   }
  //   const projectRole = projectUserRoles[0].projectRole;
  //   if (!projectRole) {
  //     this.logger.error(`The user is not a member of the project.`);
  //     throw new HttpException(`The user is not a member of the project.`, HttpStatus.CONFLICT);
  //   }

  //   if (this.checkRoleGroupPermission(projectRole, controllerRoleType)) {
  //     return true;
  //   }
  //   return false;
  // }

  // private checkProjectTeamPermission(user: User, controllerRoleType: PROJECT_ROLE): boolean {
  //   const teams = user.teams ? user.teams : [];
  //   const projectTeamRoles = teams
  //     .map((team) => team.projectAndTeamAndProjectRoles)
  //     .flat()
  //     .filter(notEmpty);

  //   if (projectTeamRoles.length === 0) {
  //     // this.logger.error(`The team with the user is not a member of the project.`);
  //     // throw new HttpException(`The user is not a member of the project.`, HttpStatus.CONFLICT);
  //     return false;
  //   }
  //   if (projectTeamRoles.length > 1) {
  //     this.logger.error(`The team with the user is duplicated in the project.`);
  //     throw new HttpException(`The team with the user is duplicated in the project.`, HttpStatus.CONFLICT);
  //   }

  //   const projectRole = projectTeamRoles[0].projectRole;
  //   if (!projectRole) {
  //     this.logger.error(`The team with the user is not a member of the project.`);
  //     throw new HttpException(`The team with the user is not a member of the project.`, HttpStatus.CONFLICT);
  //   }

  //   if (this.checkRoleGroupPermission(projectRole, controllerRoleType)) {
  //     return true;
  //   }
  //   return false;
  // }

  // private async checkPermission(ctx: ExecutionContext, controllerRoleType: PROJECT_ROLE): Promise<boolean> {
  //   const userId = ctx.switchToHttp().getRequest<{ user: UserPayload }>().user.userId;
  //   const projectId = ctx.switchToHttp().getRequest<{ params: { projectId: ProjectId } }>().params.projectId;
  //   const organizationId = getOrganizationIdFromRequest(ctx);
  //   const userWithOrgProjectRole = await UserPermission.getUserWithOrganizationRoleAndProjectRoleGroup(this.dataSource.manager, organizationId, projectId, userId);
  //   if (!userWithOrgProjectRole) {
  //     this.logger.error(`The user is not a member of the organization.`);
  //     throw new HttpException(`The user is not a member of the organization.`, HttpStatus.UNAUTHORIZED);
  //   }

  //   // if (this.checkOrganizationAdmin(userWithOrgProjectRole)) {
  //   //   return true;
  //   // }

  //   // if (UserPermission.checkProjectPermission(userWithOrgProjectRole, controllerRoleType)) {
  //   //   return true;
  //   // }

  //   return false;
  // }
}
