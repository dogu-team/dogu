import { Serial } from '@dogu-private/types';
import { delay, filterAsync, loop, Printable, stringify } from '@dogu-tech/common';
import semver from 'semver';
import { AppiumContext } from '../../../appium/appium.context';
import { Adb, AppiumAdb } from '../../externals/index';

export class AndroidResetService {
  static async resetDevice(serial: Serial, osVersion: string, appiumAdb: AppiumAdb, appiumContext: AppiumContext, logger: Printable): Promise<void> {
    try {
      const version = semver.coerce(osVersion);
      if (version && semver.lt(version, '11.0.0')) {
        throw new Error(`AndroidResetService.resetDevice Android version must be 11 or higher. to use testharness`);
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
    await AndroidResetService.resetIMEList(serial, logger);
    await Adb.logcatClear(serial, logger);

    await Adb.reboot(serial);
  }

  private static async resetAccounts(serial: Serial, appiumAdb: AppiumAdb, appiumContext: AppiumContext, logger: Printable): Promise<void> {
    appiumAdb.availableIMEs;
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
        throw new Error('Account title not found');
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

  private static async resetIMEList(serial: Serial, logger: Printable) {
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
}
