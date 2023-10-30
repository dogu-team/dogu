import { BillingTokenBase } from '@dogu-private/console';
import { applyDecorators, CanActivate, ExecutionContext, Injectable, UnauthorizedException, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { BillingTokenService } from '../../billing-token/billing-token.service';
import { parseAuthorization } from '../utils';

export interface BillingTokenUser extends Express.User, Pick<BillingTokenBase, 'billingTokenId'> {
  type: 'billing-token';
}

@Injectable()
export class BillingTokenGuard implements CanActivate {
  constructor(private readonly billingTokenService: BillingTokenService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const request = ctx.switchToHttp().getRequest<Request>();
    const parsed = parseAuthorization(request);
    if (parsed.type === 'activated') {
      return true;
    }

    if (parsed.type !== 'bearer') {
      return false;
    }

    const billingToken = await this.billingTokenService.findValidBillingToken(parsed.token);
    if (!billingToken) {
      throw new UnauthorizedException(`token is invalid`);
    }

    const billingTokenUser: BillingTokenUser = {
      type: 'billing-token',
      billingTokenId: billingToken.billingTokenId,
    };
    request.user = billingTokenUser;
    return true;
  }
}

export function BillingTokenPermission(): MethodDecorator {
  return applyDecorators(UseGuards(BillingTokenGuard));
}
