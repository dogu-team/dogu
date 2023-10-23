import { DeviceSystemInfo, Serial } from '@dogu-private/types';
import { delay, FilledPrintable, filterAsync, loop, Printable, stringify } from '@dogu-tech/common';
import semver from 'semver';
import { AppiumContextImpl } from '../../../appium/appium.context';
import { Adb, AppiumAdb } from '../../externals/index';

export interface AndroidResetInfo {
  lastResetTime: number;
}

const ResetExpireTime = 10 * 60 * 1000;
const DirtyPath = '/data/local/tmp/dirty';

export class AndroidResetService {
  private static map: Map<Serial, AndroidResetInfo> = new Map(); // Hold for process lifetime
  constructor(private serial: Serial, private logger: FilledPrintable) {}

  async makeDirty(): Promise<void> {
    await Adb.shell(this.serial, `echo dirty > ${DirtyPath}`);
  }

  async isDirty(): Promise<boolean> {
    const { serial } = this;
    const lastResetInfo = AndroidResetService.map.get(serial);
    if (!lastResetInfo) {
      return true;
    }
    const { lastResetTime } = lastResetInfo;
    if (Date.now() - lastResetTime > ResetExpireTime) {
      return true;
    }
    try {
      const { stdout } = await Adb.shell(serial, `cat ${DirtyPath}`);
      return stdout.includes('dirty');
    } catch (e) {
      return false;
    }
  }

  /*
   * Reset device and reboot
   */
  async reset(info: DeviceSystemInfo, appiumAdb: AppiumAdb, appiumContext: AppiumContextImpl): Promise<void> {
    const { serial, logger } = this;
    logger.info(`AndroidResetService.resetDevice begin`, { serial, info });
    try {
      if (!this.isHarnessAvailable(info)) {
        throw new Error(`AndroidResetService.resetDevice Android version must be 10 or higher. to use testharness`);
      }
      await Adb.enableTestharness(serial);
    } catch (e) {
      await this.resetAccounts(appiumAdb, appiumContext);
      await this.resetCommon({ ignorePackages: [] });
      await Adb.reboot(this.serial);
    }
    AndroidResetService.map.set(serial, { lastResetTime: Date.now() });
    this.logger.info(`AndroidResetService.resetDevice end`, { serial, info });
  }

  private isHarnessAvailable(systemInfo: DeviceSystemInfo): boolean {
    const version = semver.coerce(systemInfo.version);
    if (!version) {
      return false;
    }
    return semver.gte(version, '10.0.0');
  }

  private async resetCommon(option: { ignorePackages: string[] }): Promise<void> {
    const { serial, logger } = this;
    await Adb.resetPackages(serial, option.ignorePackages, logger);
    await Adb.resetSdcard(serial, logger);
    await this.resetIMEList(logger);
    await Adb.logcatClear(serial, logger);
    await this.resetDirty();
  }

  private async resetDirty(): Promise<void> {
    await Adb.shell(this.serial, `rm -f ${DirtyPath}`);
  }

  private async resetIMEList(logger: Printable): Promise<void> {
    const { serial } = this;
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

  private async resetAccounts(appiumAdb: AppiumAdb, appiumContext: AppiumContextImpl): Promise<void> {
    const { serial, logger } = this;
    if (appiumContext.openingState !== 'openingSucceeded') {
      throw new Error(`AndroidResetService.resetAccounts Appium Context is not opened`);
    }
    const newAppiumAdb = appiumAdb.clone({ adbExecTimeout: 1000 * 60 * 3 });
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
