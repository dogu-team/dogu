import { copyiOSDeviceAgentProject, validateiOSDeviceAgentProjectExist } from '@dogu-private/dogu-agent-core/app';
import { findEndswith, HostPaths, newCleanNodeEnv } from '@dogu-tech/node';
import { exec } from 'child_process';
import compressing from 'compressing';
import { app, clipboard, desktopCapturer, ipcMain, shell, systemPreferences } from 'electron';
import isDev from 'electron-is-dev';
import fs from 'fs';
import _ from 'lodash';
import path from 'path';
import systeminformation from 'systeminformation';
import { promisify } from 'util';
import { ILoginItemSettingsOptions, ISettings, MediaType, settingsClientKey } from '../../src/shares/settings';
import { AppConfigService } from '../app-config/app-config-service';
import { ChildService } from '../child/child-service';
import { DotEnvConfigService } from '../dot-env-config/dot-env-config-service';
import { logger } from '../log/logger.instance';
import { ThirdPartyPathMap, WritablePath } from '../path-map';

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
    ipcMain.handle(settingsClientKey.restart, () => this.restart());

    ipcMain.handle(settingsClientKey.getDefaultAndroidHomePath, (_) => HostPaths.external.defaultAndroidHomePath());
    ipcMain.handle(settingsClientKey.getDefaultJavaHomePath, (_) => HostPaths.external.defaultJavaHomePath());
    ipcMain.handle(settingsClientKey.getDefaultAppiumHomePath, (_) => HostPaths.external.defaultAppiumHomePath());

    ipcMain.handle(settingsClientKey.openWdaProject, (_) => this.openWdaProject());
    ipcMain.handle(settingsClientKey.openIdaProject, (_) => this.openIdaProject());

    ipcMain.handle(settingsClientKey.changeStrictSSLOnNPMLikes, (_, enabled: boolean) => this.changeStrictSSLOnNPMLikes(enabled));
    ipcMain.handle(settingsClientKey.createZipLogReport, (_) => this.createZipLogReport());
    ipcMain.handle(settingsClientKey.writeTextToClipboard, (_, text: string) => clipboard.writeText(text));
  }

  static open(dotEnvConfigService: DotEnvConfigService): void {
    SettingsService.instance = new SettingsService(dotEnvConfigService);
    SettingsService.cleanupDoguTemp().catch((err) => {
      logger.error('cleanupDoguTemp error', { err });
    });
  }

  async restart(): Promise<void> {
    app.relaunch();
    await ChildService.close();
    app.exit();
  }

  private async isShowDevUI(): Promise<boolean> {
    return await AppConfigService.instance.getOrDefault('is_show_devui', false);
  }

  private async openDirectoryViewer(directoryPath: string): Promise<void> {
    function commandByPlatform(): string {
      if (process.platform === 'darwin') {
        return `open ${directoryPath}`;
      } else if (process.platform === 'win32') {
        return `explorer.exe ${directoryPath}`;
      } else {
        throw new Error('Unsupported platform');
      }
    }

    const { stdout, stderr } = await execAsync(commandByPlatform());
    if (stderr) {
      throw new Error(stderr);
    }
    if (stdout) {
      logger.info('openDirectoryViewer', { stdout });
    }
  }

  private async openWritableDirectory(): Promise<void> {
    await this.openDirectoryViewer(WritablePath);
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
        await fs.promises.rm(filePath, { force: true, recursive: true }).catch((err) => {
          logger.error('cleanupDoguTemp error', { file, err });
        });
      }
    }
  }

  private async createZipLogReport(): Promise<string> {
    const homePath = HostPaths.doguHomePath;
    const logsPath = HostPaths.logsPath(homePath);
    await fs.promises.mkdir(logsPath, { recursive: true });

    const configsPath = HostPaths.configsPath(homePath);
    await fs.promises.mkdir(configsPath, { recursive: true });

    const contentsDirPath = path.resolve(HostPaths.doguTempPath(), 'dogu-report');
    const destLogsPath = path.resolve(contentsDirPath, 'logs');
    const destConfigsPath = path.resolve(contentsDirPath, 'configs');

    if (fs.existsSync(contentsDirPath)) {
      await fs.promises.rm(contentsDirPath, { force: true, recursive: true });
    }
    await fs.promises.mkdir(contentsDirPath, { recursive: true });

    // cp config
    await fs.promises.cp(configsPath, destConfigsPath, { recursive: true, force: true });

    // cp logs
    await fs.promises.mkdir(destLogsPath, { recursive: true });
    const logFiles = await findEndswith(logsPath, '.log');
    for (const logFilePath of logFiles) {
      const stat = await fs.promises.stat(logFilePath);
      const oneDay = 1000 * 60 * 60 * 24;
      if (stat.mtimeMs < Date.now() - oneDay) {
        continue;
      }
      await fs.promises.cp(logFilePath, path.resolve(destLogsPath, path.basename(logFilePath)), { recursive: true, force: true });
    }

    // generate systeminfo
    const runtimeInfo = {
      cpuLoad: await systeminformation.currentLoad(),
      mems: await systeminformation.mem(),
      fsStats: await systeminformation.fsStats(),
      disksIO: await systeminformation.disksIO(),
      networkStats: await systeminformation.networkStats(),
    };

    await fs.promises.writeFile(path.resolve(contentsDirPath, 'runtimeInfo.json'), JSON.stringify(runtimeInfo, null, 2));

    // generate environments
    await fs.promises.writeFile(path.resolve(contentsDirPath, 'env.json'), JSON.stringify(process.env, null, 2));

    const zipPath = path.resolve(HostPaths.doguTempPath(), 'dogu-report.zip');
    if (fs.existsSync(zipPath)) {
      await fs.promises.rm(zipPath, { force: true, recursive: true });
    }

    await compressing.zip.compressDir(contentsDirPath, zipPath);
    await fs.promises.rm(contentsDirPath, { force: true, recursive: true });
    await this.openDirectoryViewer(path.dirname(zipPath)).catch((err) => {
      logger.error('openDirectoryViewer error', { err });
    });
    return zipPath;
  }
}
