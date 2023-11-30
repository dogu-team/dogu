import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { DoguLogger } from '../../logger/logger';
import { AuthService } from '../auth.service';
import { PermissionOptions, PERMISSION_OPTIONS_KEY } from '../options';

@Injectable()
export class TokenGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
    private readonly logger: DoguLogger,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const option: PermissionOptions = this.reflector.get<PermissionOptions>(PERMISSION_OPTIONS_KEY, context.getHandler());
    if (!option) {
      throw new HttpException(`TokenGuard. The option is not defined.`, HttpStatus.UNAUTHORIZED);
    }

    const request = context.switchToHttp().getRequest<Request>();
    const authField = request.headers.authorization;
    if (!authField) {
      this.logger.warn('No authorization header found');
      return false;
    }

    const token = authField.replace('Custom ', '');
    const serial = request.params.serial as string | undefined;
    return this.authService.validate({ value: token }, serial, option);
  }
}
