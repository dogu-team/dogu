import { Serial } from '@dogu-private/types';
import { delay, filterAsync, Printable } from '@dogu-tech/common';
import semver from 'semver';
import { AppiumContext } from '../../../appium/appium.context';
import { Adb, AppiumAdb } from '../../externals/index';

export class AndroidResetService {
  static async resetDevice(serial: Serial, osVersion: string, appiumAdb: AppiumAdb, appiumContext: AppiumContext, logger: Printable): Promise<void> {
    try {
      const version = semver.coerce(osVersion);
      if (version && semver.lt(version, '11.0.0')) {
        throw new Error(`Android version must be 11 or higher. to use testharness`);
      }
      await Adb.enableTestharness(serial);
    } catch (e) {
      await AndroidResetService.resetManual(serial, appiumAdb, appiumContext, logger);
    }
  }

  static async resetManual(serial: Serial, appiumAdb: AppiumAdb, appiumContext: AppiumContext, logger: Printable): Promise<void> {
    await AndroidResetService.resetAccounts(serial, appiumAdb, appiumContext, logger);

    // should delete appium after you are finished using it.
    await Adb.resetPackages(serial, logger);
    await Adb.resetSdcard(serial, logger);
    await Adb.logcatClear(serial, logger);

    await Adb.reboot(serial);
  }

  private static async resetAccounts(serial: Serial, appiumAdb: AppiumAdb, appiumContext: AppiumContext, logger: Printable): Promise<void> {
    const newAppiumAdb = appiumAdb.clone({ udid: serial, curDeviceId: serial, adbExecTimeout: 1000 * 60 * 10 });
    const befLocale = await newAppiumAdb.getDeviceLocale();
    await newAppiumAdb.setDeviceLocale('en-US');
    if (!(await newAppiumAdb.ensureCurrentLocale('en', 'US'))) {
      throw new Error(`Failed to set en-US`);
    }
    const driver = appiumContext.driver();
    if (!driver) {
      throw new Error(`Appium Driver is not found`);
    }
    await Adb.runActivity(serial, 'android.settings.SYNC_SETTINGS', logger);
    await delay(7000);

    const ignoreButtons = ['Add account', 'Auto sync data'];
    const titles = await driver.$$(`android=new UiSelector().resourceId("com.android.settings:id/title")`);
    const titlesThatHaveAccount = await filterAsync(titles, async (title) => {
      const text = await title.getText();
      for (const ignoreButton of ignoreButtons) {
        if (text.includes(ignoreButton)) {
          return false;
        }
      }
      return true;
    });

    await appiumAdb.setDeviceLocale(befLocale);
  }
}
