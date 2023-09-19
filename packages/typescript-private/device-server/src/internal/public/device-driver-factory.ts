import { Platform, PlatformType } from '@dogu-private/types';
import { AndroidDriver } from '../driver/android-driver';
import { IosDriver } from '../driver/ios-driver';
import { LinuxDriver } from '../driver/linux-driver';
import { MacosDriver } from '../driver/macos-driver';
import { NullDeviceDriver } from '../driver/null-device-driver';
import { WindowsDriver } from '../driver/windows-driver';
import { DeviceServerService } from './device-channel';
import { DeviceDriver } from './device-driver';

interface DeviceDriverFactory {
  create(): Promise<Map<Platform, DeviceDriver>>;
}

export class NullDeviceDriverFactory implements DeviceDriverFactory {
  async create(): Promise<Map<Platform, DeviceDriver>> {
    await Promise.resolve();
    const map = new Map<Platform, DeviceDriver>();
    map.set(Platform.PLATFORM_UNSPECIFIED, new NullDeviceDriver());
    return map;
  }
}

export class MacOSDeviceDriverFactory implements DeviceDriverFactory {
  constructor(private readonly enabledPlatforms: readonly PlatformType[], private readonly deviceServerService: DeviceServerService) {}

  async create(): Promise<Map<Platform, DeviceDriver>> {
    const map = new Map<Platform, DeviceDriver>();
    if (this.enabledPlatforms.includes('macos')) {
      map.set(Platform.PLATFORM_MACOS, await MacosDriver.create(this.deviceServerService));
    }
    if (this.enabledPlatforms.includes('android')) {
      map.set(Platform.PLATFORM_ANDROID, await AndroidDriver.create(this.deviceServerService));
    }
    if (this.enabledPlatforms.includes('ios')) {
      map.set(Platform.PLATFORM_IOS, await IosDriver.create(this.deviceServerService));
    }
    return map;
  }
}

export class LinuxDeviceDriverFactory implements DeviceDriverFactory {
  constructor(private readonly enabledPlatforms: readonly PlatformType[], private readonly deviceServerService: DeviceServerService) {}

  async create(): Promise<Map<Platform, DeviceDriver>> {
    const map = new Map<Platform, DeviceDriver>();
    if (this.enabledPlatforms.includes('linux')) {
      map.set(Platform.PLATFORM_LINUX, await LinuxDriver.create(this.deviceServerService));
    }
    if (this.enabledPlatforms.includes('android')) {
      map.set(Platform.PLATFORM_ANDROID, await AndroidDriver.create(this.deviceServerService));
    }

    return map;
  }
}

export class WindowsDeviceDriverFactory implements DeviceDriverFactory {
  constructor(private readonly enabledPlatforms: readonly PlatformType[], private readonly deviceServerService: DeviceServerService) {}

  async create(): Promise<Map<Platform, DeviceDriver>> {
    const map = new Map<Platform, DeviceDriver>();
    if (this.enabledPlatforms.includes('windows')) {
      map.set(Platform.PLATFORM_WINDOWS, await WindowsDriver.create(this.deviceServerService));
    }
    if (this.enabledPlatforms.includes('android')) {
      map.set(Platform.PLATFORM_ANDROID, await AndroidDriver.create(this.deviceServerService));
    }
    return map;
  }
}

export function createDeviceDriverFactoryByHostPlatform(
  platform: Platform,
  enabledPlatforms: readonly PlatformType[],
  deviceServerService: DeviceServerService,
): DeviceDriverFactory {
  switch (platform) {
    case Platform.PLATFORM_MACOS:
      return new MacOSDeviceDriverFactory(enabledPlatforms, deviceServerService);
    case Platform.PLATFORM_WINDOWS:
      return new WindowsDeviceDriverFactory(enabledPlatforms, deviceServerService);
    case Platform.PLATFORM_LINUX:
      return new LinuxDeviceDriverFactory(enabledPlatforms, deviceServerService);
    default:
      return new NullDeviceDriverFactory();
  }
}

export async function createDeviceDriverByDevicePlatform(platform: Platform, deviceServerService: DeviceServerService): Promise<DeviceDriver> {
  switch (platform) {
    case Platform.PLATFORM_MACOS:
      return await MacosDriver.create(deviceServerService);
    case Platform.PLATFORM_WINDOWS:
      return await WindowsDriver.create(deviceServerService);
    case Platform.PLATFORM_LINUX:
      return await LinuxDriver.create(deviceServerService);
    case Platform.PLATFORM_ANDROID:
      return await AndroidDriver.create(deviceServerService);
    case Platform.PLATFORM_IOS:
      return await IosDriver.create(deviceServerService);
    default:
      return new NullDeviceDriver();
  }
}
