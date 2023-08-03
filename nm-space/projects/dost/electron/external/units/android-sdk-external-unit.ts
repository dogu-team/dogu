import { PrefixLogger, stringify } from '@dogu-tech/common';
import { HostPaths } from '@dogu-tech/node';
import { spawn } from 'child_process';
import compressing from 'compressing';
import { download } from 'electron-dl';
import fs from 'fs';
import path from 'path';
import { ExternalKey } from '../../../src/shares/external';
import { AppConfigService } from '../../app-config/app-config-service';
import { DotEnvConfigService } from '../../dot-env-config/dot-env-config-service';
import { logger } from '../../log/logger.instance';
import { StdLogCallbackService } from '../../log/std-log-callback-service';
import { WindowService } from '../../window/window-service';
import { ExternalUnitCallback, IExternalUnit } from '../external-unit';

const Infos = {
  commandLineTools: {
    darwin: {
      url: 'https://dl.google.com/android/repository/commandlinetools-mac-9477386_latest.zip',
      fileExtensionPattern: /\.zip$/,
    },
    win32: {
      url: 'https://dl.google.com/android/repository/commandlinetools-win-9477386_latest.zip',
      fileExtensionPattern: /\.zip$/,
    },
    relativeCommandLineToolsPath: 'cmdline-tools',
  },
  buildTools: {
    version: '33.0.2',
  },
  platformTools: {
    darwin: {
      url: 'https://dl.google.com/android/repository/platform-tools_r33.0.3-darwin.zip',
      fileExtensionPattern: /\.zip$/,
    },
    win32: {
      url: 'https://dl.google.com/android/repository/platform-tools_r33.0.3-windows.zip',
      fileExtensionPattern: /\.zip$/,
    },
    relativePlatformToolsPath: 'platform-tools',
  },
};

export class AndroidSdkExternalUnit extends IExternalUnit {
  private readonly logger = new PrefixLogger(logger, '[Android SDK]');

  constructor(
    private readonly dotEnvConfigService: DotEnvConfigService,
    private readonly stdLogCallbackService: StdLogCallbackService,
    private readonly appConfigService: AppConfigService,
    private readonly windowService: WindowService,
    private readonly unitCallback: ExternalUnitCallback,
  ) {
    super();
  }

  isPlatformSupported(): boolean {
    return true;
  }

  isManualInstallNeeded(): boolean {
    return false;
  }

  getKey(): ExternalKey {
    return 'android-sdk';
  }

  getName(): string {
    return 'Android SDK';
  }

  getEnvKeys(): string[] {
    return ['ANDROID_HOME'];
  }

  async validateInternal(): Promise<void> {
    const androidHome = this.dotEnvConfigService.get('ANDROID_HOME');
    if (!androidHome) {
      throw new Error('ANDROID_HOME not exist in env file');
    }
    const androidHomeStat = await fs.promises.stat(androidHome).catch(() => null);
    if (!androidHomeStat || !androidHomeStat.isDirectory()) {
      throw new Error(`ANDROID_HOME not exist or not directory. path: ${androidHome}`);
    }
    const commandLineToolsPath = HostPaths.android.cmdlineToolsPath(androidHome);
    const commandLineToolsStat = await fs.promises.stat(commandLineToolsPath).catch(() => null);
    if (!commandLineToolsStat || !commandLineToolsStat.isDirectory()) {
      throw new Error(`commandLineTools not exist or not directory. path: ${commandLineToolsPath}`);
    }
    const platformToolsPath = HostPaths.android.platformToolsPath(androidHome);
    const platformToolsStat = await fs.promises.stat(platformToolsPath).catch(() => null);
    if (!platformToolsStat || !platformToolsStat.isDirectory()) {
      throw new Error(`platformTools not exist or not directory. path: ${platformToolsPath}`);
    }
    const buildToolsVersionPath = HostPaths.android.buildToolsVersionPath(androidHome, Infos.buildTools.version);
    const buildToolsVersionStat = await fs.promises.stat(buildToolsVersionPath).catch(() => null);
    if (!buildToolsVersionStat || !buildToolsVersionStat.isDirectory()) {
      throw new Error(`buildTools version path is not exist or not directory. path: ${buildToolsVersionStat}`);
    }
    await this.checkAdbVersion(androidHome);
  }

  private async checkAdbVersion(androidHomePath: string): Promise<void> {
    const adbPath = HostPaths.android.adbPath(androidHomePath);
    const adbStat = await fs.promises.stat(adbPath).catch(() => null);
    if (!adbStat || !adbStat.isFile()) {
      throw new Error(`adb not exist or not file. path: ${adbPath}`);
    }
    await new Promise<void>((resolve, reject) => {
      const child = spawn(adbPath, ['--version']);
      child.on('spawn', () => {
        this.stdLogCallbackService.stdout('Checking adb version...');
      });
      child.on('error', (error) => {
        this.stdLogCallbackService.stderr(`adb version check failed. error: ${error}`);
      });
      child.on('close', (code, signal) => {
        if (code !== null) {
          if (code === 0) {
            this.stdLogCallbackService.stdout('adb version check completed.');
            resolve();
          } else {
            this.stdLogCallbackService.stderr(`adb version check failed. code: ${code}`);
            reject(new Error(`adb version check failed. code: ${code}`));
          }
        } else {
          this.stdLogCallbackService.stderr(`adb version check failed. signal: ${signal}`);
          reject(new Error(`adb version check failed. signal: ${signal}`));
        }
      });
      child.stdout.setEncoding('utf8');
      child.stdout.on('data', (data) => {
        const message = stringify(data);
        if (!message) {
          return;
        }
        this.stdLogCallbackService.stdout(message);
        this.logger.info(message);
      });
      child.stderr.setEncoding('utf8');
      child.stderr.on('data', (data) => {
        const message = stringify(data);
        if (!message) {
          return;
        }
        this.stdLogCallbackService.stderr(message);
        this.logger.warn(message);
      });
    });
  }

  private getCommandLineToolsDownloadUrl(): string {
    if (process.platform === 'darwin') {
      return Infos.commandLineTools.darwin.url;
    } else if (process.platform === 'win32') {
      return Infos.commandLineTools.win32.url;
    } else {
      throw new Error(`Unsupported platform: ${process.platform}`);
    }
  }

  async install(): Promise<void> {
    let commandLineToolsSavePath = '';
    let commandLineToolsUncompressedPath = '';
    let platformToolsSavePath = '';
    let platformToolsUncompressedPath = '';
    try {
      this.unitCallback.onInstallStarted();
      await this.createDefaultAndroidHomeDir();

      commandLineToolsSavePath = await this.downloadCommandLineTools();
      commandLineToolsUncompressedPath = await this.uncompressCommandLineTools(commandLineToolsSavePath);
      const commandLineToolsUncompressedDirPath = await this.validateCommandLineToolsDirInUncompressedPath(commandLineToolsUncompressedPath);
      await this.moveCommandLineTools(commandLineToolsUncompressedDirPath);

      platformToolsSavePath = await this.downloadPlatformTools();
      platformToolsUncompressedPath = await this.uncompressPlatformTools(platformToolsSavePath);
      const platformToolsUncompressedDirPath = await this.validatePlatformToolsDirInUncompressedPath(platformToolsUncompressedPath);
      await this.movePlatformTools(platformToolsUncompressedDirPath);

      const sdkManagerPath = await this.ensureSdkManagerPath(HostPaths.external.defaultAndroidHomePath());
      await this.acceptSdkManagerLicenses(sdkManagerPath);
      await this.updateSdkManager(sdkManagerPath);
      await this.downloadBuildTools(sdkManagerPath);

      await this.writeEnv_ANDROID_HOME();
      this.unitCallback.onInstallCompleted();
    } finally {
      if (commandLineToolsSavePath) {
        await fs.promises.rm(commandLineToolsSavePath, { recursive: true, force: true });
      }
      if (commandLineToolsUncompressedPath) {
        await fs.promises.rm(commandLineToolsUncompressedPath, { recursive: true, force: true });
      }
      if (platformToolsSavePath) {
        await fs.promises.rm(platformToolsSavePath, { recursive: true, force: true });
      }
      if (platformToolsUncompressedPath) {
        await fs.promises.rm(platformToolsUncompressedPath, { recursive: true, force: true });
      }
    }
  }

  private async writeEnv_ANDROID_HOME(): Promise<void> {
    this.stdLogCallbackService.stdout('Writing ANDROID_HOME to env file...');
    await this.dotEnvConfigService.write('ANDROID_HOME', HostPaths.external.defaultAndroidHomePath());
    this.stdLogCallbackService.stdout('Write complete');
  }

  private getPlatformToolsDownloadUrl(): string {
    if (process.platform === 'darwin') {
      return Infos.platformTools.darwin.url;
    } else if (process.platform === 'win32') {
      return Infos.platformTools.win32.url;
    } else {
      throw new Error(`Unsupported platform: ${process.platform}`);
    }
  }

  private async downloadPlatformTools(): Promise<string> {
    const window = this.windowService.window;
    if (!window) {
      throw new Error('window not exist');
    }
    if (this.canceler) {
      throw new Error('already installing');
    }
    const platformToolsDownloadUrl = this.getPlatformToolsDownloadUrl();
    const downloadsPath = HostPaths.downloadsPath(HostPaths.doguHomePath);
    await fs.promises.mkdir(downloadsPath, { recursive: true });
    const platformToolsItem = await download(window, platformToolsDownloadUrl, {
      directory: downloadsPath,
      onStarted: (item) => {
        this.canceler = () => {
          item.cancel();
        };
        this.unitCallback.onDownloadStarted();
        this.stdLogCallbackService.stdout(`Download started. url: ${item.getURL()}`);
      },
      onProgress: (progress) => {
        this.unitCallback.onDownloadInProgress(progress);
      },
    });
    this.canceler = null;
    const platformToolsSavePath = platformToolsItem.getSavePath();
    this.stdLogCallbackService.stdout(`Download completed. path: ${platformToolsSavePath}`);
    this.unitCallback.onDownloadCompleted();
    return platformToolsSavePath;
  }

  private async downloadBuildTools(sdkManagerPath: string): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      const child = spawn(sdkManagerPath, [`build-tools;${Infos.buildTools.version}`]);
      child.on('spawn', () => {
        this.stdLogCallbackService.stdout('Downloading build-tools and platform-tools...');
      });
      child.on('error', (error) => {
        this.stdLogCallbackService.stderr(`sdkmanager download failed. error: ${error}`);
      });
      child.on('close', (code, signal) => {
        if (code !== null) {
          if (code === 0) {
            this.stdLogCallbackService.stdout('sdkmanager download completed.');
            resolve();
          } else {
            this.stdLogCallbackService.stderr(`sdkmanager download failed. code: ${code}`);
            reject(new Error(`sdkmanager download failed. code: ${code}`));
          }
        } else {
          this.stdLogCallbackService.stderr(`sdkmanager download failed. signal: ${signal}`);
          reject(new Error(`sdkmanager download failed. signal: ${signal}`));
        }
      });
      child.stdout.setEncoding('utf8');
      child.stdout.on('data', (data) => {
        const message = stringify(data);
        if (!message) {
          return;
        }
        this.stdLogCallbackService.stdout(message);
        this.logger.info(message);
      });
      child.stderr.setEncoding('utf8');
      child.stderr.on('data', (data) => {
        const message = stringify(data);
        if (!message) {
          return;
        }
        this.stdLogCallbackService.stderr(message);
        this.logger.warn(message);
      });
    });
  }

  private async downloadCommandLineTools(): Promise<string> {
    const window = this.windowService.window;
    if (!window) {
      throw new Error('window not exist');
    }
    if (this.canceler) {
      throw new Error('already installing');
    }
    const commandLineToolsDownloadUrl = this.getCommandLineToolsDownloadUrl();
    const downloadsPath = HostPaths.downloadsPath(HostPaths.doguHomePath);
    await fs.promises.mkdir(downloadsPath, { recursive: true });
    const commandLineToolsItem = await download(window, commandLineToolsDownloadUrl, {
      directory: downloadsPath,
      onStarted: (item) => {
        this.canceler = () => {
          item.cancel();
        };
        this.unitCallback.onDownloadStarted();
        this.stdLogCallbackService.stdout(`Download started. url: ${item.getURL()}`);
      },
      onProgress: (progress) => {
        this.unitCallback.onDownloadInProgress(progress);
      },
    });
    this.canceler = null;
    const commandLineToolsSavePath = commandLineToolsItem.getSavePath();
    this.stdLogCallbackService.stdout(`Download completed. path: ${commandLineToolsSavePath}`);
    this.unitCallback.onDownloadCompleted();
    return commandLineToolsSavePath;
  }

  private async validatePlatformToolsDirInUncompressedPath(platformToolsUncompressedPath: string): Promise<string> {
    const platformToolsDirPath = path.resolve(platformToolsUncompressedPath, Infos.platformTools.relativePlatformToolsPath);
    const platformToolsDirStat = await fs.promises.stat(platformToolsDirPath).catch(() => null);
    if (!platformToolsDirStat || !platformToolsDirStat.isDirectory()) {
      throw new Error(`platformToolsUncompressedDir not exist or not directory. path: ${platformToolsDirPath}`);
    }
    return platformToolsDirPath;
  }

  private async uncompressPlatformTools(savePath: string): Promise<string> {
    this.stdLogCallbackService.stdout(`Uncompressing... path: ${savePath}`);
    const platformToolsFileExtensionPattern = this.getPlatformToolsFileExtensionPattern();
    const uncompressedPath = savePath.replace(platformToolsFileExtensionPattern, '');
    await fs.promises.rm(uncompressedPath, { recursive: true, force: true });
    await compressing.zip.uncompress(savePath, uncompressedPath);
    this.stdLogCallbackService.stdout(`Uncompress completed. path: ${uncompressedPath}`);
    return uncompressedPath;
  }

  private getPlatformToolsFileExtensionPattern(): RegExp {
    if (process.platform === 'darwin') {
      return Infos.platformTools.darwin.fileExtensionPattern;
    } else if (process.platform === 'win32') {
      return Infos.platformTools.win32.fileExtensionPattern;
    } else {
      throw new Error(`Unsupported platform: ${process.platform}`);
    }
  }

  private async movePlatformTools(platformToolsUncompressedDirPath: string): Promise<void> {
    const defaultAndroidHomePath = HostPaths.external.defaultAndroidHomePath();
    const defaultPlatformToolsPath = HostPaths.android.platformToolsPath(defaultAndroidHomePath);
    const defaultPlatformToolsParentPath = path.dirname(defaultPlatformToolsPath);
    this.stdLogCallbackService.stdout(`Creating... ${defaultPlatformToolsParentPath}`);
    await fs.promises.mkdir(defaultPlatformToolsParentPath, { recursive: true });
    this.stdLogCallbackService.stdout(`Create complete. ${defaultPlatformToolsParentPath}`);

    this.stdLogCallbackService.stdout(`Moving... ${platformToolsUncompressedDirPath} -> ${defaultPlatformToolsPath}`);
    await fs.promises.rename(platformToolsUncompressedDirPath, defaultPlatformToolsPath);
    this.stdLogCallbackService.stdout(`Move complete. ${platformToolsUncompressedDirPath} -> ${defaultPlatformToolsPath}`);
  }

  private async updateSdkManager(sdkManagerPath: string): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      const child = spawn(sdkManagerPath, ['--update']);
      child.on('spawn', () => {
        this.stdLogCallbackService.stdout('Updating sdkmanager...');
      });
      child.on('error', (error) => {
        this.stdLogCallbackService.stderr(`sdkmanager update failed. error: ${error}`);
      });
      child.on('close', (code, signal) => {
        if (code !== null) {
          if (code === 0) {
            this.stdLogCallbackService.stdout('sdkmanager update completed.');
            resolve();
          } else {
            this.stdLogCallbackService.stderr(`sdkmanager update failed. code: ${code}`);
            reject(new Error(`sdkmanager update failed. code: ${code}`));
          }
        } else {
          this.stdLogCallbackService.stderr(`sdkmanager update failed. signal: ${signal}`);
          reject(new Error(`sdkmanager update failed. signal: ${signal}`));
        }
      });
      child.stdout.setEncoding('utf8');
      child.stdout.on('data', (data) => {
        const message = stringify(data);
        if (!message) {
          return;
        }
        this.stdLogCallbackService.stdout(message);
        this.logger.info(message);
      });
      child.stderr.setEncoding('utf8');
      child.stderr.on('data', (data) => {
        const message = stringify(data);
        if (!message) {
          return;
        }
        this.stdLogCallbackService.stderr(message);
        this.logger.warn(message);
      });
    });
  }

  private async acceptSdkManagerLicenses(sdkManagerPath: string): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      const child = spawn(sdkManagerPath, ['--licenses']);
      child.on('spawn', () => {
        this.stdLogCallbackService.stdout('Accepting sdkmanager licenses...');
      });
      child.on('error', (error) => {
        this.stdLogCallbackService.stderr(`sdkmanager licenses accept failed. error: ${error}`);
      });
      child.on('close', (code, signal) => {
        if (code !== null) {
          if (code === 0) {
            this.stdLogCallbackService.stdout('sdkmanager licenses accept completed.');
            resolve();
          } else {
            this.stdLogCallbackService.stderr(`sdkmanager licenses accept failed. code: ${code}`);
            reject(new Error(`sdkmanager licenses accept failed. code: ${code}`));
          }
        } else {
          this.stdLogCallbackService.stderr(`sdkmanager licenses accept failed. signal: ${signal}`);
          reject(new Error(`sdkmanager licenses accept failed. signal: ${signal}`));
        }
      });
      child.stdout.setEncoding('utf8');
      child.stdout.on('data', (data) => {
        const message = stringify(data);
        if (!message) {
          return;
        }
        if (message.includes('(y/N)')) {
          child.stdin.write('y\n');
        }
        this.stdLogCallbackService.stdout(message);
        this.logger.info(message);
      });
      child.stderr.setEncoding('utf8');
      child.stderr.on('data', (data) => {
        const message = stringify(data);
        if (!message) {
          return;
        }
        this.stdLogCallbackService.stderr(message);
        this.logger.warn(message);
      });
    });
  }

  private async ensureSdkManagerPath(androidHomePath: string): Promise<string> {
    const sdkManagerPath = HostPaths.android.sdkmanagerPath(androidHomePath);
    const sdkManagerStat = await fs.promises.stat(sdkManagerPath).catch(() => null);
    if (!sdkManagerStat || !sdkManagerStat.isFile()) {
      throw new Error(`sdkmanager not exist or not file. path: ${sdkManagerPath}`);
    }
    return sdkManagerPath;
  }

  private async createDefaultAndroidHomeDir(): Promise<void> {
    const defaultAndroidHomePath = HostPaths.external.defaultAndroidHomePath();
    const defaultAndroidHomeStat = await fs.promises.stat(defaultAndroidHomePath).catch(() => null);
    if (defaultAndroidHomeStat && defaultAndroidHomeStat.isDirectory()) {
      this.stdLogCallbackService.stdout(`Deleting default ANDROID_HOME... ${defaultAndroidHomePath}`);
      await fs.promises.rm(defaultAndroidHomePath, { recursive: true, force: true });
      this.stdLogCallbackService.stdout(`Delete complete. ${defaultAndroidHomePath}`);
    }

    this.stdLogCallbackService.stdout(`Creating... ${defaultAndroidHomePath}`);
    await fs.promises.mkdir(defaultAndroidHomePath, { recursive: true });
    this.stdLogCallbackService.stdout(`Create complete. ${defaultAndroidHomePath}`);
  }

  private async moveCommandLineTools(commandLineToolsUncompressedDirPath: string): Promise<void> {
    const defaultAndroidHomePath = HostPaths.external.defaultAndroidHomePath();
    const defaultCommandLineToolsPath = HostPaths.android.cmdlineToolsPath(defaultAndroidHomePath);
    const defaultCommandLineToolsParentPath = path.dirname(defaultCommandLineToolsPath);
    this.stdLogCallbackService.stdout(`Creating... ${defaultCommandLineToolsParentPath}`);
    await fs.promises.mkdir(defaultCommandLineToolsParentPath, { recursive: true });
    this.stdLogCallbackService.stdout(`Create complete. ${defaultCommandLineToolsParentPath}`);

    this.stdLogCallbackService.stdout(`Moving... ${commandLineToolsUncompressedDirPath} -> ${defaultCommandLineToolsPath}`);
    await fs.promises.rename(commandLineToolsUncompressedDirPath, defaultCommandLineToolsPath);
    this.stdLogCallbackService.stdout(`Move complete. ${commandLineToolsUncompressedDirPath} -> ${defaultCommandLineToolsPath}`);
  }

  private async validateCommandLineToolsDirInUncompressedPath(commandLineToolsUncompressedPath: string): Promise<string> {
    const commandLineToolsDirPath = path.resolve(commandLineToolsUncompressedPath, Infos.commandLineTools.relativeCommandLineToolsPath);
    const commandLineToolsDirStat = await fs.promises.stat(commandLineToolsDirPath).catch(() => null);
    if (!commandLineToolsDirStat || !commandLineToolsDirStat.isDirectory()) {
      throw new Error(`commandLineToolsUncompressedDir not exist or not directory. path: ${commandLineToolsDirPath}`);
    }
    return commandLineToolsDirPath;
  }

  private getCommandLineToolsFileExtensionPattern(): RegExp {
    if (process.platform === 'darwin') {
      return Infos.commandLineTools.darwin.fileExtensionPattern;
    } else if (process.platform === 'win32') {
      return Infos.commandLineTools.win32.fileExtensionPattern;
    } else {
      throw new Error(`Unsupported platform: ${process.platform}`);
    }
  }

  private async uncompressCommandLineTools(savePath: string): Promise<string> {
    this.stdLogCallbackService.stdout(`Uncompressing... path: ${savePath}`);
    const commandLineToolsFileExtensionPattern = this.getCommandLineToolsFileExtensionPattern();
    const uncompressedPath = savePath.replace(commandLineToolsFileExtensionPattern, '');
    await fs.promises.rm(uncompressedPath, { recursive: true, force: true });
    await compressing.zip.uncompress(savePath, uncompressedPath);
    this.stdLogCallbackService.stdout(`Uncompress completed. path: ${uncompressedPath}`);
    return uncompressedPath;
  }

  cancelInstall(): void {
    if (!this.canceler) {
      this.logger.warn('canceler not exist');
      return;
    }
    this.canceler();
    this.canceler = null;
  }

  uninstall(): void {
    this.logger.warn('uninstall not supported');
  }

  async isAgreementNeeded(): Promise<boolean> {
    const value = (await this.appConfigService.get<boolean>('DOGU_IS_ANDROID_TERMS_AGREED')) ?? false;
    return !value;
  }

  writeAgreement(value: boolean): Promise<void> {
    return this.appConfigService.set('DOGU_IS_ANDROID_TERMS_AGREED', value);
  }

  getTermUrl(): string | null {
    return 'https://developer.android.com/studio/terms';
  }
}
