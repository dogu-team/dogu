import { DeviceBase, DeviceUsageState } from '@dogu-private/console';
import { DeviceConnectionState, Platform } from '@dogu-private/types';

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

export const isCloudDeviceAvailable = (device: Pick<DeviceBase, 'connectionState' | 'usageState'>) => {
  return (
    device.usageState === DeviceUsageState.AVAILABLE &&
    device.connectionState === DeviceConnectionState.DEVICE_CONNECTION_STATE_CONNECTED
  );
};
