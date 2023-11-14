import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { Request, Response } from 'express';
import { DataSource } from 'typeorm';
import { config } from '../../../config';
import { User } from '../../../db/entity/user.entity';
import { AuthUserService } from '../service/auth-user.service';
import { printLog } from './common';
@Injectable()
export class UserJwtGuard implements CanActivate {
  constructor(
    @Inject(AuthUserService)
    private readonly authUserService: AuthUserService,

    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    if (config.gaurd.jwt.logging) {
      printLog(ctx, 'UserJwtGuard', null);
    }

    const req = ctx.switchToHttp().getRequest<Request>();
    const res = ctx.switchToHttp().getResponse<Response>();

    const payload = await this.authUserService.validateUser(req, res);
    if (!payload) {
      return false;
    }

    const userId = payload.userId;
    await this.dataSource.manager.getRepository(User).update(userId, { lastAccessedAt: new Date() });

    req.user = payload;
    return true;
  }
}
