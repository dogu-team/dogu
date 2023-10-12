import { AndroidLocale, createAndroidLocale, RuntimeInfo, Serial } from '@dogu-private/types';
import { DuplicatedCallGuarder, FilledPrintable, loop, stringify } from '@dogu-tech/common';
import { killChildProcess } from '@dogu-tech/node';
import child_process from 'child_process';
import { AppiumContext } from '../../../appium/appium.context';
import { DeveloperOptionsString } from '../../../constants/developer-options-string';
import { env } from '../../../env';
import { FocusedAppInfo } from '../../externals/cli/adb/adb';
import { Adb } from '../../externals/index';
import { AndroidAdbProfiler, AndroidAdbProfilerParams } from './android-profiler';

interface Fragment {
  type: 'developer-options' | 'lock-screen';
  venger: 'samsung' | 'google' | 'unknown';
  fragmentName: string;
}

const blockFragments: Fragment[] = [
  {
    type: 'developer-options',
    venger: 'samsung',
    fragmentName: 'com.android.settings.development.DevelopmentSettingsDashboardFragment',
  },
  {
    type: 'lock-screen',
    venger: 'samsung',
    fragmentName: 'com.samsung.android.settings.lockscreen.LockScreenSettings',
  },
  {
    type: 'developer-options',
    venger: 'google',
    fragmentName: 'com.android.settings.development.DevelopmentSettingsDashboardFragment',
  },
  {
    type: 'lock-screen',
    venger: 'google',
    fragmentName: 'com.android.settings.security.SecuritySettings',
  },
  {
    type: 'lock-screen',
    venger: 'unknown',
    fragmentName: 'com.android.settings.password.ChooseLockGeneric$ChooseLockGenericFragment',
  },
  {
    type: 'lock-screen',
    venger: 'unknown',
    fragmentName: 'com.android.settings.password.ChooseLockPattern$ChooseLockPatternFragment',
  },
  {
    type: 'lock-screen',
    venger: 'unknown',
    fragmentName: 'com.android.settings.password.ChooseLockPassword$ChooseLockPasswordFragment',
  },
];

const SwitchingToFragmentKeyword = 'Switching to fragment';

export class BlockDeveloperOptionsProfiler implements AndroidAdbProfiler {
  private readonly onUpdateGuarder = new DuplicatedCallGuarder();
  private logcatProc: child_process.ChildProcess | undefined = undefined;
  private locale: AndroidLocale | undefined = undefined;
  async profile(params: AndroidAdbProfilerParams): Promise<Partial<RuntimeInfo>> {
    if (!env.DOGU_IS_DEVICE_SHARE) {
      return {};
    }
    const { serial, context, appium, logger } = params;
    const settingsAppInfo = this.getSettingsInfoIfFocused(await context.queryForegroundPackage());
    if (!settingsAppInfo) {
      this.killLogcatProcess();
      return {};
    }
    if (!this.logcatProc) {
      await this.startLogcatProcess(serial, settingsAppInfo.packageName, logger);
    }
    const props = await context.queryProp();
    this.locale = createAndroidLocale(props.persist_sys_locale);
    if (!this.locale) {
      this.locale = createAndroidLocale(props.ro_product_locale);
    }

    this.onUpdateGuarder
      .guard(async () => {
        await this.catchAndKill(serial, settingsAppInfo.packageName, appium);
      })
      .catch((e) => {
        logger.warn(`BlockDeveloperOptionsProfiler.profile failed`, { reason: e });
      });

    return {};
  }

  private async catchAndKill(serial: Serial, packageName: string, appium: AppiumContext): Promise<void> {
    for await (const _ of loop(300, 10)) {
      const settingsAppInfo = this.getSettingsInfoIfFocused(await Adb.getForegroundPackage(serial));
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

        await Adb.killPackage(serial, packageName);
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

  private async startLogcatProcess(serial: Serial, packageName: string, logger: FilledPrintable): Promise<void> {
    const openTime = await Adb.getTime(serial);
    if (openTime) {
      const killPackageIfContains = (msg: string): void => {
        for (const fragment of blockFragments) {
          if (msg.includes(fragment.fragmentName)) {
            Adb.killPackage(serial, packageName).catch((e) => {
              logger.error(e);
            });
            this.killLogcatProcess();
          }
        }
      };
      this.logcatProc = Adb.logcat(
        serial,
        ['-e', SwitchingToFragmentKeyword, '-T', `${openTime}`],
        {
          info: (msg) => killPackageIfContains(stringify(msg)),
          error: (msg) => killPackageIfContains(stringify(msg)),
        },
        logger,
      );
    }
  }

  private killLogcatProcess(): void {
    if (this.logcatProc) {
      killChildProcess(this.logcatProc).catch((e) => {
        console.error(e);
      });
      this.logcatProc = undefined;
    }
  }
}
