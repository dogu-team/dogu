import { Platform } from '@dogu-private/types';
import { AppiumService } from '../../appium/appium.service';
import { AppiumDeviceWebDriverHandlerService } from '../../device-webdriver-handler/appium-device-webdriver-handler.service';
import { SeleniumDeviceWebDriverHandlerService } from '../../device-webdriver-handler/selenium-device-webdriver-handler.service';
import { GamiumService } from '../../gamium/gamium.service';
import { AndroidDriver } from '../driver/android-driver';
import { IosDriver } from '../driver/ios-driver';
import { MacosDriver } from '../driver/macos-driver';
import { NullDeviceDriver } from '../driver/null-device-driver';
import { WindowsDriver } from '../driver/windows-driver';
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
  constructor(
    private readonly deviceServerPort: number,
    private readonly appiumService: AppiumService,
    private readonly gamiumService: GamiumService,
    private readonly appiumDeviceWebDriverHandlerService: AppiumDeviceWebDriverHandlerService,
    private readonly seleniumDeviceWebDriverHandlerService: SeleniumDeviceWebDriverHandlerService,
  ) {}

  async create(): Promise<Map<Platform, DeviceDriver>> {
    const { deviceServerPort } = this;
    const map = new Map<Platform, DeviceDriver>();
    map.set(Platform.PLATFORM_MACOS, await MacosDriver.create(deviceServerPort, this.seleniumDeviceWebDriverHandlerService));
    map.set(Platform.PLATFORM_ANDROID, await AndroidDriver.create(deviceServerPort, this.appiumService, this.gamiumService, this.appiumDeviceWebDriverHandlerService));
    map.set(Platform.PLATFORM_IOS, await IosDriver.create(deviceServerPort, this.appiumService, this.gamiumService, this.appiumDeviceWebDriverHandlerService));
    return map;
  }
}

export class WindowsDeviceDriverFactory implements DeviceDriverFactory {
  constructor(
    private readonly deviceServerPort: number,
    private readonly appiumService: AppiumService,
    private readonly gamiumService: GamiumService,
    private readonly appiumDeviceWebDriverHandlerService: AppiumDeviceWebDriverHandlerService,
    private readonly seleniumDeviceWebDriverHandlerService: SeleniumDeviceWebDriverHandlerService,
  ) {}

  async create(): Promise<Map<Platform, DeviceDriver>> {
    const { deviceServerPort } = this;
    const map = new Map<Platform, DeviceDriver>();
    map.set(Platform.PLATFORM_WINDOWS, await WindowsDriver.create(deviceServerPort, this.gamiumService, this.seleniumDeviceWebDriverHandlerService));
    map.set(Platform.PLATFORM_ANDROID, await AndroidDriver.create(deviceServerPort, this.appiumService, this.gamiumService, this.appiumDeviceWebDriverHandlerService));
    return map;
  }
}

export function createDeviceDriverFactoryByHostPlatform(
  platform: Platform,
  deviceServerPort: number,
  appiumService: AppiumService,
  gamiumService: GamiumService,
  appiumDeviceWebDriverHandlerService: AppiumDeviceWebDriverHandlerService,
  seleniumDeviceWebDriverHandlerService: SeleniumDeviceWebDriverHandlerService,
): DeviceDriverFactory {
  switch (platform) {
    case Platform.PLATFORM_MACOS:
      return new MacOSDeviceDriverFactory(deviceServerPort, appiumService, gamiumService, appiumDeviceWebDriverHandlerService, seleniumDeviceWebDriverHandlerService);
    case Platform.PLATFORM_WINDOWS:
      return new WindowsDeviceDriverFactory(deviceServerPort, appiumService, gamiumService, appiumDeviceWebDriverHandlerService, seleniumDeviceWebDriverHandlerService);
    default:
      return new NullDeviceDriverFactory();
  }
}

export async function createDeviceDriverByDevicePlatform(
  platform: Platform,
  deviceServerPort: number,
  appiumService: AppiumService,
  gamiumService: GamiumService,
  appiumDeviceWebDriverHandlerService: AppiumDeviceWebDriverHandlerService,
  seleniumDeviceWebDriverHandlerService: SeleniumDeviceWebDriverHandlerService,
): Promise<DeviceDriver> {
  switch (platform) {
    case Platform.PLATFORM_MACOS:
      return await MacosDriver.create(deviceServerPort, seleniumDeviceWebDriverHandlerService);
    case Platform.PLATFORM_WINDOWS:
      return await WindowsDriver.create(deviceServerPort, gamiumService, seleniumDeviceWebDriverHandlerService);
    case Platform.PLATFORM_ANDROID:
      return await AndroidDriver.create(deviceServerPort, appiumService, gamiumService, appiumDeviceWebDriverHandlerService);
    case Platform.PLATFORM_IOS:
      return await IosDriver.create(deviceServerPort, appiumService, gamiumService, appiumDeviceWebDriverHandlerService);
    default:
      return new NullDeviceDriver();
  }
}
