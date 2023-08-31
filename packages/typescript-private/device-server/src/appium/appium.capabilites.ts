import { Platform, platformTypeFromPlatform } from '@dogu-private/types';
import { Printable } from '@dogu-tech/common';
import { AppiumCapabilities } from '@dogu-tech/device-client-common';
import { killProcessOnPort } from '@dogu-tech/node';
import { DOGU_ADB_SERVER_PORT } from '../internal/externals/cli/adb/adb';
import { AppiumContextOptions } from './appium.context';

const AppiumNewCommandTimeout = 24 * 60 * 60; // unit: seconds

/**
 *
 * @see https://appium.io/docs/en/2.0/guides/caps/
 * @see https://appium.github.io/appium-xcuitest-driver/latest/capabilities/
 */
export async function createAppiumCapabilities(
  options: AppiumContextOptions,
  logger: Printable,
  extras?: {
    commandTimeout?: number;
  },
): Promise<AppiumCapabilities> {
  const { platform, serial, devicePortService } = options;
  switch (platform) {
    case Platform.PLATFORM_ANDROID: {
      const systemPort = await devicePortService.createOrGetHostPort(serial, 'AndroidAppiumSystemPort');
      const chromedriverPort = await devicePortService.createOrGetHostPort(serial, 'AndroidAppiumChromeDriverPort');
      const mjepgServerPort = await devicePortService.createOrGetHostPort(serial, 'AndroidAppiumSystemPort');
      await killProcessOnPort(systemPort, logger);
      await killProcessOnPort(chromedriverPort, logger);
      await killProcessOnPort(mjepgServerPort, logger);
      return {
        platformName: 'android',
        'appium:automationName': 'UiAutomator2',
        'appium:deviceName': serial,
        'appium:udid': serial,
        'appium:mjpegServerPort': mjepgServerPort,
        'appium:newCommandTimeout': extras?.commandTimeout ?? AppiumNewCommandTimeout,
        'appium:systemPort': systemPort,
        'appium:chromedriverPort': chromedriverPort,
        'appium:adbPort': DOGU_ADB_SERVER_PORT,
      };
    }
    case Platform.PLATFORM_IOS: {
      const mjpegServerPort = await devicePortService.createOrGetHostPort(serial, 'iOSAppiumMjpegServerPort');
      const webkitDebugProxyPort = await devicePortService.createOrGetHostPort(serial, 'iOSAppiumWebkitDebugProxyPort');
      await killProcessOnPort(mjpegServerPort, logger);
      await killProcessOnPort(webkitDebugProxyPort, logger);
      return {
        platformName: 'ios',
        'appium:automationName': 'XCUITest',
        'appium:deviceName': serial,
        'appium:udid': serial,
        'appium:webDriverAgentUrl': `http://127.0.0.1:${options.wdaForwardPort}`,
        'appium:mjpegServerPort': mjpegServerPort,
        'appium:webkitDebugProxyPort': webkitDebugProxyPort,
        'appium:newCommandTimeout': extras?.commandTimeout ?? AppiumNewCommandTimeout,
        'appium:showXcodeLog': true,
      };
    }
    default:
      throw new Error(`platform ${platformTypeFromPlatform(platform)} is not supported`);
  }
}
