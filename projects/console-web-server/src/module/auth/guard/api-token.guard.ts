import { CanActivate, ExecutionContext, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectDataSource } from '@nestjs/typeorm';
import { Request } from 'express';
import { DataSource } from 'typeorm';
import { config } from '../../../config';
import { DoguLogger } from '../../logger/logger';
import { API_TOKEN_KEY, API_TOKEN_TYPE } from '../auth.types';
import { AuthApiTokenService } from '../service/auth-api-token.service';
import { printLog } from './common';

@Injectable()
export class ApiTokenGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector, //
    private readonly logger: DoguLogger,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @Inject(AuthApiTokenService)
    private readonly authApiTokenService: AuthApiTokenService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const controllerRoleType: API_TOKEN_TYPE = this.reflector.get<API_TOKEN_TYPE>(API_TOKEN_KEY, ctx.getHandler());
    if (!controllerRoleType) {
      throw new HttpException(`ApiTokenGuard. The action is not defined.`, HttpStatus.UNAUTHORIZED);
    }

    if (config.gaurd.role.logging) {
      printLog(ctx, 'ApiTokenGuard', null);
    }

    const req = ctx.switchToHttp().getRequest<Request>();

    const payload = await this.authApiTokenService.validateApiToken(ctx, controllerRoleType);
    if (!payload) {
      return false;
    }

    req.user = payload;
    return true;
  }
}
