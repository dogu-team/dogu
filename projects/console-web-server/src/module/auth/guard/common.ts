import {
  OrganizationAndUserAndOrganizationRolePropCamel,
  OrganizationAndUserAndOrganizationRolePropSnake,
  ProjectAndTeamAndProjectRolePropCamel,
  ProjectAndUserAndProjectRolePropCamel,
  ProjectAndUserAndProjectRolePropSnake,
  TeamPropCamel,
  UserPropCamel,
  UserPropSnake,
} from '@dogu-private/console';
import { AuthPayLoad, OrganizationId, ProjectId, UserId } from '@dogu-private/types';
import { notEmpty } from '@dogu-tech/common';
import { ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Brackets, EntityManager } from 'typeorm';
import { OrganizationAndUserAndOrganizationRole, ProjectAndUserAndProjectRole, User } from '../../../db/entity/index';
import { OrganizationRole } from '../../../db/entity/organization-role.entity';
import { ProjectRole } from '../../../db/entity/project-role.entity';
import { logger } from '../../logger/logger.instance';
import { EMAIL_VERIFICATION, ORGANIZATION_ROLE, PROJECT_ROLE } from '../auth.types';

export interface LogInfo {
  controller: string;
  method: string;
  handler: string;
  roleType: PROJECT_ROLE | ORGANIZATION_ROLE | EMAIL_VERIFICATION | null;
  payload: AuthPayLoad;
}

export function printLog(ctx: ExecutionContext, guardName: string, roleType: PROJECT_ROLE | ORGANIZATION_ROLE | EMAIL_VERIFICATION | null) {
  const logInfo: LogInfo = {
    controller: ctx.getClass().name,
    method: ctx.switchToHttp().getRequest<{ method: string }>().method,
    handler: ctx.getHandler().name,
    roleType: roleType,
    payload: ctx.switchToHttp().getRequest<{ user: AuthPayLoad }>().user,
  };
  logger.info(`${guardName}: `, { logInfo });
}

export function getOrganizationIdFromRequest(ctx: ExecutionContext): OrganizationId {
  const orgIdParam = ctx.switchToHttp().getRequest<{ params: { organizationId: OrganizationId } }>().params.organizationId;
  const orgIdQuery = ctx.switchToHttp().getRequest<{ query: { organizationId: OrganizationId } }>().query.organizationId;
  const orgIdBody = ctx.switchToHttp().getRequest<{ body: { organizationId: OrganizationId } }>().body.organizationId;
  const orgIds = [orgIdParam, orgIdQuery, orgIdBody].filter((id): id is OrganizationId => id !== undefined);
  if (orgIds.length === 0) {
    throw new HttpException(`Guard Error. organizationId is required`, HttpStatus.BAD_REQUEST);
  } else if (orgIds.length > 1) {
    throw new HttpException(`Guard Error. organizationId is duplicated`, HttpStatus.BAD_REQUEST);
  }
  return orgIds[0];
}

export module UserPermission {
  export async function getUserWithOrganizationRoleAndProjectRoleGroup(
    manager: EntityManager,
    organizationId: OrganizationId,
    projectId: ProjectId,
    userId: UserId,
  ): Promise<User | null> {
    // const userId = ctx.switchToHttp().getRequest<{ user: UserPayload }>().user.userId;
    // const projectId = ctx.switchToHttp().getRequest<{ params: { projectId: ProjectId } }>().params.projectId;
    // const organizationId = getOrganizationIdFromRequest(ctx);

    const user = await manager //
      .getRepository(User)
      .createQueryBuilder('user')
      .innerJoinAndSelect(
        `user.${UserPropCamel.organizationAndUserAndOrganizationRoles}`,
        'orgUserRole',
        `orgUserRole.${OrganizationAndUserAndOrganizationRolePropSnake.organization_id} = :${OrganizationAndUserAndOrganizationRolePropCamel.organizationId}`,
        { organizationId },
      )
      .innerJoinAndSelect(`orgUserRole.${OrganizationAndUserAndOrganizationRolePropCamel.organizationRole}`, 'orgRole')
      .leftJoinAndSelect(
        `user.${UserPropCamel.projectAndUserAndProjectRoles}`,
        'projectUserRole',
        `projectUserRole.${ProjectAndUserAndProjectRolePropSnake.project_id} = :${ProjectAndUserAndProjectRolePropCamel.projectId}`,
        { projectId },
      )
      .leftJoinAndSelect(`projectUserRole.${ProjectAndUserAndProjectRolePropCamel.projectRole}`, 'userRole')
      .leftJoinAndSelect(`user.${UserPropCamel.teams}`, 'team')
      .leftJoinAndSelect(`team.${TeamPropCamel.projectAndTeamAndProjectRoles}`, 'projectTeamRole')
      .leftJoinAndSelect(`projectTeamRole.${ProjectAndTeamAndProjectRolePropCamel.projectRole}`, 'teamRole')
      .where(`user.${UserPropSnake.user_id} = :${UserPropCamel.userId}`, { userId })
      .getOne();

    return user;
  }

  export async function getProjectUserRole(manager: EntityManager, projectId: ProjectId, userId: UserId): Promise<ProjectRole> {
    // const userId = ctx.switchToHttp().getRequest<{ user: UserPayload }>().user.userId;
    // const projectId = ctx.switchToHttp().getRequest<{ params: { projectId: ProjectId } }>().params.projectId;

    const projectUserRole = await manager //
      .getRepository(ProjectAndUserAndProjectRole)
      .createQueryBuilder('projectUserRole')
      .innerJoinAndSelect(`projectUserRole.${ProjectAndUserAndProjectRolePropCamel.projectRole}`, `projectRole`)
      .where(
        new Brackets((qb) => {
          qb.where(`projectUserRole.${ProjectAndUserAndProjectRolePropSnake.user_id} = :${ProjectAndUserAndProjectRolePropCamel.userId}`, { userId });
          qb.andWhere(`projectUserRole.${ProjectAndUserAndProjectRolePropSnake.project_id} = :${ProjectAndUserAndProjectRolePropCamel.projectId}`, { projectId });
        }),
      )
      .getOne();

    if (!projectUserRole) {
      throw new HttpException(`User ${userId} has no project ${projectId} role`, HttpStatus.BAD_REQUEST);
    }

    // project role
    const projejctRole = projectUserRole.projectRole;
    if (!projejctRole) {
      throw new HttpException(`User ${userId} has no project ${projectId} role`, HttpStatus.BAD_REQUEST);
    }

    return projejctRole;
  }

  export async function getOrganizationUserRole(manager: EntityManager, organizationId: OrganizationId, userId: UserId): Promise<OrganizationRole> {
    const orgIdCamel = OrganizationAndUserAndOrganizationRolePropCamel.organizationId;
    const orgIdSnake = OrganizationAndUserAndOrganizationRolePropSnake.organization_id;
    const orgUserRole = await manager
      .getRepository(OrganizationAndUserAndOrganizationRole) //
      .createQueryBuilder('orgUserRole')
      .innerJoinAndSelect(`orgUserRole.${OrganizationAndUserAndOrganizationRolePropCamel.organizationRole}`, `organizationRole`)
      .where(`orgUserRole.${UserPropSnake.user_id} = :${UserPropCamel.userId}`, { userId })
      .andWhere(`orgUserRole.${orgIdSnake} = :${orgIdCamel}`, { organizationId })
      .getOne();

    if (!orgUserRole) {
      logger.error(`The user is not a member of the organization. userId: ${userId}, organizationId: ${organizationId}`);
      throw new HttpException(`The user is not a member of the organization.`, HttpStatus.UNAUTHORIZED);
    }
    const organizationRole = orgUserRole.organizationRole;
    if (!organizationRole) {
      logger.error(`The user is not a member of the organization. userId: ${userId}, organizationId: ${organizationId}`);
      throw new HttpException(`The user is not a member of the organization.`, HttpStatus.UNAUTHORIZED);
    }

    return organizationRole;
  }

  export function checkOrganizationRolePermission(checkOrgRoleType: ORGANIZATION_ROLE, requiredOrgRoleType: ORGANIZATION_ROLE): boolean {
    return checkOrgRoleType <= requiredOrgRoleType;
  }

  export function checkProjectRolePermission(checkProjectRoleType: PROJECT_ROLE, requiredProjectRoleType: PROJECT_ROLE): boolean {
    return checkProjectRoleType <= requiredProjectRoleType;
  }

  export function validateOrganizationRolePermission(organizationRole: OrganizationRole, controllerRoleType: ORGANIZATION_ROLE): boolean {
    const orgRoleId = organizationRole.organizationRoleId;
    const requiredRoleName = ORGANIZATION_ROLE[controllerRoleType];

    if (organizationRole.customise === 1) {
      // custom role type validation
      logger.info(`Customise Organization Role Type: ${orgRoleId}`);
      logger.error(`not implemented. OrganizationGaurd()`);
      throw new HttpException(`not implemented`, HttpStatus.NOT_IMPLEMENTED);
    }

    if (controllerRoleType > ORGANIZATION_ROLE.MEMBER || orgRoleId > ORGANIZATION_ROLE.MEMBER) {
      logger.error(`not implemented. OrganizationGaurd()`);
      throw new HttpException(`not implemented`, HttpStatus.NOT_IMPLEMENTED);
    }

    const isValid = UserPermission.checkOrganizationRolePermission(orgRoleId, controllerRoleType);
    if (!isValid) {
      logger.error(`The user is not a ${requiredRoleName} role of the organization.`);
      throw new HttpException(`The user is not a ${requiredRoleName} role of the organization.`, HttpStatus.UNAUTHORIZED);
    }
    return true;
  }

  function checkProjectUserPermission(user: User, controllerRoleType: PROJECT_ROLE): boolean {
    const projectUserRoles = user.projectAndUserAndProjectRoles ? user.projectAndUserAndProjectRoles : [];
    if (projectUserRoles.length === 0) {
      // this.logger.error(`The user is not a member of the project.`);
      // throw new HttpException(`The user is not a member of the project.`, HttpStatus.CONFLICT);
      return false;
    }

    if (projectUserRoles.length > 1) {
      logger.error(`The user is duplicated in the project.`);
      throw new HttpException(`The user is duplicated in the project.`, HttpStatus.CONFLICT);
    }
    const projectRole = projectUserRoles[0].projectRole;
    if (!projectRole) {
      logger.error(`The user is not a member of the project.`);
      throw new HttpException(`The user is not a member of the project.`, HttpStatus.CONFLICT);
    }

    if (validateProjectRolePermission(projectRole, controllerRoleType)) {
      return true;
    }
    return false;
  }

  function checkProjectTeamPermission(user: User, controllerRoleType: PROJECT_ROLE): boolean {
    const teams = user.teams ? user.teams : [];
    const projectTeamRoles = teams
      .map((team) => team.projectAndTeamAndProjectRoles)
      .flat()
      .filter(notEmpty);

    if (projectTeamRoles.length === 0) {
      // logger.error(`The team with the user is not a member of the project.`);
      // throw new HttpException(`The user is not a member of the project.`, HttpStatus.CONFLICT);
      return false;
    }
    if (projectTeamRoles.length > 1) {
      logger.error(`The team with the user is duplicated in the project.`);
      throw new HttpException(`The team with the user is duplicated in the project.`, HttpStatus.CONFLICT);
    }

    const projectRole = projectTeamRoles[0].projectRole;
    if (!projectRole) {
      logger.error(`The team with the user is not a member of the project.`);
      throw new HttpException(`The team with the user is not a member of the project.`, HttpStatus.CONFLICT);
    }

    if (validateProjectRolePermission(projectRole, controllerRoleType)) {
      return true;
    }
    return false;
  }

  function validateProjectRolePermission(projectRole: ProjectRole, controllerRoleType: PROJECT_ROLE): boolean {
    if (projectRole.customise === 1) {
      // custom role type validation
      logger.info(` Project Role Type Customise`);
      logger.error(`not implemented. ProjectGaurd()`);
      throw new HttpException(`not implemented`, HttpStatus.NOT_IMPLEMENTED);
    }
    if (controllerRoleType > PROJECT_ROLE.READ || projectRole.projectRoleId > PROJECT_ROLE.READ) {
      logger.error(`not implemented. ProjectGaurd()`);
      throw new HttpException(`not implemented`, HttpStatus.NOT_IMPLEMENTED);
    }

    const requiredRoleName = PROJECT_ROLE[controllerRoleType];
    if (!UserPermission.checkProjectRolePermission(projectRole.projectRoleId, controllerRoleType)) {
      logger.info(`The user is not a ${requiredRoleName} role of the project.`);
      // throw new HttpException(`The user is not a ${requiredRoleName} role of the project.`, HttpStatus.UNAUTHORIZED);
      return false;
    }

    return true;
  }

  export function checkProjectPermission(user: User, controllerRoleType: PROJECT_ROLE): boolean {
    // user permission
    if (checkProjectUserPermission(user, controllerRoleType)) {
      return true;
    }

    // team with user permission
    if (checkProjectTeamPermission(user, controllerRoleType)) {
      return true;
    }

    return false;
  }
}
