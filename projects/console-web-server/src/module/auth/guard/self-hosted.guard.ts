import { UserId, UserPayload } from '@dogu-private/types';
import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { config } from '../../../config';
import { User } from '../../../db/entity/user.entity';
import { FEATURE_CONFIG } from '../../../feature.config';
import { DoguLogger } from '../../logger/logger';
import { SELF_HOSTED_ROLE, SELF_HOSTED_ROLE_KEY } from '../auth.types';
import { printLog } from './common';

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

    if (FEATURE_CONFIG.get('licenseModule') !== 'self-hosted') {
      throw new HttpException(`LicenseGuard. The action is only allowed in self-hosted.`, HttpStatus.BAD_REQUEST);
    }

    switch (controllerRoleType) {
      case SELF_HOSTED_ROLE.ROOT: {
        const userId = ctx.switchToHttp().getRequest<{ user: UserPayload }>().user.userId;
        const isRoot = await this.isRootUser(userId);
        if (!isRoot) {
          throw new HttpException(`The user is not a root user.`, HttpStatus.UNAUTHORIZED);
        }
        return isRoot;
      }
      case SELF_HOSTED_ROLE.MEMBER: {
        return true;
      }
    }
  }

  async isRootUser(userId: UserId): Promise<boolean> {
    const user = await this.dataSource.manager.getRepository(User).findOne({ where: { userId } });
    if (!user) {
      throw new HttpException(`The user is not exist.`, HttpStatus.UNAUTHORIZED);
    }
    return user.isRoot ? true : false;
  }
}
