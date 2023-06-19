import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import { config } from '../../../config';
import { AuthUserService } from '../service/auth-user.service';
import { printLog } from './common';
@Injectable()
export class UserJwtGuard implements CanActivate {
  constructor(
    @Inject(AuthUserService)
    private readonly authUserService: AuthUserService,
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

    req.user = payload;
    return true;
  }
}
