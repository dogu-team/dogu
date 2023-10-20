import { DeviceSystemInfo, Serial } from '@dogu-private/types';
import { delay, errorify, filterAsync, loop, Printable, stringify } from '@dogu-tech/common';
import { HostPaths } from '@dogu-tech/node';
import { execFile } from 'child_process';
import semver from 'semver';
import { AppiumContext } from '../../../appium/appium.context';
import { env } from '../../../env';
import { pathMap } from '../../../path-map';
import { Adb, AppiumAdb } from '../../externals/index';

export class AndroidResetService {
  static isHarnessAvailable(systemInfo: DeviceSystemInfo): boolean {
    const version = semver.coerce(systemInfo.version);
    if (!version) {
      return false;
    }
    return semver.gte(version, '10.0.0');
  }
  static async resetDevice(serial: Serial, systemInfo: DeviceSystemInfo, appiumAdb: AppiumAdb, appiumContext: AppiumContext, logger: Printable): Promise<void> {
    try {
      if (!AndroidResetService.isHarnessAvailable(systemInfo)) {
        throw new Error(`AndroidResetService.resetDevice Android version must be 11 or higher. to use testharness`);
      }
      await Adb.enableTestharness(serial);
    } catch (e) {
      await AndroidResetService.resetManual(serial, appiumAdb, appiumContext, logger);
    }
  }

  static async resetBeforeConnected(serial: Serial, logger: Printable): Promise<void> {
    await Adb.resetPackages(serial, logger);
    await Adb.resetSdcard(serial, logger);
    await AndroidResetService.resetIMEList(serial, logger);
    await Adb.logcatClear(serial, logger);
  }

  /**
   * @note connect to wifi script
   * adb -s $DOGU_DEVICE_SERIAL install $DOGU_ADB_JOIN_WIFI_APK
   * adb -s $DOGU_DEVICE_SERIAL shell am start -n com.steinwurf.adbjoinwifi/.MainActivity -e ssid $DOGU_WIFI_SSID -e password_type WPA -e password $DOGU_WIFI_PASSWORD
   */

  static async joinWifi(serial: string, ssid: string, password: string, logger: Printable): Promise<void> {
    if (0 === ssid.length) {
      throw new Error(`AndroidResetService.joinWifi failed. serial: ${serial}, ssid: ${ssid}`);
    }
    await Adb.installAppForce(serial, pathMap().common.adbJoinWifiApk);
    /**
     * @note Adb.Shell() is not used because password can remain in the log.
     */
    const appName = 'com.steinwurf.adbjoinwifi';
    await new Promise<void>((resolve, reject) => {
      execFile(
        HostPaths.android.adbPath(env.ANDROID_HOME),
        ['-s', serial, 'shell', `am start -n ${appName}/.MainActivity -e ssid ${ssid} -e password_type WPA -e password ${password}`],
        (error, stdout, stderr) => {
          if (error) {
            reject(error);
          } else {
            logger.info(`AndroidResetService.joinWifi stdout: ${stdout} stderr: ${stderr}`);
            resolve();
          }
        },
      );
    });
    let isWifiEnabled = false;
    for (let tryCount = 0; tryCount < 10; tryCount++) {
      const { stdout } = await Adb.shell(serial, 'dumpsys wifi', {
        windowsVerbatimArguments: true,
        encoding: 'utf8',
        maxBuffer: 1024 * 1024 * 10,
      });
      if (stdout.includes('Wi-Fi is enabled')) {
        logger.info(`AndroidResetService.joinWifi success. serial: ${serial}, ssid: ${ssid}`);
        isWifiEnabled = true;
        break;
      }
      await delay(3 * 1000);
    }
    if (!isWifiEnabled) {
      throw new Error(`AndroidResetService.joinWifi failed. serial: ${serial}, ssid: ${ssid}`);
    }
    await Adb.shell(serial, `am force-stop ${appName}`).catch((error) => {
      logger.error('AndroidResetService.joinWifi failed adb.joinWifi.force-stop', { error: errorify(error) });
    });
  }

  private static async resetIMEList(serial: Serial, logger: Printable): Promise<void> {
    const imes = await Adb.getIMEList(serial);
    for (const ime of imes) {
      await Adb.clearApp(serial, ime.packageName, logger).catch((err) => {
        logger.error(`AndroidResetService.resetIMEList adb.resetPackages failed to clear`, { error: stringify(err), package: ime.packageName, serial });
      });
      await Adb.putIMESecure(serial, ime).catch((err) => {
        logger.error(`AndroidResetService.resetIMEList adb.resetPackages failed to put`, { error: stringify(err), package: ime.packageName, serial });
      });
    }
    await Adb.resetIME(serial).catch((err) => {
      logger.error(`AndroidResetService.resetIMEList adb.resetPackages failed to resetIME`, { error: stringify(err), serial });
    });
  }

  private static async resetManual(serial: Serial, appiumAdb: AppiumAdb, appiumContext: AppiumContext, logger: Printable): Promise<void> {
    await AndroidResetService.resetAccounts(serial, appiumAdb, appiumContext, logger);

    // should delete appium after you are finished using it.
    await AndroidResetService.resetBeforeConnected(serial, logger);

    await Adb.reboot(serial);
  }

  private static async resetAccounts(serial: Serial, appiumAdb: AppiumAdb, appiumContext: AppiumContext, logger: Printable): Promise<void> {
    const newAppiumAdb = appiumAdb.clone({ adbExecTimeout: 1000 * 60 * 10 });
    await newAppiumAdb.setDeviceLocale('ko-KR'); // prevent setDeviceLocale passing
    await delay(1000);
    await newAppiumAdb.setDeviceLocale('en-US');
    const driver = appiumContext.driver();
    if (!driver) {
      throw new Error(`AndroidResetService.resetAccounts Appium Driver is not found`);
    }
    const ignoreButtons = [
      'Add account',
      'Auto sync data', // galaxy
      'Google', // pixel
      'Automatically sync app data', // pixel
    ];
    let count = 0;
    for await (const _ of loop(300, 100)) {
      await newAppiumAdb.setDeviceLocale('en-US');
      await Adb.runActivity(serial, 'android.settings.SYNC_SETTINGS', logger);
      await delay(3000);
      const title = await driver.$(`android=new UiSelector().resourceId("com.android.settings:id/action_bar")`);
      if (!title) {
        throw new Error('AndroidResetService.resetAccounts Account title not found');
      }
      const titles = await driver.$$(`android=new UiSelector().resourceId("com.android.settings:id/list").resourceId("android:id/title")`);
      const titlesThatHaveAccount = await filterAsync(titles, async (title) => {
        const text = await title.getText();
        for (const ignoreButton of ignoreButtons) {
          if (text === ignoreButton) {
            return false;
          }
        }
        return true;
      });
      if (0 === titlesThatHaveAccount.length) {
        logger.info('AndroidResetService.resetAccounts No account');
        break;
      }
      count += 1;
      if (50 < count) {
        throw new Error(`AndroidResetService.resetAccounts Try to remove account more than 50 times`);
      }

      const target = titlesThatHaveAccount[0];
      await target.click();

      const removeButton = await driver.$(`android=new UiSelector().resourceId("com.android.settings:id/button").text("Remove account")`);
      if (!removeButton) {
        throw new Error('AndroidResetService.resetAccounts Remove button not found');
      }
      await removeButton.click();

      const removeWidgetButton = await driver.$(`android=new UiSelector().className("android.widget.Button").text("Remove account")`);
      if (!removeWidgetButton) {
        throw new Error('AndroidResetService.resetAccounts Remove widget button not found');
      }
      await removeWidgetButton.click();
    }
  }
}
