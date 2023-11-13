import { AndroidFullLocale, createAndroidFullLocale, RuntimeInfo } from '@dogu-private/types';
import { DuplicatedCallGuarder, loop, stringify } from '@dogu-tech/common';
import { killChildProcess } from '@dogu-tech/node';
import child_process from 'child_process';
import { AppiumContext } from '../../../appium/appium.context';
import { DeveloperOptionsString } from '../../../constants/developer-options-string';
import { env } from '../../../env';
import { AdbSerial, FocusedAppInfo } from '../../externals/cli/adb/adb';
import { AndroidAdbProfiler, AndroidAdbProfilerParams } from './android-profiler';

interface Fragment {
  type: 'developer-options' | 'lock-screen' | 'reset' | 'software-update';
  vender: 'samsung' | 'google' | 'unknown';
  fragmentName: string;
}

const blockFragments: Fragment[] = [
  {
    type: 'developer-options',
    vender: 'samsung',
    fragmentName: 'com.android.settings.development.DevelopmentSettingsDashboardFragment',
  },
  {
    type: 'lock-screen',
    vender: 'samsung',
    fragmentName: 'com.samsung.android.settings.lockscreen.LockScreenSettings',
  },
  {
    type: 'developer-options',
    vender: 'google',
    fragmentName: 'com.android.settings.development.DevelopmentSettingsDashboardFragment',
  },
  {
    type: 'lock-screen',
    vender: 'google',
    fragmentName: 'com.android.settings.security.SecuritySettings',
  },
  {
    type: 'lock-screen',
    vender: 'unknown',
    fragmentName: 'com.android.settings.password.ChooseLockGeneric$ChooseLockGenericFragment',
  },
  {
    type: 'lock-screen',
    vender: 'unknown',
    fragmentName: 'com.android.settings.password.ChooseLockPattern$ChooseLockPatternFragment',
  },
  {
    type: 'lock-screen',
    vender: 'unknown',
    fragmentName: 'com.android.settings.password.ChooseLockPassword$ChooseLockPasswordFragment',
  },
  {
    type: 'reset',
    vender: 'unknown',
    fragmentName: 'com.android.settings.system.ResetDashboardFragment',
  },
  {
    type: 'reset',
    vender: 'unknown',
    fragmentName: 'com.android.settings.MainClear',
  },
  {
    type: 'software-update',
    vender: 'samsung',
    fragmentName: 'com.samsung.android.settings.SoftwareUpdateSettings',
  },
  {
    type: 'software-update',
    vender: 'samsung',
    fragmentName: 'com.samsung.android.settings.softwareupdate.SoftwareUpdateSettings',
  },
];

const SwitchingToFragmentKeyword = 'Switching to fragment';

export class BlockDeveloperOptionsProfiler implements AndroidAdbProfiler {
  private readonly onUpdateGuarder = new DuplicatedCallGuarder();
  private logcatProc: child_process.ChildProcess | undefined = undefined;
  private locale: AndroidFullLocale | undefined = undefined;
  async profile(params: AndroidAdbProfilerParams): Promise<Partial<RuntimeInfo>> {
    if (!env.DOGU_IS_DEVICE_SHAREABLE) {
      return {};
    }
    const { context, appium, logger, adb } = params;
    const settingsAppInfo = this.getSettingsInfoIfFocused(await context.queryForegroundPackage());
    if (!settingsAppInfo) {
      this.killLogcatProcess();
      return {};
    }
    if (!this.logcatProc) {
      await this.startLogcatProcess(adb, settingsAppInfo.packageName);
    }
    const props = await context.queryProp();
    this.locale = createAndroidFullLocale(props.persist_sys_locale);
    if (!this.locale) {
      this.locale = createAndroidFullLocale(props.ro_product_locale);
    }

    this.onUpdateGuarder
      .guard(async () => {
        await this.catchAndKill(adb, settingsAppInfo.packageName, appium);
      })
      .catch((e) => {
        logger.warn(`BlockDeveloperOptionsProfiler.profile failed`, { reason: e });
      });

    return {};
  }

  private async catchAndKill(adb: AdbSerial, packageName: string, appium: AppiumContext): Promise<void> {
    for await (const _ of loop(300, 10)) {
      const settingsAppInfo = this.getSettingsInfoIfFocused(await adb.getForegroundPackage());
      if (!settingsAppInfo) {
        break;
      }
      const texts = this.locale ? DeveloperOptionsString[this.locale] : DeveloperOptionsString.en;
      for (const text of texts) {
        const devOptionsTitle = await appium.select(`android=new UiSelector().resourceId("com.android.settings:id/action_bar").childSelector(new UiSelector().text("${text}"))`);
        if (!devOptionsTitle) {
          continue;
        }
        if (devOptionsTitle.error) {
          continue;
        }

        await adb.killPackage(packageName);
      }
    }
  }

  private getSettingsInfoIfFocused(focusedAppInfos: FocusedAppInfo[]): FocusedAppInfo | undefined {
    const filtered = focusedAppInfos.filter((app) => app.displayId === 0 && app.packageName.startsWith('com.android.settings'));
    if (0 === filtered.length) {
      return undefined;
    }
    return filtered[0];
  }

  private async startLogcatProcess(adb: AdbSerial, packageName: string): Promise<void> {
    const openTime = await adb.getTime();
    if (openTime) {
      const killPackageIfContains = (msg: string): void => {
        for (const fragment of blockFragments) {
          if (msg.includes(fragment.fragmentName)) {
            adb.killPackage(packageName).catch((e) => {
              adb.printable.error(e);
            });
            this.killLogcatProcess();
          }
        }
      };
      this.logcatProc = adb.logcat(['-e', SwitchingToFragmentKeyword, '-T', `${openTime}`], {
        info: (msg) => killPackageIfContains(stringify(msg)),
        error: (msg) => killPackageIfContains(stringify(msg)),
      });
    }
  }

  private killLogcatProcess(): void {
    if (!this.logcatProc) {
      return;
    }
    killChildProcess(this.logcatProc).catch((e) => {
      console.error(e);
    });
    this.logcatProc = undefined;
  }
}
