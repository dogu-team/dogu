import { DeviceSystemInfo, Serial, SerialPrintable } from '@dogu-private/types';
import { delay, filterAsync, loop, PrefixLogger, retry, stringify } from '@dogu-tech/common';
import { CheckTimer } from '@dogu-tech/node';
import semver from 'semver';
import { AppiumContextImpl } from '../../../appium/appium.context';
import { env } from '../../../env';
import { AdbSerial, AppiumAdb } from '../../externals/index';
export interface AndroidResetInfo {
  lastResetTime: number;
}

const ResetExpireTime = 10 * 60 * 1000;
const DirtyPath = '/data/local/tmp/dirty';

export class AndroidResetService {
  private static map: Map<Serial, AndroidResetInfo> = new Map(); // Hold for process lifetime
  private timer: CheckTimer;
  private adb: AdbSerial;
  private _state: string | null = null;

  constructor(
    private serial: Serial,
    private logger: SerialPrintable,
  ) {
    this.timer = new CheckTimer({ logger });
    this.adb = new AdbSerial(serial, logger);
  }

  get state(): string | null {
    return this._state;
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
    await retry(
      async (): Promise<void> => {
        logger.info(`AndroidResetService.reset begin`, { serial, info });

        if (env.DOGU_RUN_TYPE === 'local' && env.DOGU_DEVICE_SKIP_RESET_FOR_LOCAL) {
          logger.info(`AndroidResetService.reset skipped for local`, { serial, info });
        } else {
          await this.runReset(info, appiumAdb, appiumContext);
        }

        await this.check(`AndroidResetService.reset.reboot`, this.adb.reboot());
        AndroidResetService.map.set(serial, { lastResetTime: Date.now() });
        this.logger.info(`AndroidResetService.reset end`, { serial, info });
      },
      { retryCount: 5, retryInterval: 1000, printable: new PrefixLogger(logger, 'AndroidResetService.reset') },
    );
  }

  private async runReset(info: DeviceSystemInfo, appiumAdb: AppiumAdb, appiumContext: AppiumContextImpl): Promise<void> {
    const { serial } = this;
    try {
      this._state = 'resetting';
      if (!this.isHarnessAvailable(info)) {
        throw new Error(`AndroidResetService.resetDevice Android version must be 10 or higher. to use testharness, serial:${serial}. version:${info.version}`);
      }
      await this.check(`AndroidResetService.reset.enableTestharness`, this.adb.enableTestharness());
    } catch (e) {
      await this.check(`AndroidResetService.reset.resetAccounts`, this.resetAccounts(appiumAdb, appiumContext));
      await this.check(`AndroidResetService.reset.runAppSettingsActivity`, this.adb.runActivity('android.settings.MANAGE_APPLICATIONS_SETTINGS'));
      await this.check(`AndroidResetService.reset.resetSdcard`, this.adb.resetSdcard());
      await this.check(`AndroidResetService.reset.resetIMEList`, this.resetIMEList());
      await this.check(`AndroidResetService.reset.logcatClear`, this.adb.logcatClear());
      await this.check(`AndroidResetService.reset.resetPackages`, this.adb.resetPackages());
      await this.check(`AndroidResetService.reset.resetDirty`, this.resetDirty());
    } finally {
      this._state = null;
    }
  }

  private isHarnessAvailable(systemInfo: DeviceSystemInfo): boolean {
    const version = semver.coerce(systemInfo.version);
    if (!version) {
      return false;
    }
    return semver.gte(version, '10.0.0');
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
      if (removeButton.error) {
        throw new Error(`AndroidResetService.resetAccounts Remove button not found ${stringify(removeButton.error)}`);
      }
      await removeButton.click();

      const removeWidgetButton = await this.timer.check(
        `AndroidResetService.resetAccounts.clickRemoveAccount`,
        driver.$(`android=new UiSelector().className("android.widget.Button").text("Remove account")`),
      );
      if (removeWidgetButton.error) {
        throw new Error(`AndroidResetService.resetAccounts Remove widget button not found ${stringify(removeWidgetButton.error)}`);
      }
      await removeWidgetButton.click();
    }

    logger.info(`AndroidResetService.resetAccounts end`, { serial });
  }

  async check<T>(name: string, promise: Promise<T>): Promise<T> {
    this._state = name;
    return this.timer.check(name, promise);
  }
}
