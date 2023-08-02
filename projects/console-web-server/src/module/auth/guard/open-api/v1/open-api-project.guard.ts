import { V1CALLER_TYPE, V1OpenApiPayload, V1_OPEN_API_PROJECT_ROLE_KEY } from '@dogu-private/types';
import { CanActivate, ExecutionContext, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectDataSource } from '@nestjs/typeorm';
import { Request } from 'express';
import { DataSource } from 'typeorm';
import { config } from '../../../../../config';
import { DoguLogger } from '../../../../logger/logger';
import { PROJECT_ROLE } from '../../../auth.types';
import { V1AuthOpenApiService } from '../../../service/open-api/v1/auth-open-api.service';
import { ApiPermission, printLog } from '../../common';

@Injectable()
export class V1OpenApiProjectGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector, //
    private readonly logger: DoguLogger,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @Inject(V1AuthOpenApiService)
    private readonly v1AuthOpenApiService: V1AuthOpenApiService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const controllerRoleType: PROJECT_ROLE = this.reflector.get<PROJECT_ROLE>(V1_OPEN_API_PROJECT_ROLE_KEY, ctx.getHandler());
    if (!controllerRoleType) {
      throw new HttpException(`V1OpenApiProjectGuard. The role is not defined.`, HttpStatus.UNAUTHORIZED);
    }
    if (config.gaurd.role.logging) {
      printLog(ctx, 'V1OpenApiProjectGuard', null);
    }

    const req = ctx.switchToHttp().getRequest<Request>();

    const tokenByRequest = this.v1AuthOpenApiService.getToken(req);
    const orgIdByRequest = req.params.organizationId;
    const projectIdByRequest = req.params.projectId;

    const rv = await ApiPermission.validateProjectApiPermission(this.dataSource.manager, tokenByRequest, controllerRoleType, orgIdByRequest, projectIdByRequest);

    if (rv.organizationId) {
      const payload: V1OpenApiPayload = {
        organizationId: rv.organizationId,
        callerType: V1CALLER_TYPE.ORGANIZATION,
      };
      req.user = payload;
      return true;
    } else if (rv.projectId) {
      const payload: V1OpenApiPayload = {
        projectId: rv.projectId,
        callerType: V1CALLER_TYPE.PROJECT,
      };
      req.user = payload;
      return true;
    } else if (rv.userId) {
      const payload: V1OpenApiPayload = {
        userId: rv.userId,
        callerType: V1CALLER_TYPE.USER,
      };
      req.user = payload;
      return true;
    } else {
      throw new HttpException(`V1OpenApiProjectGuard. The role is not defined.`, HttpStatus.UNAUTHORIZED);
    }
  }
}
