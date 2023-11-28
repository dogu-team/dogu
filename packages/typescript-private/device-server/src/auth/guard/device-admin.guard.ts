import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { DoguLogger } from '../../logger/logger';
import { AuthService } from '../auth.service';

@Injectable()
export class DeviceAdminGuard implements CanActivate {
  constructor(
    @Inject(AuthService)
    private readonly authService: AuthService,
    private readonly logger: DoguLogger,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authField = request.headers.authorization;
    if (!authField) {
      this.logger.warn('No authorization header found');
      return false;
    }

    const token = authField.replace('Custom ', '');
    return this.authService.validateAdmin(token);
  }
}
