import { Platform, PlatformType } from '@dogu-private/types';
import { DeviceWebDriver } from '../../alias';
import { AppiumService } from '../../appium/appium.service';
import { GamiumService } from '../../gamium/gamium.service';
import { HttpRequestRelayService } from '../../http-request-relay/http-request-relay.common';
import { DoguLogger } from '../../logger/logger';
import { SeleniumService } from '../../selenium/selenium.service';
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
    private readonly enabledPlatforms: readonly PlatformType[],
    private readonly appiumService: AppiumService,
    private readonly gamiumService: GamiumService,
    private readonly httpRequestRelayService: HttpRequestRelayService,
    private readonly appiumDeviceWebDriverHandlerService: DeviceWebDriver.AppiumEndpointHandlerService,
    private readonly seleniumEndpointHandlerService: DeviceWebDriver.SeleniumEndpointHandlerService,
    private readonly seleniumService: SeleniumService,
    private readonly doguLogger: DoguLogger,
  ) {}

  async create(): Promise<Map<Platform, DeviceDriver>> {
    const map = new Map<Platform, DeviceDriver>();
    if (this.enabledPlatforms.includes('macos')) {
      map.set(Platform.PLATFORM_MACOS, await MacosDriver.create(this.httpRequestRelayService, this.seleniumEndpointHandlerService, this.seleniumService, this.doguLogger));
    }
    if (this.enabledPlatforms.includes('android')) {
      map.set(
        Platform.PLATFORM_ANDROID,
        await AndroidDriver.create(this.appiumService, this.gamiumService, this.httpRequestRelayService, this.appiumDeviceWebDriverHandlerService, this.doguLogger),
      );
    }
    // if (this.enabledPlatforms.includes('ios')) {
    //   map.set(
    //     Platform.PLATFORM_IOS,
    //     await IosDriver.create(this.appiumService, this.gamiumService, this.httpRequestRelayService, this.appiumDeviceWebDriverHandlerService, this.doguLogger),
    //   );
    // }
    return map;
  }
}

export class WindowsDeviceDriverFactory implements DeviceDriverFactory {
  constructor(
    private readonly enabledPlatforms: readonly PlatformType[],
    private readonly appiumService: AppiumService,
    private readonly gamiumService: GamiumService,
    private readonly httpRequestRelayService: HttpRequestRelayService,
    private readonly appiumDeviceWebDriverHandlerService: DeviceWebDriver.AppiumEndpointHandlerService,
    private readonly seleniumEndpointHandlerService: DeviceWebDriver.SeleniumEndpointHandlerService,
    private readonly seleniumService: SeleniumService,
    private readonly doguLogger: DoguLogger,
  ) {}

  async create(): Promise<Map<Platform, DeviceDriver>> {
    const map = new Map<Platform, DeviceDriver>();
    if (this.enabledPlatforms.includes('windows')) {
      map.set(
        Platform.PLATFORM_WINDOWS,
        await WindowsDriver.create(this.gamiumService, this.httpRequestRelayService, this.seleniumEndpointHandlerService, this.seleniumService, this.doguLogger),
      );
    }
    if (this.enabledPlatforms.includes('android')) {
      map.set(
        Platform.PLATFORM_ANDROID,
        await AndroidDriver.create(this.appiumService, this.gamiumService, this.httpRequestRelayService, this.appiumDeviceWebDriverHandlerService, this.doguLogger),
      );
    }
    return map;
  }
}

export function createDeviceDriverFactoryByHostPlatform(
  platform: Platform,
  enabledPlatforms: readonly PlatformType[],
  appiumService: AppiumService,
  gamiumService: GamiumService,
  httpRequestRelayService: HttpRequestRelayService,
  appiumDeviceWebDriverHandlerService: DeviceWebDriver.AppiumEndpointHandlerService,
  seleniumEndpointHandlerService: DeviceWebDriver.SeleniumEndpointHandlerService,
  seleniumService: SeleniumService,
  doguLogger: DoguLogger,
): DeviceDriverFactory {
  switch (platform) {
    case Platform.PLATFORM_MACOS:
      return new MacOSDeviceDriverFactory(
        enabledPlatforms,
        appiumService,
        gamiumService,
        httpRequestRelayService,
        appiumDeviceWebDriverHandlerService,
        seleniumEndpointHandlerService,
        seleniumService,
        doguLogger,
      );
    case Platform.PLATFORM_WINDOWS:
      return new WindowsDeviceDriverFactory(
        enabledPlatforms,
        appiumService,
        gamiumService,
        httpRequestRelayService,
        appiumDeviceWebDriverHandlerService,
        seleniumEndpointHandlerService,
        seleniumService,
        doguLogger,
      );
    default:
      return new NullDeviceDriverFactory();
  }
}

export async function createDeviceDriverByDevicePlatform(
  platform: Platform,
  appiumService: AppiumService,
  gamiumService: GamiumService,
  httpRequestRelayService: HttpRequestRelayService,
  appiumDeviceWebDriverHandlerService: DeviceWebDriver.AppiumEndpointHandlerService,
  seleniumEndpointHandlerService: DeviceWebDriver.SeleniumEndpointHandlerService,
  seleniumService: SeleniumService,
  doguLogger: DoguLogger,
): Promise<DeviceDriver> {
  switch (platform) {
    case Platform.PLATFORM_MACOS:
      return await MacosDriver.create(httpRequestRelayService, seleniumEndpointHandlerService, seleniumService, doguLogger);
    case Platform.PLATFORM_WINDOWS:
      return await WindowsDriver.create(gamiumService, httpRequestRelayService, seleniumEndpointHandlerService, seleniumService, doguLogger);
    case Platform.PLATFORM_ANDROID:
      return await AndroidDriver.create(appiumService, gamiumService, httpRequestRelayService, appiumDeviceWebDriverHandlerService, doguLogger);
    case Platform.PLATFORM_IOS:
      return await IosDriver.create(appiumService, gamiumService, httpRequestRelayService, appiumDeviceWebDriverHandlerService, doguLogger);
    default:
      return new NullDeviceDriver();
  }
}
