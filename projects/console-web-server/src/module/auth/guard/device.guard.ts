import { DevicePropCamel, ProjectAndDevicePropCamel } from '@dogu-private/console';
import { DeviceId, OrganizationId, UserPayload } from '@dogu-private/types';
import { notEmpty } from '@dogu-tech/common';
import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { config } from '../../../config';
import { Device } from '../../../db/entity/device.entity';
import { ProjectAndUserAndProjectRole } from '../../../db/entity/index';
import { DoguLogger } from '../../logger/logger';
import { checkOrganizationRolePermission, ORGANIZATION_ROLE } from '../auth.types';
import { getOrganizationUserRole, printLog } from './common';

/**
 * @description organization member는 통과했다는 가정하에 device에 대한 접근 권한을 체크한다.
 */

@Injectable()
export class DeviceAcessGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector, //
    private readonly logger: DoguLogger,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    if (config.gaurd.role.logging) {
      printLog(ctx, 'DeviceAcessGuard', null);
    }

    const userId = ctx.switchToHttp().getRequest<{ user: UserPayload }>().user.userId;
    const deviceId = ctx.switchToHttp().getRequest<{ deviceId: DeviceId }>().deviceId;
    const organizationId = ctx.switchToHttp().getRequest<{ organizationId: OrganizationId }>().organizationId;

    // is org admin

    const organizationRole = await getOrganizationUserRole(ctx, this.dataSource);
    const orgRoleId = organizationRole.organizationRoleId;

    const isValid = checkOrganizationRolePermission(orgRoleId, ORGANIZATION_ROLE.ADMIN);
    if (isValid) {
      return true;
    }

    const device = await this.dataSource //
      .getRepository(Device)
      .createQueryBuilder('device')
      .leftJoinAndSelect(`device.${DevicePropCamel.projectAndDevices}`, 'projectAndDevice')
      .leftJoinAndSelect(`projectAndDevice.${ProjectAndDevicePropCamel.project}`, 'project')
      .innerJoinAndSelect(`device.${DevicePropCamel.organization}`, 'organization')
      .where(`device.${DevicePropCamel.deviceId} = :deviceId`, { deviceId })
      .andWhere(`organization.${DevicePropCamel.organizationId} = :organizationId`, { organizationId })
      .getOne();

    if (!device) {
      this.logger.error(`DeviceAcessGuard. The device is not found. DeviceId: ${deviceId}, OrganizationId: ${organizationId}`);
      throw new HttpException(`The device is not found.`, HttpStatus.NOT_FOUND);
    }

    if (device.isGlobal === 1) {
      return true;
    }

    const projectIds = device.projectAndDevices?.map((deviceAndProject) => deviceAndProject.projectId).filter(notEmpty) ?? [];
    if (projectIds.length === 0) {
      this.logger.error(`DeviceAcessGuard. The device is not active state. DeviceId: ${deviceId}, OrganizationId: ${organizationId}`);
      throw new HttpException(`The device is not active state. DeviceId: ${deviceId}, OrganizationId: ${organizationId}`, HttpStatus.BAD_REQUEST);
    }

    const projectAndUserAndProjectRoles = await this.dataSource.getRepository(ProjectAndUserAndProjectRole).find({ where: { userId } });

    const projectAndUserAndProjectRole = projectAndUserAndProjectRoles.find((projectAndUserAndProjectRole) => projectIds.includes(projectAndUserAndProjectRole.projectId));
    if (!projectAndUserAndProjectRole) {
      this.logger.error(`DeviceAcessGuard. This Device is not found in the user's project. DeviceId: ${deviceId}, OrganizationId: ${organizationId}`);
      throw new HttpException(`This Device is not found in the user's project. DeviceId: ${deviceId}, OrganizationId: ${organizationId}`, HttpStatus.UNAUTHORIZED);
    }

    return true;
  }
}
