import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { config } from '../../../../config';
import { AuthRemoteService } from '../../service/auth-remote.service';
import { printLog } from '../common';

@Injectable()
export class RemoteGuard implements CanActivate {
  constructor(
    @Inject(AuthRemoteService)
    private readonly authRemoteService: AuthRemoteService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    if (config.gaurd.role.logging) {
      printLog(ctx, 'RemoteGuard', null);
    }

    const req = ctx.switchToHttp().getRequest<Request>();

    await this.authRemoteService.validateRequestData(req);
    const doguOptions = await this.authRemoteService.getDoguOptions(req);

    req.user = doguOptions;
    return true;
  }
}
