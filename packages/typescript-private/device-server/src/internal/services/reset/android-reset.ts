import { DeviceSystemInfo, Serial } from '@dogu-private/types';
import { delay, filterAsync, loop, stringify } from '@dogu-tech/common';
import semver from 'semver';
import { AppiumContextImpl } from '../../../appium/appium.context';
import { SerialPrintable } from '../../../logger/serial-logger.instance';
import { Adb, AppiumAdb } from '../../externals/index';
import { checkTime } from '../../util/check-time';

export interface AndroidResetInfo {
  lastResetTime: number;
}

const ResetExpireTime = 10 * 60 * 1000;
const DirtyPath = '/data/local/tmp/dirty';

export class AndroidResetService {
  private static map: Map<Serial, AndroidResetInfo> = new Map(); // Hold for process lifetime
  constructor(private serial: Serial, private logger: SerialPrintable) {}

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
        throw new Error(`AndroidResetService.resetDevice Android version must be 10 or higher. to use testharness, serial:${serial}. version:${info.version}`);
      }

      await checkTime(`AndroidResetService.reset.enableTestharness`, Adb.enableTestharness(serial), logger);
    } catch (e) {
      await checkTime(`AndroidResetService.reset.resetAccounts`, this.resetAccounts(appiumAdb, appiumContext), logger);
      await checkTime(`AndroidResetService.reset.resetCommon`, this.resetCommon({ ignorePackages: [] }), logger);
      await checkTime(`AndroidResetService.reset.reboot`, Adb.reboot(this.serial), logger);
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
    await checkTime(`AndroidResetService.resetCommon.resetPackages`, Adb.resetPackages(serial, option.ignorePackages, logger), logger);
    await checkTime(`AndroidResetService.resetCommon.resetSdcard`, Adb.resetSdcard(serial, logger), logger);
    await checkTime(`AndroidResetService.resetCommon.resetIMEList`, this.resetIMEList(logger), logger);
    await checkTime(`AndroidResetService.resetCommon.logcatClear`, Adb.logcatClear(serial, logger), logger);
    await checkTime(`AndroidResetService.resetCommon.resetDirty`, this.resetDirty(), logger);
  }

  private async resetDirty(): Promise<void> {
    await Adb.shell(this.serial, `rm -f ${DirtyPath}`);
  }

  private async resetIMEList(logger: SerialPrintable): Promise<void> {
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
    logger.info(`AndroidResetService.resetAccounts begin`, { serial });
    if (appiumContext.openingState !== 'openingSucceeded') {
      throw new Error(`AndroidResetService.resetAccounts Appium Context is not opened`);
    }
    const newAppiumAdb = appiumAdb.clone({ adbExecTimeout: 1000 * 60 * 3 });
    await checkTime(`AndroidResetService.resetAccounts.setDeviceLocale.ko-KR`, newAppiumAdb.setDeviceLocale('ko-KR'), logger); // prevent setDeviceLocale passing
    await delay(1000);
    await checkTime(`AndroidResetService.resetAccounts.setDeviceLocale.en-US`, newAppiumAdb.setDeviceLocale('en-US'), logger);
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
      await checkTime(`AndroidResetService.resetAccounts.setDeviceLocale.en-US`, newAppiumAdb.setDeviceLocale('en-US'), logger);
      await checkTime(`AndroidResetService.resetAccounts.runActivity`, Adb.runActivity(serial, 'android.settings.SYNC_SETTINGS', logger), logger);
      await delay(3000);
      const title = await checkTime(
        `AndroidResetService.resetAccounts.findActionBar`,
        driver.$(`android=new UiSelector().resourceId("com.android.settings:id/action_bar")`),
        logger,
      );
      if (!title) {
        throw new Error('AndroidResetService.resetAccounts Account title not found');
      }
      const titles = await checkTime(
        `AndroidResetService.resetAccounts.findTitleList`,
        driver.$$(`android=new UiSelector().resourceId("com.android.settings:id/list").resourceId("android:id/title")`),
        logger,
      );
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

      const removeButton = await checkTime(
        `AndroidResetService.resetAccounts.clickRemoveAccount`,
        driver.$(`android=new UiSelector().resourceId("com.android.settings:id/button").text("Remove account")`),
        logger,
      );
      if (!removeButton) {
        throw new Error('AndroidResetService.resetAccounts Remove button not found');
      }
      await removeButton.click();

      const removeWidgetButton = await checkTime(
        `AndroidResetService.resetAccounts.clickRemoveAccount`,
        driver.$(`android=new UiSelector().className("android.widget.Button").text("Remove account")`),
        logger,
      );
      if (!removeWidgetButton) {
        throw new Error('AndroidResetService.resetAccounts Remove widget button not found');
      }
      await removeWidgetButton.click();
    }

    logger.info(`AndroidResetService.resetAccounts end`, { serial });
  }
}
