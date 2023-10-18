import { Serial } from '@dogu-private/types';
import { delay, filterAsync, loop, Printable } from '@dogu-tech/common';
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
    const newAppiumAdb = appiumAdb.clone({ adbExecTimeout: 1000 * 60 * 10 });
    await newAppiumAdb.setDeviceLocale('ko-KR'); // prevent setDeviceLocale passing
    await delay(1000);
    await newAppiumAdb.setDeviceLocale('en-US');
    const driver = appiumContext.driver();
    if (!driver) {
      throw new Error(`Appium Driver is not found`);
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
        logger.info('No account');
        break;
      }
      count += 1;
      if (50 < count) {
        throw new Error(`Try to remove account more than 50 times`);
      }

      const target = titlesThatHaveAccount[0];
      await target.click();

      const removeButton = await driver.$(`android=new UiSelector().resourceId("com.android.settings:id/button").text("Remove account")`);
      if (!removeButton) {
        throw new Error('Remove button not found');
      }
      await removeButton.click();

      const removeWidgetButton = await driver.$(`android=new UiSelector().className("android.widget.Button").text("Remove account")`);
      if (!removeWidgetButton) {
        throw new Error('Remove widget button not found');
      }
      await removeWidgetButton.click();
    }
  }
}
