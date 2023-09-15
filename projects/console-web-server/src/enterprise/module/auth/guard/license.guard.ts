import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { config } from '../../../../config';
import { LICENSE_AUTHROIZE, LICENSE_AUTHROIZE_KEY } from '../../../../module/auth/auth.types';
import { printLog } from '../../../../module/auth/guard/common';

@Injectable()
export class LicenseGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector, //
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const controllerRoleType: LICENSE_AUTHROIZE = this.reflector.get<LICENSE_AUTHROIZE>(LICENSE_AUTHROIZE_KEY, ctx.getHandler());
    if (!controllerRoleType) {
      throw new HttpException(`LicenseGuard. The action is not defined.`, HttpStatus.UNAUTHORIZED);
    }

    if (config.gaurd.role.logging) {
      printLog(ctx, 'License', null);
    }
    const req = ctx.switchToHttp().getRequest<Request>();

    // await this.v1AuthOpenApiService.validateLicense(req);
    // await this.v1AuthOpenApiService.validateRequestData(req);
    return true;
  }
}
