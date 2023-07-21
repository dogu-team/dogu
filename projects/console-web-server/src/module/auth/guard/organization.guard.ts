import { UserPayload } from '@dogu-private/types';
import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { config } from '../../../config';
import { DoguLogger } from '../../logger/logger';
import { ORGANIZATION_ROLE, ORGANIZATION_ROLE_KEY } from '../auth.types';
import { getOrganizationIdFromRequest, printLog, UserPermission } from './common';

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

    const userId = ctx.switchToHttp().getRequest<{ user: UserPayload }>().user.userId;
    const organizationId = getOrganizationIdFromRequest(ctx);

    const organizationRole = await UserPermission.getOrganizationUserRole(this.dataSource.manager, organizationId, userId);
    UserPermission.validateOrganizationRolePermission(organizationRole, controllerRoleType);
    return true;
  }
}
