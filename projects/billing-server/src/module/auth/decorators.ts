import { LicensePayload } from '@dogu-private/types';
import { applyDecorators, createParamDecorator, ExecutionContext, SetMetadata, UseGuards } from '@nestjs/common';
import { LICENSE_ACTION, LICENSE_ACTION_KEY } from './auth.types';
import { LicenseGuard } from './guard/license.guard';

export const License = createParamDecorator((data: unknown, ctx: ExecutionContext): LicensePayload => {
  const request = ctx.switchToHttp().getRequest<{ user: LicensePayload }>();
  return request.user;
});

export function LicenseAction(roleType: LICENSE_ACTION): PropertyDecorator {
  return applyDecorators(SetMetadata(LICENSE_ACTION_KEY, roleType), UseGuards(LicenseGuard));
}
