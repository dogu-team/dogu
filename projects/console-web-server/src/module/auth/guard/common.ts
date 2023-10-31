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
import { OrganizationAndUserAndOrganizationRole, Project, ProjectAndUserAndProjectRole, Token, User } from '../../../db/entity/index';
import { OrganizationAccessToken } from '../../../db/entity/organization-access-token.entity';
import { OrganizationRole } from '../../../db/entity/organization-role.entity';
import { PersonalAccessToken } from '../../../db/entity/personal-access-token.entity';
import { ProjectAccessToken } from '../../../db/entity/project-access-token.entity';
import { ProjectRole } from '../../../db/entity/project-role.entity';
import { logger } from '../../logger/logger.instance';
import { EMAIL_VERIFICATION, ORGANIZATION_ROLE, PROJECT_ROLE, SELF_HOSTED_ROLE } from '../auth.types';

export interface LogInfo {
  controller: string;
  method: string;
  handler: string;
  roleType: PROJECT_ROLE | ORGANIZATION_ROLE | EMAIL_VERIFICATION | SELF_HOSTED_ROLE | null;
  payload: AuthPayLoad;
}

export function printLog(ctx: ExecutionContext, guardName: string, roleType: PROJECT_ROLE | ORGANIZATION_ROLE | EMAIL_VERIFICATION | SELF_HOSTED_ROLE | null) {
  const logInfo: LogInfo = {
    controller: ctx.getClass().name,
    method: ctx.switchToHttp().getRequest<{ method: string }>().method,
    handler: ctx.getHandler().name,
    roleType: roleType,
    payload: ctx.switchToHttp().getRequest<{ user: AuthPayLoad }>().user,
  };
  logger.info(`${guardName}: `, { logInfo });
}

export function getOrganizationIdFromRequest(ctx: ExecutionContext): OrganizationId | undefined {
  const orgIdParam = ctx.switchToHttp().getRequest<{ params: { organizationId?: OrganizationId } }>().params.organizationId;
  const orgIdQuery = ctx.switchToHttp().getRequest<{ query: { organizationId?: OrganizationId } }>().query.organizationId;
  const orgIdBody = ctx.switchToHttp().getRequest<{ body: { organizationId?: OrganizationId } }>().body.organizationId;

  return orgIdParam || orgIdQuery || orgIdBody;
}

export module UserPermission {
  export async function getUserWithOrganizationRoleAndProjectRoleGroup(
    manager: EntityManager,
    organizationId: OrganizationId | undefined,
    projectId: ProjectId,
    userId: UserId,
  ): Promise<User | null> {
    if (!organizationId) {
      const userRole = await manager.getRepository(OrganizationAndUserAndOrganizationRole).findOne({ where: { userId } });

      if (!userRole) {
        throw new HttpException(`The user is not a member of the organization.`, HttpStatus.UNAUTHORIZED);
      }

      organizationId = userRole?.organizationId;
    }

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

  export async function getOrganizationUserRole(manager: EntityManager, organizationId: OrganizationId | undefined, userId: UserId): Promise<OrganizationRole> {
    const orgIdCamel = OrganizationAndUserAndOrganizationRolePropCamel.organizationId;
    const orgIdSnake = OrganizationAndUserAndOrganizationRolePropSnake.organization_id;

    const orgIdWhereClause = organizationId ? `orgUserRole.${orgIdSnake} = :${orgIdCamel}` : `1=1`;

    const orgUserRole = await manager
      .getRepository(OrganizationAndUserAndOrganizationRole) //
      .createQueryBuilder('orgUserRole')
      .innerJoinAndSelect(`orgUserRole.${OrganizationAndUserAndOrganizationRolePropCamel.organizationRole}`, `organizationRole`)
      .where(`orgUserRole.${UserPropSnake.user_id} = :${UserPropCamel.userId}`, { userId })
      .andWhere(orgIdWhereClause, { [orgIdCamel]: organizationId })
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
      // logger.error(`The user is not a ${requiredRoleName} role of the organization.`);
      // throw new HttpException(`The user is not a ${requiredRoleName} role of the organization.`, HttpStatus.UNAUTHORIZED);
      return false;
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

export interface ApiPermissionResult {
  organizationId?: OrganizationId;
  projectId?: ProjectId;
  userId?: UserId;
}

export module ApiPermission {
  export async function validateOrganizationApiPermission(
    manager: EntityManager,
    tokenByRequest: string,
    controllerRoleType: ORGANIZATION_ROLE,
    orgIdByRequest: OrganizationId,
    projectIdByRequest: ProjectId,
  ): Promise<ApiPermissionResult> {
    const token = await manager.getRepository(Token).findOne({ where: { token: tokenByRequest } });
    if (!token) {
      throw new HttpException(`V1OpenApiProjectGuard. The token is invalid.`, HttpStatus.UNAUTHORIZED);
    }

    const project = await manager.getRepository(Project).findOne({ where: { projectId: projectIdByRequest } });
    const orgIdByProject = project?.organizationId;

    // validate by org
    const orgByToken = await manager.getRepository(OrganizationAccessToken).findOne({ where: { tokenId: token.tokenId } });
    if (orgByToken && orgByToken.organizationId === orgIdByRequest) {
      const payload: ApiPermissionResult = {
        organizationId: orgByToken.organizationId,
      };
      return payload;
    } else if (orgIdByProject && orgByToken && orgByToken.organizationId == orgIdByProject) {
      const payload: ApiPermissionResult = {
        organizationId: orgByToken.organizationId,
      };
      return payload;
    }

    // validate by user
    const userByToken = await manager.getRepository(PersonalAccessToken).findOne({ where: { tokenId: token.tokenId } });
    if (!userByToken) {
      throw new HttpException(`Unauthorized`, HttpStatus.UNAUTHORIZED);
    }

    const userId = userByToken.userId;
    const orgId = orgIdByProject || orgIdByRequest;
    const organizationRole = await UserPermission.getOrganizationUserRole(manager, orgId, userId);
    if (!UserPermission.validateOrganizationRolePermission(organizationRole, controllerRoleType)) {
      const requiredRoleName = ORGANIZATION_ROLE[controllerRoleType];
      throw new HttpException(`The user is not a ${requiredRoleName} role of the organization.`, HttpStatus.UNAUTHORIZED);
    }

    const payload: ApiPermissionResult = {
      userId,
    };
    return payload;
  }

  export async function validateProjectApiPermission(
    manager: EntityManager,
    tokenByRequest: string,
    controllerRoleType: PROJECT_ROLE,
    orgIdByRequest: OrganizationId,
    projectIdByRequest: ProjectId,
  ): Promise<ApiPermissionResult> {
    const token = await manager.getRepository(Token).findOne({ where: { token: tokenByRequest } });
    if (!token) {
      throw new HttpException(`V1OpenApiProjectGuard. The token is invalid.`, HttpStatus.UNAUTHORIZED);
    }
    const project = await manager.getRepository(Project).findOne({ where: { projectId: projectIdByRequest } });
    const orgIdByProject = project?.organizationId;

    // validate by org
    const orgByToken = await manager.getRepository(OrganizationAccessToken).findOne({ where: { tokenId: token.tokenId } });
    if (orgByToken && orgByToken.organizationId === orgIdByRequest) {
      const payload: ApiPermissionResult = {
        organizationId: orgByToken.organizationId,
      };
      return payload;
    } else if (orgIdByProject && orgByToken && orgByToken.organizationId == orgIdByProject) {
      const payload: ApiPermissionResult = {
        organizationId: orgByToken.organizationId,
      };
      return payload;
    }

    // validate by project
    const projectByToken = await manager.getRepository(ProjectAccessToken).findOne({ where: { tokenId: token.tokenId } });
    if (projectByToken && projectByToken.projectId === projectIdByRequest) {
      const payload: ApiPermissionResult = {
        projectId: projectByToken.projectId,
      };
      return payload;
    }

    // validate by user
    const userByToken = await manager.getRepository(PersonalAccessToken).findOne({ where: { tokenId: token.tokenId } });
    if (!userByToken) {
      throw new HttpException(`Unauthorized`, HttpStatus.UNAUTHORIZED);
    }

    const userId = userByToken.userId;
    const orgId = orgIdByProject || orgIdByRequest;
    const organizationRole = await UserPermission.getOrganizationUserRole(manager, orgId, userId);
    if (UserPermission.validateOrganizationRolePermission(organizationRole, ORGANIZATION_ROLE.ADMIN)) {
      const payload: ApiPermissionResult = {
        userId: userId,
      };
      return payload;
    }

    const userWithOrgProjectRole = await UserPermission.getUserWithOrganizationRoleAndProjectRoleGroup(manager, orgId, projectIdByRequest, userId);
    if (!userWithOrgProjectRole) {
      logger.error(`The user is not a member of the organization.`);
      throw new HttpException(`The user is not a member of the organization.`, HttpStatus.UNAUTHORIZED);
    }

    if (!UserPermission.checkProjectPermission(userWithOrgProjectRole, controllerRoleType)) {
      throw new HttpException(`The user does not have permission to access the project.`, HttpStatus.UNAUTHORIZED);
    }

    const payload: ApiPermissionResult = {
      userId: userId,
    };
    return payload;
  }
}
