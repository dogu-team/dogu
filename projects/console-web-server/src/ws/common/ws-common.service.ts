import {
  DevicePropCamel,
  OrganizationAndUserAndOrganizationRolePropCamel,
  OrganizationAndUserAndOrganizationRolePropSnake,
  ProjectAndDevicePropCamel,
  ProjectAndUserAndProjectRolePropCamel,
  ProjectAndUserAndProjectRolePropSnake,
  UserPropCamel,
  UserPropSnake,
} from '@dogu-private/console';
import { DeviceId, OrganizationId, ProjectId, UserId } from '@dogu-private/types';
import { notEmpty } from '@dogu-tech/common';
import { Inject, Injectable } from '@nestjs/common';
import { IncomingMessage } from 'http';
import { DataSource } from 'typeorm';
import { Device, OrganizationAndUserAndOrganizationRole, ProjectAndUserAndProjectRole } from '../../db/entity/index';
import { User } from '../../db/entity/user.entity';
import { checkOrganizationRolePermission, checkProjectRolePermission, ORGANIZATION_ROLE, PROJECT_ROLE } from '../../module/auth/auth.types';
import { AuthUserService } from '../../module/auth/service/auth-user.service';
import { DoguLogger } from '../../module/logger/logger';

export type ValidationResult = { result: boolean; resultCode: number; message: string };

@Injectable()
export class WsCommonService {
  constructor(
    private readonly logger: DoguLogger, //
    @Inject(AuthUserService)
    private readonly authUserService: AuthUserService,
  ) {}

  private async vlidateUserAuthToken(incomingMessage: IncomingMessage): Promise<UserId | null> {
    const userAuthToken = this.authUserService.getUserAuthTokenByWsConnection(incomingMessage);
    if (!userAuthToken) {
      this.logger.error(`vlidateUserAuthToken. The userAuthToken is not found.`);
      return null;
    }
    // refresh token으로만 검증한다.
    // access token 검증 실패 시, token 재발급 방법이 없다.
    const refreshToken = userAuthToken.refreshToken;

    let userId;
    try {
      const payload = await this.authUserService.veriyUserRefreshToken(refreshToken);
      if (!payload) {
        this.logger.error(`vlidateUserAuthToken. The userAuthToken is not found.`);
        return null;
      }
      userId = payload;
    } catch (e) {
      this.logger.error(`vlidateUserAuthToken. The userAuthToken is not found.`);
      return null;
    }
    return userId;
  }

  async validateUserRole(
    incomingMessage: IncomingMessage,
    dataSource: DataSource,
    logger: DoguLogger,
    organizationId: OrganizationId,
    projectId: ProjectId,
  ): Promise<ValidationResult> {
    const userId = await this.vlidateUserAuthToken(incomingMessage);
    if (!userId) {
      return { result: true, resultCode: 1003, message: 'Unauthorized' };
    }

    const isValid = await this.checkUserPermission(dataSource, logger, userId, organizationId, projectId);
    if (!isValid) {
      return { result: true, resultCode: 1003, message: 'Unauthorized' };
    }

    return { result: true, resultCode: 1000, message: 'success' };
  }

  async checkUserPermission(dataSource: DataSource, logger: DoguLogger, userId: UserId, organizationId: OrganizationId, projectId: ProjectId): Promise<boolean> {
    const userWithOrgProjectRole = await dataSource //
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
      .leftJoinAndSelect(`projectUserRole.${ProjectAndUserAndProjectRolePropCamel.projectRole}`, 'projectRole')
      .where(`user.${UserPropSnake.user_id} = :${UserPropCamel.userId}`, { userId })
      .getOne();

    if (!userWithOrgProjectRole) {
      // client.close(1003, `User is not found`);
      return false;
    }
    const orgUserRoles = userWithOrgProjectRole.organizationAndUserAndOrganizationRoles ? userWithOrgProjectRole.organizationAndUserAndOrganizationRoles : [];

    if (orgUserRoles.length === 0) {
      logger.error(`The user is not a member of the organization.`);
      // client.close(1003, `The user is not a member of the organization.`);
      return false;
    }

    if (orgUserRoles.length > 1) {
      logger.error(`The user is duplicated in the organization.`);
      // client.close(1003, `The user is duplicated in the organization.`);
      return false;
    }

    const orgRoleId = orgUserRoles[0].organizationRoleId;
    if (checkOrganizationRolePermission(orgRoleId, ORGANIZATION_ROLE.ADMIN)) {
      return true;
    }

    const projectUserRoles = userWithOrgProjectRole.projectAndUserAndProjectRoles ? userWithOrgProjectRole.projectAndUserAndProjectRoles : [];

    const projectRole = projectUserRoles[0].projectRole;
    if (!projectRole) {
      // client.close(1003, 'Role group not found');
      return false;
    }

    if (projectUserRoles.length === 0) {
      logger.error(`The user is not a member of the project.`);
      // client.close(1003, `The user is not a member of the project.`);
      return false;
    }
    if (projectUserRoles.length > 1) {
      logger.error(`The user is duplicated in the project.`);
      // client.close(1003, `The user is duplicated in the project.`);
      return false;
    }

    if (projectRole.customise === 1) {
      logger.error(`not implemented`);
      // client.close(1003, `customise role group not implemented`);
      return false;
    }

    if (checkProjectRolePermission(projectRole.projectRoleId, PROJECT_ROLE.READ)) {
      return true;
    }

    return false;
  }

  async validateDeviceAccessPermission(
    incomingMessage: IncomingMessage,
    dataSource: DataSource,
    organizationId: OrganizationId,
    deviceId: DeviceId,
    logger: DoguLogger,
  ): Promise<ValidationResult> {
    // get jwt token from header
    const userId = await this.vlidateUserAuthToken(incomingMessage);
    if (!userId) {
      return { result: true, resultCode: 1003, message: 'Unauthorized' };
    }

    const userOrgRole = await dataSource.getRepository(OrganizationAndUserAndOrganizationRole).findOne({ where: { userId, organizationId } });
    if (!userOrgRole) {
      return { result: false, resultCode: 1003, message: `The user is not a member of the organization. UserId: ${userId}, OrganizationId: ${organizationId}` };
    }

    if (checkOrganizationRolePermission(userOrgRole.organizationRoleId, ORGANIZATION_ROLE.ADMIN)) {
      return { result: true, resultCode: 1000, message: 'success' };
    }

    const device = await dataSource //
      .getRepository(Device)
      .createQueryBuilder('device')
      .leftJoinAndSelect(`device.${DevicePropCamel.projectAndDevices}`, 'projectAndDevice')
      .leftJoinAndSelect(`projectAndDevice.${ProjectAndDevicePropCamel.project}`, 'project')
      .innerJoinAndSelect(`device.${DevicePropCamel.organization}`, 'organization')
      .where(`device.${DevicePropCamel.deviceId} = :deviceId`, { deviceId })
      .andWhere(`device.${DevicePropCamel.organizationId} = :organizationId`, { organizationId })
      .getOne();

    if (!device) {
      return { result: false, resultCode: 1003, message: `The device is not found.` };
    }

    if (device.isGlobal === 1) {
      return { result: true, resultCode: 1000, message: 'success' };
    }

    const projectIds = device.projectAndDevices?.map((deviceAndProject) => deviceAndProject.projectId).filter(notEmpty) ?? [];
    if (projectIds.length === 0) {
      return { result: false, resultCode: 1003, message: `The device is not active state.` };
    }

    const projectAndUserAndProjectRoles = await dataSource.getRepository(ProjectAndUserAndProjectRole).find({ where: { userId } });

    const projectAndUserAndProjectRole = projectAndUserAndProjectRoles.find((projectAndUserAndProjectRole) => projectIds.includes(projectAndUserAndProjectRole.projectId));
    if (!projectAndUserAndProjectRole) {
      return {
        result: false,
        resultCode: 1003,
        message: `This Device is not found in the user's project.`,
      };
    }

    return { result: true, resultCode: 1000, message: 'success' };
  }
}
