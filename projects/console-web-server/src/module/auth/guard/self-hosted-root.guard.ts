import { UserPayload } from '@dogu-private/types';
import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { config } from '../../../config';
import { DoguLogger } from '../../logger/logger';
import { SELF_HOSTED_ROLE, SELF_HOSTED_ROLE_KEY } from '../auth.types';
import { printLog, UserPermission } from './common';

@Injectable()
export class SelfHostedRoleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector, //
    private readonly logger: DoguLogger,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const controllerRoleType: SELF_HOSTED_ROLE = this.reflector.get<SELF_HOSTED_ROLE>(SELF_HOSTED_ROLE_KEY, ctx.getHandler());
    if (!controllerRoleType) {
      throw new HttpException(`SelfHostedRoleGuard. The role is not defined.`, HttpStatus.UNAUTHORIZED);
    }
    if (config.gaurd.role.logging) {
      printLog(ctx, 'SelfHostedRoleGuard', controllerRoleType);
    }

    const userId = ctx.switchToHttp().getRequest<{ user: UserPayload }>().user.userId;

    const isRoot = await UserPermission.isSelfHostedRootUser(this.dataSource.manager, userId);
    if (!isRoot) {
      throw new HttpException(`The user is not a root user.`, HttpStatus.UNAUTHORIZED);
    }
    return isRoot;
  }
}
