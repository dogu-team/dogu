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
import { DeviceId, HostId, HostPayload, LiveSessionId, LiveSessionState, OrganizationId, ProjectId, UserId, WS_PING_MESSAGE } from '@dogu-private/types';
import { notEmpty } from '@dogu-tech/common';
import { Inject, Injectable } from '@nestjs/common';
import { IncomingMessage } from 'http';
import { DataSource } from 'typeorm';
import WebSocket from 'ws';

import { config } from '../../config';
import { Device, OrganizationAndUserAndOrganizationRole, ProjectAndUserAndProjectRole } from '../../db/entity/index';
import { LiveSession } from '../../db/entity/live-session.entity';
import { User } from '../../db/entity/user.entity';
import { HOST_ACTION_TYPE, ORGANIZATION_ROLE, PROJECT_ROLE } from '../../module/auth/auth.types';
import { UserPermission } from '../../module/auth/guard/common';
import { AuthHostService } from '../../module/auth/service/auth-host.service';
import { AuthUserService } from '../../module/auth/service/auth-user.service';
import { DoguLogger } from '../../module/logger/logger';
import { DoguWsException } from './ws-exception';

export type ValidationResult = { result: boolean; resultCode: number; message: string; userId: UserId | null };

@Injectable()
export class WsCommonService {
  constructor(
    private readonly logger: DoguLogger, //
    @Inject(AuthUserService)
    private readonly authUserService: AuthUserService,
    private readonly authHostService: AuthHostService,
  ) {}

  private async validateUserAuthToken(incomingMessage: IncomingMessage): Promise<UserId | null> {
    const userAuthToken = this.authUserService.getUserAuthTokenByWsConnection(incomingMessage);
    if (!userAuthToken) {
      this.logger.error(`vlidateUserAuthToken. The userAuthToken is not found.`);
      return null;
    }
    // Validate only with refresh token.
    // If the access token verification fails, there is no way to reissue the token.
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
    const userId = await this.validateUserAuthToken(incomingMessage);
    if (!userId) {
      return { result: true, resultCode: 1003, message: 'Unauthorized', userId: null };
    }

    const isValid = await this.checkUserPermission(dataSource, logger, userId, organizationId, projectId);
    if (!isValid) {
      return { result: true, resultCode: 1003, message: 'Unauthorized', userId };
    }

    return { result: true, resultCode: 1000, message: 'success', userId };
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
    if (UserPermission.checkOrganizationRolePermission(orgRoleId, ORGANIZATION_ROLE.ADMIN)) {
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

    if (UserPermission.checkProjectRolePermission(projectRole.projectRoleId, PROJECT_ROLE.READ)) {
      return true;
    }

    return false;
  }

  async validateDeviceAccessPermission(
    incomingMessage: IncomingMessage,
    dataSource: DataSource,
    organizationId: OrganizationId,
    deviceId: DeviceId,
    liveSessionId: LiveSessionId | null,
  ): Promise<ValidationResult> {
    if (liveSessionId) {
      return await this.validateCloudDeviceAccessPermission(incomingMessage, dataSource, organizationId, liveSessionId);
    } else {
      return await this.validateOrganizationDeviceAccessPermission(incomingMessage, dataSource, organizationId, deviceId);
    }
  }

  async validateOrganizationDeviceAccessPermission(
    incomingMessage: IncomingMessage,
    dataSource: DataSource,
    organizationId: OrganizationId,
    deviceId: DeviceId,
  ): Promise<ValidationResult> {
    // get jwt token from header
    const userId = await this.validateUserAuthToken(incomingMessage);
    if (!userId) {
      return { result: true, resultCode: 1003, message: 'Unauthorized', userId: null };
    }

    const userOrgRole = await dataSource.getRepository(OrganizationAndUserAndOrganizationRole).findOne({ where: { userId, organizationId } });
    if (!userOrgRole) {
      return { result: false, resultCode: 1003, message: `The user is not a member of the organization. UserId: ${userId}, OrganizationId: ${organizationId}`, userId };
    }

    if (UserPermission.checkOrganizationRolePermission(userOrgRole.organizationRoleId, ORGANIZATION_ROLE.ADMIN)) {
      return { result: true, resultCode: 1000, message: 'success', userId };
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
      return { result: false, resultCode: 1003, message: `The device is not found.`, userId };
    }

    if (device.isGlobal === 1) {
      return { result: true, resultCode: 1000, message: 'success', userId };
    }

    const projectIds = device.projectAndDevices?.map((deviceAndProject) => deviceAndProject.projectId).filter(notEmpty) ?? [];
    if (projectIds.length === 0) {
      return { result: false, resultCode: 1003, message: `The device is not active state.`, userId };
    }

    const projectAndUserAndProjectRoles = await dataSource.getRepository(ProjectAndUserAndProjectRole).find({ where: { userId } });

    const projectAndUserAndProjectRole = projectAndUserAndProjectRoles.find((projectAndUserAndProjectRole) => projectIds.includes(projectAndUserAndProjectRole.projectId));
    if (!projectAndUserAndProjectRole) {
      return {
        result: false,
        resultCode: 1003,
        message: `This Device is not found in the user's project.`,
        userId,
      };
    }

    return { result: true, resultCode: 1000, message: 'success', userId };
  }

  async validateCloudDeviceAccessPermission(
    incomingMessage: IncomingMessage,
    dataSource: DataSource,
    organizationId: OrganizationId,
    sessionId: LiveSessionId,
  ): Promise<ValidationResult> {
    const userId = await this.validateUserAuthToken(incomingMessage);
    if (!userId) {
      return { result: true, resultCode: 1003, message: 'Unauthorized', userId: null };
    }

    const liveSession = await dataSource.getRepository(LiveSession).findOne({ where: { liveSessionId: sessionId, organizationId } });
    if (!liveSession) {
      return { result: false, resultCode: 1003, message: `The live session is not found. ${sessionId}`, userId };
    }

    if (liveSession.state === LiveSessionState.CLOSED) {
      return { result: false, resultCode: 1003, message: `The live session is closed. ${sessionId}`, userId };
    }

    const userOrgRole = await dataSource.getRepository(OrganizationAndUserAndOrganizationRole).findOne({ where: { userId, organizationId } });
    if (!userOrgRole) {
      return { result: false, resultCode: 1003, message: `The user is not a member of the organization. UserId: ${userId}, OrganizationId: ${organizationId} }`, userId };
    }

    return { result: true, resultCode: 1000, message: 'success', userId };
  }

  public async validateHostWithWebsocket(
    organizationId: OrganizationId,
    projectId: ProjectId,
    hostId: HostId,
    deviceId: DeviceId,
    incomingMessage: IncomingMessage,
    type: HOST_ACTION_TYPE,
  ): Promise<HostPayload | null> {
    const authHeader = incomingMessage.headers.authorization;
    if (!authHeader) {
      throw new DoguWsException(1003, 'Unauthorized');
    }
    return this.authHostService.validateHost(organizationId, projectId, hostId, deviceId, authHeader, type);
  }

  sendPing = (webSocket: WebSocket, name: string): void => {
    const interval = setInterval(() => {
      if (webSocket.readyState === WebSocket.CLOSED) {
        this.logger.debug('clearInterval sendPing', { name, interval });
        clearInterval(interval);
        return;
      }
      webSocket.send(WS_PING_MESSAGE);
    }, config.ws.ping.intervalMilliseconds);
  };
}
