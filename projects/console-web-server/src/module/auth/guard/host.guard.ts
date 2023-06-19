import { CanActivate, ExecutionContext, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectDataSource } from '@nestjs/typeorm';
import { Request } from 'express';
import { DataSource } from 'typeorm';
import { config } from '../../../config';
import { DoguLogger } from '../../logger/logger';
import { HOST_ACTION_KEY, HOST_ACTION_TYPE } from '../auth.types';
import { AuthHostService } from '../service/auth-host.service';
import { printLog } from './common';

@Injectable()
export class HostGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector, //
    private readonly logger: DoguLogger,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @Inject(AuthHostService)
    private readonly authHostService: AuthHostService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const controllerRoleType: HOST_ACTION_TYPE = this.reflector.get<HOST_ACTION_TYPE>(HOST_ACTION_KEY, ctx.getHandler());
    if (!controllerRoleType) {
      throw new HttpException(`HostGuard. The action is not defined.`, HttpStatus.UNAUTHORIZED);
    }

    if (config.gaurd.role.logging) {
      printLog(ctx, 'HostGuard', null);
    }

    const req = ctx.switchToHttp().getRequest<Request>();

    const payload = await this.authHostService.validateHost(ctx, controllerRoleType);
    if (!payload) {
      return false;
    }

    req.user = payload;
    return true;
  }
}
