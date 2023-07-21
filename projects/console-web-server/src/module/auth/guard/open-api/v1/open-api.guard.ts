import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { config } from '../../../../../config';
import { V1AuthOpenApiService } from '../../../service/open-api/v1/auth-open-api.service';
import { printLog } from '../../common';

@Injectable()
export class V1OpenApiGuard implements CanActivate {
  constructor(
    @Inject(V1AuthOpenApiService)
    private readonly v1AuthOpenApiService: V1AuthOpenApiService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    if (config.gaurd.role.logging) {
      printLog(ctx, 'V1OpenApiGuard', null);
    }
    const req = ctx.switchToHttp().getRequest<Request>();
    await this.v1AuthOpenApiService.validateRequestData(req);
    return true;
  }
}
