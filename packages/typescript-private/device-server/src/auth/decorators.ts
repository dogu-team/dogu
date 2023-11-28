import { applyDecorators, UseGuards } from '@nestjs/common';
import { DeviceAdminGuard } from './guard/device-admin.guard';
import { DeviceHostGuard } from './guard/device-host.guard';
import { DeviceGuard } from './guard/device.guard';

export function DevicePermission(): PropertyDecorator {
  return applyDecorators(UseGuards(DeviceGuard));
}

export function DeviceHostPermission(): PropertyDecorator {
  return applyDecorators(UseGuards(DeviceHostGuard));
}

export function DeviceAdminPermission(): PropertyDecorator {
  return applyDecorators(UseGuards(DeviceAdminGuard));
}
