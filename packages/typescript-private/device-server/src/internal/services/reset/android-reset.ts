import { DeviceSystemInfo, Serial, SerialPrintable } from '@dogu-private/types';
import { delay, filterAsync, loop, stringify } from '@dogu-tech/common';
import semver from 'semver';
import { AppiumContextImpl } from '../../../appium/appium.context';
import { AdbSerial, AppiumAdb } from '../../externals/index';
import { CheckTimer } from '../../util/check-time';

export interface AndroidResetInfo {
  lastResetTime: number;
}

const ResetExpireTime = 10 * 60 * 1000;
const DirtyPath = '/data/local/tmp/dirty';

export class AndroidResetService {
  private static map: Map<Serial, AndroidResetInfo> = new Map(); // Hold for process lifetime
  private timer: CheckTimer;
  private adb: AdbSerial;

  constructor(private serial: Serial, private logger: SerialPrintable) {
    this.timer = new CheckTimer(this.logger);
    this.adb = new AdbSerial(serial, logger);
  }

  async makeDirty(): Promise<void> {
    await this.adb.shell(`echo dirty > ${DirtyPath}`);
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
      const { stdout } = await this.adb.shell(`cat ${DirtyPath}`);
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

      await this.timer.check(`AndroidResetService.reset.enableTestharness`, this.adb.enableTestharness());
    } catch (e) {
      await this.timer.check(`AndroidResetService.reset.resetAccounts`, this.resetAccounts(appiumAdb, appiumContext));
      await this.timer.check(`AndroidResetService.reset.resetCommon`, this.resetCommon({ ignorePackages: [] }));
      await this.timer.check(`AndroidResetService.reset.reboot`, this.adb.reboot());
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
    await this.timer.check(`AndroidResetService.resetCommon.resetPackages`, this.adb.resetPackages(option.ignorePackages));
    await this.timer.check(`AndroidResetService.resetCommon.resetSdcard`, this.adb.resetSdcard());
    await this.timer.check(`AndroidResetService.resetCommon.resetIMEList`, this.resetIMEList());
    await this.timer.check(`AndroidResetService.resetCommon.logcatClear`, this.adb.logcatClear());
    await this.timer.check(`AndroidResetService.resetCommon.resetDirty`, this.resetDirty());
  }

  private async resetDirty(): Promise<void> {
    await this.adb.shell(`rm -f ${DirtyPath}`);
  }

  private async resetIMEList(): Promise<void> {
    const { serial, logger } = this;
    const imes = await this.adb.getIMEList();
    for (const ime of imes) {
      await this.adb.clearApp(ime.packageName).catch((err) => {
        logger.error(`AndroidResetService.resetIMEList adb.resetPackages failed to clear`, { error: stringify(err), package: ime.packageName, serial });
      });
      await this.adb.putIMESecure(ime).catch((err) => {
        logger.error(`AndroidResetService.resetIMEList adb.resetPackages failed to put`, { error: stringify(err), package: ime.packageName, serial });
      });
    }
    await this.adb.resetIME().catch((err) => {
      logger.error(`AndroidResetService.resetIMEList adb.resetPackages failed to resetIME`, { error: stringify(err), serial });
    });
  }

  private async resetAccounts(appiumAdb: AppiumAdb, appiumContext: AppiumContextImpl): Promise<void> {
    const { serial, logger, adb } = this;
    logger.info(`AndroidResetService.resetAccounts begin`, { serial });
    if (appiumContext.openingState !== 'openingSucceeded') {
      throw new Error(`AndroidResetService.resetAccounts Appium Context is not opened`);
    }
    const newAppiumAdb = appiumAdb.clone({ adbExecTimeout: 1000 * 60 * 3 });
    await this.timer.check(`AndroidResetService.resetAccounts.setDeviceLocale.ko-KR`, newAppiumAdb.setDeviceLocale('ko-KR')); // prevent setDeviceLocale passing
    await delay(1000);
    await this.timer.check(`AndroidResetService.resetAccounts.setDeviceLocale.en-US`, newAppiumAdb.setDeviceLocale('en-US'));
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
      await this.timer.check(`AndroidResetService.resetAccounts.setDeviceLocale.en-US`, newAppiumAdb.setDeviceLocale('en-US'));
      await this.timer.check(`AndroidResetService.resetAccounts.runActivity`, adb.runActivity('android.settings.SYNC_SETTINGS'));
      await delay(3000);
      const title = await this.timer.check(
        `AndroidResetService.resetAccounts.findActionBar`,
        driver.$(`android=new UiSelector().resourceId("com.android.settings:id/action_bar")`),
      );
      if (!title) {
        throw new Error('AndroidResetService.resetAccounts Account title not found');
      }
      const titles = await this.timer.check(
        `AndroidResetService.resetAccounts.findTitleList`,
        driver.$$(`android=new UiSelector().resourceId("com.android.settings:id/list").resourceId("android:id/title")`),
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

      const removeButton = await this.timer.check(
        `AndroidResetService.resetAccounts.clickRemoveAccount`,
        driver.$(`android=new UiSelector().resourceId("com.android.settings:id/button").text("Remove account")`),
      );
      if (!removeButton) {
        throw new Error('AndroidResetService.resetAccounts Remove button not found');
      }
      await removeButton.click();

      const removeWidgetButton = await this.timer.check(
        `AndroidResetService.resetAccounts.clickRemoveAccount`,
        driver.$(`android=new UiSelector().className("android.widget.Button").text("Remove account")`),
      );
      if (!removeWidgetButton) {
        throw new Error('AndroidResetService.resetAccounts Remove widget button not found');
      }
      await removeWidgetButton.click();
    }

    logger.info(`AndroidResetService.resetAccounts end`, { serial });
  }
}
