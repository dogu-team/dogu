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
import { AuthPayLoad, OrganizationId, ProjectId, UserPayload } from '@dogu-private/types';
import { ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Brackets, DataSource } from 'typeorm';
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

export async function getUserWithOrganizationRoleAndProjectRoleGroup(ctx: ExecutionContext, dataSource: DataSource): Promise<User | null> {
  const userId = ctx.switchToHttp().getRequest<{ user: UserPayload }>().user.userId;
  const projectId = ctx.switchToHttp().getRequest<{ params: { projectId: ProjectId } }>().params.projectId;
  const organizationId = getOrganizationIdFromRequest(ctx);

  const user = await dataSource //
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

export async function getProjectUserRole(ctx: ExecutionContext, dataSource: DataSource): Promise<ProjectRole> {
  const userId = ctx.switchToHttp().getRequest<{ user: UserPayload }>().user.userId;
  const projectId = ctx.switchToHttp().getRequest<{ params: { projectId: ProjectId } }>().params.projectId;

  const projectUserRole = await dataSource //
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

export async function getOrganizationUserRole(ctx: ExecutionContext, dataSource: DataSource): Promise<OrganizationRole> {
  const userId = ctx.switchToHttp().getRequest<{ user: UserPayload }>().user.userId;
  const organizationId = getOrganizationIdFromRequest(ctx);
  const orgIdCamel = OrganizationAndUserAndOrganizationRolePropCamel.organizationId;
  const orgIdSnake = OrganizationAndUserAndOrganizationRolePropSnake.organization_id;
  const orgUserRole = await dataSource
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
