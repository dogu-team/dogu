import { HostPaths, newCleanNodeEnv, removeItemRecursive } from '@dogu-tech/node';
import { exec } from 'child_process';
import { app, desktopCapturer, ipcMain, shell, systemPreferences } from 'electron';
import isDev from 'electron-is-dev';
import fs from 'fs';
import _ from 'lodash';
import path from 'path';
import { promisify } from 'util';
import { ILoginItemSettingsOptions, ISettings, MediaType, settingsClientKey } from '../../src/shares/settings';
import { AppConfigService } from '../app-config/app-config-service';
import { DotEnvConfigService } from '../dot-env-config/dot-env-config-service';
import { logger } from '../log/logger.instance';
import { ThirdPartyPathMap, WritablePath } from '../path-map';
import { copyiOSDeviceAgentProject, validateiOSDeviceAgentProjectExist } from './ios-device-agent-project';

const execAsync = promisify(exec);

export class SettingsService {
  static instance: SettingsService;

  private constructor(private readonly dotEnvConfigService: DotEnvConfigService) {
    ipcMain.handle(settingsClientKey.isDev, () => isDev);
    ipcMain.handle(settingsClientKey.isShowDevUI, () => this.isShowDevUI());

    ipcMain.handle(settingsClientKey.getLoginItemSettings, (_, option: ILoginItemSettingsOptions) => {
      return app.getLoginItemSettings(option);
    });
    ipcMain.handle(settingsClientKey.setLoginItemSettings, (_, setting: ISettings) => {
      app.setLoginItemSettings(setting);
    });
    ipcMain.handle(settingsClientKey.setSecureKeyboardEntryEnabled, (_, enabled: boolean) => {
      app.setSecureKeyboardEntryEnabled(enabled);
    });
    ipcMain.handle(settingsClientKey.openJsonConfig, () => AppConfigService.instance.openJsonConfig());
    ipcMain.handle(settingsClientKey.openWritableDirectory, () => this.openWritableDirectory());
    ipcMain.handle(settingsClientKey.openExternal, (_, url: string) => shell.openExternal(url));

    ipcMain.handle(settingsClientKey.getPlatform, (_) => process.platform);

    ipcMain.handle(settingsClientKey.getMediaAccessStatus, (_, mediaType: MediaType) => systemPreferences.getMediaAccessStatus(mediaType));
    ipcMain.handle(settingsClientKey.requestDesktopCapture, (_) => this.requestDesktopCapture());
    ipcMain.handle(settingsClientKey.isTrustedAccessibilityClient, (_, prompt) => systemPreferences.isTrustedAccessibilityClient(prompt));
    ipcMain.handle(settingsClientKey.openSecurityPrefPanel, (_, param: string) => this.openSecurityPrefPanel(param));

    ipcMain.handle(settingsClientKey.setBadgeCount, (_, count: number) => app.setBadgeCount(count));

    ipcMain.handle(settingsClientKey.getDefaultAndroidHomePath, (_) => HostPaths.external.defaultAndroidHomePath());
    ipcMain.handle(settingsClientKey.getDefaultJavaHomePath, (_) => HostPaths.external.defaultJavaHomePath());
    ipcMain.handle(settingsClientKey.getDefaultAppiumHomePath, (_) => HostPaths.external.defaultAppiumHomePath());

    ipcMain.handle(settingsClientKey.openWdaProject, (_) => this.openWdaProject());
    ipcMain.handle(settingsClientKey.openIdaProject, (_) => this.openIdaProject());

    ipcMain.handle(settingsClientKey.changeStrictSSLOnNPMLikes, (_, enabled: boolean) => this.changeStrictSSLOnNPMLikes(enabled));
  }

  static open(dotEnvConfigService: DotEnvConfigService): void {
    SettingsService.instance = new SettingsService(dotEnvConfigService);
    SettingsService.cleanupDoguTemp().catch((err) => {
      logger.error('cleanupDoguTemp error', { err });
    });
  }

  private async isShowDevUI(): Promise<boolean> {
    const DOGU_RUN_TYPE = await AppConfigService.instance.get('DOGU_RUN_TYPE');
    let currentLogLevel = DOGU_RUN_TYPE === 'development' || DOGU_RUN_TYPE === 'local' ? true : false;
    currentLogLevel = isDev ? true : currentLogLevel;
    return await AppConfigService.instance.getOrDefault('is_show_devui', currentLogLevel);
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
    const cleanNodeEnv = newCleanNodeEnv();
    const env = _.merge(cleanNodeEnv, {
      APPIUM_HOME: this.dotEnvConfigService.get('APPIUM_HOME'),
      PATH: `${ThirdPartyPathMap.common.nodeBin}${path.delimiter}${cleanNodeEnv.PATH}`,
    });
    const { stdout, stderr } = await execAsync(`${ThirdPartyPathMap.common.pnpm} appium driver run xcuitest open-wda`, {
      cwd: HostPaths.external.nodePackage.appiumPath(),
      env,
    });
    if (stderr) {
      logger.warn('openWdaProject', { stderr });
    }
    if (stdout) {
      logger.info('openWdaProject', { stdout });
    }
  }

  private async openIdaProject(): Promise<void> {
    const idaDestProjectDirectoryPath = HostPaths.external.xcodeProject.idaProjectDirectoryPath();

    if (!(await validateiOSDeviceAgentProjectExist(logger))) {
      await copyiOSDeviceAgentProject(logger);
    }

    const idaDestProjectPath = path.resolve(idaDestProjectDirectoryPath, 'IOSDeviceAgent.xcodeproj');
    const { stdout, stderr } = await execAsync(`open ${idaDestProjectPath}`, {});
    if (stderr) {
      logger.warn('openIdaProject', { stderr });
    }
    if (stdout) {
      logger.info('openIdaProject', { stdout });
    }
  }

  private async changeStrictSSLOnNPMLikes(enabled: boolean): Promise<void> {
    const npmLikes = [HostPaths.thirdParty.pathMap().common.npm, HostPaths.thirdParty.pathMap().common.pnpm, HostPaths.thirdParty.pathMap().common.yarn];
    await fs.promises.mkdir(HostPaths.tempPath, { recursive: true });
    for (const npmLike of npmLikes) {
      const { stdout, stderr } = enabled
        ? await execAsync(`${npmLike} config delete strict-ssl`, { env: newCleanNodeEnv(), cwd: HostPaths.tempPath })
        : await execAsync(`${npmLike} config set strict-ssl false`, { env: newCleanNodeEnv(), cwd: HostPaths.tempPath });
      if (stderr) {
        logger.warn('changeStrictSSlOnNPMLikes', { stderr });
      }
      if (stdout) {
        logger.info('changeStrictSSlOnNPMLikes', { stdout });
      }
    }
  }

  private static async cleanupDoguTemp(): Promise<void> {
    const tempPath = HostPaths.doguTempPath();
    if (fs.existsSync(tempPath)) {
      const files = fs.readdirSync(tempPath);
      logger.info('cleanupDoguTemp', { files });
      for (const file of files) {
        const filePath = path.join(tempPath, file);
        await removeItemRecursive(filePath).catch((err) => {
          logger.error('cleanupDoguTemp error', { file, err });
        });
      }
    }
  }
}
