import { CREATOR_TYPE, RemotePayload } from '@dogu-private/types';
import { CanActivate, ExecutionContext, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectDataSource } from '@nestjs/typeorm';
import { Request } from 'express';
import { DataSource } from 'typeorm';
import { config } from '../../../../config';
import { DoguLogger } from '../../../logger/logger';
import { PROJECT_ROLE, REMOTE_PROJECT_ROLE_KEY } from '../../auth.types';
import { AuthRemoteService } from '../../service/auth-remote.service';
import { ApiPermission, printLog } from '../common';

@Injectable()
export class RemoteProjectGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector, //
    private readonly logger: DoguLogger,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @Inject(AuthRemoteService)
    private readonly authRemoteService: AuthRemoteService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const controllerRoleType: PROJECT_ROLE = this.reflector.get<PROJECT_ROLE>(REMOTE_PROJECT_ROLE_KEY, ctx.getHandler());
    if (!controllerRoleType) {
      throw new HttpException(`RemoteProjectGuard. The role is not defined.`, HttpStatus.UNAUTHORIZED);
    }

    if (config.gaurd.role.logging) {
      printLog(ctx, 'RemoteProjectGuard', controllerRoleType);
    }

    const req = ctx.switchToHttp().getRequest<Request>();
    const tokenByRequest = this.authRemoteService.getToken(req);
    const orgIdByRequest = this.authRemoteService.getOrganizationId(req);
    const projectIdByRequest = this.authRemoteService.getProjectId(req);

    const rv = await ApiPermission.validateProjectApiPermission(this.dataSource.manager, tokenByRequest, controllerRoleType, orgIdByRequest, projectIdByRequest);

    if (rv.organizationId) {
      const payload: RemotePayload = {
        organizationId: rv.organizationId,
        creatorType: CREATOR_TYPE.ORGANIZATION,
      };
      req.user = payload;
      return true;
    } else if (rv.projectId) {
      const payload: RemotePayload = {
        projectId: rv.projectId,
        creatorType: CREATOR_TYPE.PROJECT,
      };
      req.user = payload;
      return true;
    } else if (rv.userId) {
      const payload: RemotePayload = {
        userId: rv.userId,
        creatorType: CREATOR_TYPE.USER,
      };
      req.user = payload;
      return true;
    } else {
      throw new HttpException(`RemoteOrganizationGuard. The role is not defined.`, HttpStatus.UNAUTHORIZED);
    }
  }
}
