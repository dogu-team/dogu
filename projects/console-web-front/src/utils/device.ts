import { DeviceBase } from '@dogu-private/console';
import { Platform } from '@dogu-private/types';

export const isDesktop = (device: DeviceBase | undefined) => {
  if (device) {
    return (
      device.platform === Platform.PLATFORM_LINUX ||
      device.platform === Platform.PLATFORM_MACOS ||
      device.platform === Platform.PLATFORM_WINDOWS
    );
  }

  return false;
};
