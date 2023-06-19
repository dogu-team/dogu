import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { config } from '../../../config';
import { DoguLogger } from '../../logger/logger';
import { checkOrganizationRolePermission, ORGANIZATION_ROLE, ORGANIZATION_ROLE_KEY } from '../auth.types';
import { getOrganizationUserRole, printLog } from './common';

@Injectable()
export class OrganizationGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector, //
    private readonly logger: DoguLogger,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const controllerRoleType: ORGANIZATION_ROLE = this.reflector.get<ORGANIZATION_ROLE>(ORGANIZATION_ROLE_KEY, ctx.getHandler());
    if (!controllerRoleType) {
      throw new HttpException(`OrganizationGuard. The role is not defined.`, HttpStatus.UNAUTHORIZED);
    }

    if (config.gaurd.role.logging) {
      printLog(ctx, 'OrganizationGuard', controllerRoleType);
    }

    const organizationRole = await getOrganizationUserRole(ctx, this.dataSource);
    const orgRoleId = organizationRole.organizationRoleId;
    const requiredRoleName = ORGANIZATION_ROLE[controllerRoleType];

    if (organizationRole.customise === 1) {
      // custom role type validation
      this.logger.info(`Customise Organization Role Type: ${orgRoleId}`);
      this.logger.error(`not implemented. OrganizationGaurd()`);
      throw new HttpException(`not implemented`, HttpStatus.NOT_IMPLEMENTED);
    }

    if (controllerRoleType > ORGANIZATION_ROLE.MEMBER || orgRoleId > ORGANIZATION_ROLE.MEMBER) {
      this.logger.error(`not implemented. OrganizationGaurd()`);
      throw new HttpException(`not implemented`, HttpStatus.NOT_IMPLEMENTED);
    }

    const isValid = checkOrganizationRolePermission(orgRoleId, controllerRoleType);
    if (!isValid) {
      this.logger.error(`The user is not a ${requiredRoleName} role of the organization.`);
      throw new HttpException(`The user is not a ${requiredRoleName} role of the organization.`, HttpStatus.UNAUTHORIZED);
    }
    return true;
  }
}
