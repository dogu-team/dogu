import { GOOGLE, GoogleOAuthPayload, HostPayload, UserPayload } from '@dogu-private/types';
import { applyDecorators, createParamDecorator, ExecutionContext, SetMetadata, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  API_TOKEN_KEY,
  API_TOKEN_TYPE,
  EMAIL_VERIFICATION,
  EMAIL_VERIFICATION_KEY,
  HOST_ACTION_KEY,
  HOST_ACTION_TYPE,
  ORGANIZATION_ROLE,
  ORGANIZATION_ROLE_KEY,
  PROJECT_ROLE,
  PROJECT_ROLE_KEY,
} from './auth.types';
import { ApiTokenGuard } from './guard/api-token.guard';
import { DeviceAcessGuard } from './guard/device.guard';
import { EmailVerificationGuard } from './guard/email-verification.guard';
import { HostGuard } from './guard/host.guard';
import { OrganizationGuard } from './guard/organization.guard';
import { ProjectGuard } from './guard/project.guard';
import { UserJwtGuard } from './guard/user-jwt.guard';

export function ApiTokenPermission(apiTokenType: API_TOKEN_TYPE): PropertyDecorator {
  return applyDecorators(SetMetadata(API_TOKEN_KEY, apiTokenType), UseGuards(ApiTokenGuard));
}

export function DeviceAccessPermission(): PropertyDecorator {
  return applyDecorators(UseGuards(UserJwtGuard), OrganizationPermission(ORGANIZATION_ROLE.MEMBER), UseGuards(DeviceAcessGuard));
}

export function HostPermission(actionType: HOST_ACTION_TYPE): PropertyDecorator {
  return applyDecorators(SetMetadata(HOST_ACTION_KEY, actionType), UseGuards(HostGuard));
}

export function OrganizationPermission(roleType: ORGANIZATION_ROLE): PropertyDecorator {
  return applyDecorators(SetMetadata(ORGANIZATION_ROLE_KEY, roleType), UseGuards(UserJwtGuard), UseGuards(OrganizationGuard));
}

export function ProjectPermission(roleType: PROJECT_ROLE): PropertyDecorator {
  return applyDecorators(SetMetadata(PROJECT_ROLE_KEY, roleType), UseGuards(UserJwtGuard), UseGuards(ProjectGuard));
}

export function EmailVerification(verificationType: EMAIL_VERIFICATION): PropertyDecorator {
  return applyDecorators(SetMetadata(EMAIL_VERIFICATION_KEY, verificationType), UseGuards(UserJwtGuard), UseGuards(EmailVerificationGuard));
}

export function GoogleOAuth(): PropertyDecorator {
  return applyDecorators(UseGuards(AuthGuard(GOOGLE)));
}

export const User = createParamDecorator((data: unknown, ctx: ExecutionContext): UserPayload => {
  const request = ctx.switchToHttp().getRequest<{ user: UserPayload }>();
  return request.user;
});

export const Host = createParamDecorator((data: unknown, ctx: ExecutionContext): HostPayload => {
  const request = ctx.switchToHttp().getRequest<{ user: HostPayload }>();
  return request.user;
});

export const GoogleUser = createParamDecorator((data: unknown, ctx: ExecutionContext): GoogleOAuthPayload => {
  const request = ctx.switchToHttp().getRequest<{ user: GoogleOAuthPayload }>();
  return request.user;
});
