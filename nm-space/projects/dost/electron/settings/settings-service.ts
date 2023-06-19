import { exec } from 'child_process';
import { app, desktopCapturer, ipcMain, shell, systemPreferences } from 'electron';
import isDev from 'electron-is-dev';
import { promisify } from 'util';
import { ILoginItemSettingsOptions, ISettings, MediaType, settingsClientKey } from '../../src/shares/settings';
import { DotEnvConfigService } from '../dot-env-config/dot-env-config-service';
import { logger } from '../log/logger.instance';
import { DefaultAndroidHomePath, DefaultAppiumHomePath, DefaultJavaHomePath, ThirdPartyPathMap, WritablePath } from '../path-map';

const execAsync = promisify(exec);

export class SettingsService {
  static instance: SettingsService;

  private constructor(private readonly dotEnvConfigService: DotEnvConfigService) {
    ipcMain.handle(settingsClientKey.isDev, () => isDev);

    ipcMain.handle(settingsClientKey.getLoginItemSettings, (_, option: ILoginItemSettingsOptions) => {
      return app.getLoginItemSettings(option);
    });
    ipcMain.handle(settingsClientKey.setLoginItemSettings, (_, setting: ISettings) => {
      app.setLoginItemSettings(setting);
    });
    ipcMain.handle(settingsClientKey.setSecureKeyboardEntryEnabled, (_, enabled: boolean) => {
      app.setSecureKeyboardEntryEnabled(enabled);
    });
    ipcMain.handle(settingsClientKey.openWritableDirectory, () => this.openWritableDirectory());
    ipcMain.handle(settingsClientKey.openExternal, (_, url: string) => shell.openExternal(url));

    ipcMain.handle(settingsClientKey.getPlatform, (_) => process.platform);

    ipcMain.handle(settingsClientKey.getMediaAccessStatus, (_, mediaType: MediaType) => systemPreferences.getMediaAccessStatus(mediaType));
    ipcMain.handle(settingsClientKey.requestDesktopCapture, (_) => this.requestDesktopCapture());
    ipcMain.handle(settingsClientKey.isTrustedAccessibilityClient, (_, prompt) => systemPreferences.isTrustedAccessibilityClient(prompt));
    ipcMain.handle(settingsClientKey.openSecurityPrefPanel, (_, param: string) => this.openSecurityPrefPanel(param));

    ipcMain.handle(settingsClientKey.setBadgeCount, (_, count: number) => app.setBadgeCount(count));

    ipcMain.handle(settingsClientKey.getDefaultAndroidHomePath, (_) => DefaultAndroidHomePath);
    ipcMain.handle(settingsClientKey.getDefaultJavaHomePath, (_) => DefaultJavaHomePath);
    ipcMain.handle(settingsClientKey.getDefaultAppiumHomePath, (_) => DefaultAppiumHomePath);

    ipcMain.handle(settingsClientKey.openWdaProject, (_) => this.openWdaProject());
  }

  static open(dotEnvConfigService: DotEnvConfigService): void {
    SettingsService.instance = new SettingsService(dotEnvConfigService);
  }

  private async openWritableDirectory(): Promise<void> {
    function commandByPlatform(): string {
      if (process.platform === 'darwin') {
        return `open ${WritablePath}`;
      } else if (process.platform === 'win32') {
        return `explorer.exe ${WritablePath}`;
      } else {
        throw new Error('Unsupported platform');
      }
    }

    const { stdout, stderr } = await execAsync(commandByPlatform());
    if (stderr) {
      throw new Error(stderr);
    }
    if (stdout) {
      logger.info('openWritableDirectory', { stdout });
    }
  }
  private async openSecurityPrefPanel(param: string): Promise<void> {
    // ref https://github.com/karaggeorge/mac-screen-capture-permissions/blob/master/index.js#LL15C75-L15C96
    await execAsync(`open x-apple.systempreferences:com.apple.preference.security?${param}`);
  }

  private async requestDesktopCapture(): Promise<void> {
    desktopCapturer.getSources({ types: ['window', 'screen'] }).then(async (sources) => {
      logger.verbose('desktopCapturer.getSources', { sources });
    });
  }

  private async openWdaProject(): Promise<void> {
    const { stdout, stderr } = await execAsync(`${ThirdPartyPathMap.common.pnpm} appium driver run xcuitest open-wda`, {
      cwd: ThirdPartyPathMap.common.appiumProject,
      env: {
        ...process.env,
        APPIUM_HOME: this.dotEnvConfigService.get('APPIUM_HOME'),
      },
    });
    if (stderr) {
      throw new Error(stderr);
    }
    if (stdout) {
      logger.info('openWdaProject', { stdout });
    }
  }
}
