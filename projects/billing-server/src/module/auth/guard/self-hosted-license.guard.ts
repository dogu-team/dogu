import { SelfHostedLicenseBase } from '@dogu-private/console';
import { applyDecorators, BadRequestException, CanActivate, createParamDecorator, ExecutionContext, Injectable, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { SelfHostedLicenseService } from '../../self-hosted-license/self-hosted-license.service';
import { parseAuthorization } from '../utils';

export interface SelfHostedLicenseUser extends Express.User, Pick<SelfHostedLicenseBase, 'organizationId' | 'licenseKey'> {
  type: 'self-hosted-license';
}

@Injectable()
export class SelfHostedLicenseGuard implements CanActivate {
  constructor(private readonly selfHostedLicenseService: SelfHostedLicenseService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const request = ctx.switchToHttp().getRequest<Request>();
    const parsed = parseAuthorization(request);
    if (parsed.type === 'activated') {
      return true;
    }

    if (parsed.type !== 'basic') {
      return false;
    }

    const { username, password } = parsed;
    if (!username || !password) {
      throw new BadRequestException(`invalid token`);
    }

    const license = await this.selfHostedLicenseService.findLicense({ organizationId: username, licenseKey: password });
    const selfHostedLicenseUser: SelfHostedLicenseUser = {
      type: 'self-hosted-license',
      organizationId: license.organizationId,
      licenseKey: license.licenseKey,
    };
    request.user = selfHostedLicenseUser;
    return true;
  }
}

export function SelfHostedLicensePermission(): MethodDecorator {
  return applyDecorators(UseGuards(SelfHostedLicenseGuard));
}

export const SelfHostedLicenseUser = createParamDecorator((data: unknown, ctx: ExecutionContext): SelfHostedLicenseUser => {
  const request = ctx.switchToHttp().getRequest<{ user: SelfHostedLicenseUser }>();
  return request.user;
});
