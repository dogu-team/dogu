import { V1CALLER_TYPE, V1OpenApiPayload, V1_OPEN_API_ORGANIZATION_ROLE_KEY } from '@dogu-private/types';
import { CanActivate, ExecutionContext, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectDataSource } from '@nestjs/typeorm';
import { Request } from 'express';
import { DataSource } from 'typeorm';
import { config } from '../../../../../../config';
import { ORGANIZATION_ROLE } from '../../../../../../module/auth/auth.types';
import { ApiPermission, printLog } from '../../../../../../module/auth/guard/common';
import { DoguLogger } from '../../../../../../module/logger/logger';
import { V1AuthOpenApiService } from '../../../service/open-api/v1/auth-open-api.service';

@Injectable()
export class V1OpenApiOrganizationGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector, //
    private readonly logger: DoguLogger,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @Inject(V1AuthOpenApiService)
    private readonly v1AuthOpenApiService: V1AuthOpenApiService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const controllerRoleType: ORGANIZATION_ROLE = this.reflector.get<ORGANIZATION_ROLE>(V1_OPEN_API_ORGANIZATION_ROLE_KEY, ctx.getHandler());
    if (!controllerRoleType) {
      throw new HttpException(`V1OpenApiOrganizationGuard. The role is not defined.`, HttpStatus.UNAUTHORIZED);
    }

    if (config.gaurd.role.logging) {
      printLog(ctx, 'V1OpenApiOrganizationGuard', null);
    }

    const req = ctx.switchToHttp().getRequest<Request>();

    const tokenByRequest = this.v1AuthOpenApiService.getToken(req);

    const orgIdByRequest = req.params.organizationId;
    const projectIdByRequest = req.params.projectId;

    const rv = await ApiPermission.validateOrganizationApiPermission(this.dataSource.manager, tokenByRequest, controllerRoleType, orgIdByRequest, projectIdByRequest);

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
      throw new HttpException(`V1OpenApiOrganizationGuard. The role is not defined.`, HttpStatus.UNAUTHORIZED);
    }
  }
}
