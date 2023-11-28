import { applyDecorators, UseGuards } from '@nestjs/common';
import { DeviceAuthGuard } from './guard/device-auth.guard';

export function DevicePermission(): PropertyDecorator {
  return applyDecorators(UseGuards(DeviceAuthGuard));
}
