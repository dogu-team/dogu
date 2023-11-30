import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { TokenGuard } from './guard/token.guard';
import { PermissionOptions, PERMISSION_OPTIONS_KEY } from './options';

export function DevicePermission(option: PermissionOptions): PropertyDecorator {
  return applyDecorators(SetMetadata(PERMISSION_OPTIONS_KEY, option), UseGuards(TokenGuard));
}
