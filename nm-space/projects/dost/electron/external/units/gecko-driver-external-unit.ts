import { BrowserInstaller } from '@dogu-private/device-server';
import { PrefixLogger } from '@dogu-tech/common';
import { HostPaths, renameRetry } from '@dogu-tech/node';
import { exec } from 'child_process';
import compressing from 'compressing';
import { download } from 'electron-dl';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { ExternalKey } from '../../../src/shares/external';
import { logger } from '../../log/logger.instance';
import { StdLogCallbackService } from '../../log/std-log-callback-service';
import { WindowService } from '../../window/window-service';
import { ExternalUnitCallback, IExternalUnit } from '../external-unit';

const execAsync = promisify(exec);

const Name = 'Gecko Driver';

const Infos = {
  win32: {
    url: 'https://github.com/mozilla/geckodriver/releases/download/v0.33.0/geckodriver-v0.33.0-win64.zip',
    uncompress: compressing.zip.uncompress,
    fileExtensionPattern: /\.zip$/,
    relativePath: 'geckodriver.exe',
  },
  darwin: {
    url: {
      x64: 'https://github.com/mozilla/geckodriver/releases/download/v0.33.0/geckodriver-v0.33.0-macos.tar.gz',
      arm64: 'https://github.com/mozilla/geckodriver/releases/download/v0.33.0/geckodriver-v0.33.0-macos-aarch64.tar.gz',
    },
    uncompress: compressing.tgz.uncompress,
    fileExtensionPattern: /\.tar(?: \(\d+\))?\.gz$/,
    relativePath: 'geckodriver',
  },
};

export class GeckoDriverExternalUnit extends IExternalUnit {
  private readonly logger = new PrefixLogger(logger, `[${Name}]`);
  private readonly browserInstaller = new BrowserInstaller();

  constructor(private readonly windowService: WindowService, private readonly stdLogCallbackService: StdLogCallbackService, private readonly unitCallback: ExternalUnitCallback) {
    super();
  }

  private info(message: string): void {
    this.stdLogCallbackService.stdout(message);
    this.logger.info(message);
  }

  private warn(message: string): void {
    this.stdLogCallbackService.stderr(message);
    this.logger.warn(message);
  }

  isPlatformSupported(): boolean {
    return true;
  }

  isManualInstallNeeded(): boolean {
    return false;
  }

  getKey(): ExternalKey {
    return 'gecko-driver';
  }

  getName(): string {
    return Name;
  }

  getEnvKeys(): string[] {
    return [];
  }

  async validateInternal(): Promise<void> {
    const geckoDriverPath = HostPaths.external.browser.geckoDriverPath();
    const stat = await fs.promises.stat(geckoDriverPath).catch(() => null);
    if (!stat || !stat.isFile()) {
      throw new Error('gecko driver not found or not a file');
    }

    const { stdout, stderr } = await execAsync(`${geckoDriverPath} --version`, { timeout: 5_000 });
    if (stdout) {
      this.info(stdout);
    }
    if (stderr) {
      this.warn(stderr);
    }
  }

  async install(): Promise<void> {
    let compressedFilePath = '';
    let uncompressedPath = '';
    try {
      this.unitCallback.onInstallStarted();
      compressedFilePath = await this.download();
      uncompressedPath = await this.uncompress(compressedFilePath);
      await this.moveFile(uncompressedPath);
      this.unitCallback.onInstallCompleted();
      this.info('install completed');
    } finally {
      if (compressedFilePath) {
        await fs.promises.rm(compressedFilePath, { recursive: true, force: true });
      }
      if (uncompressedPath) {
        await fs.promises.rm(uncompressedPath, { recursive: true, force: true });
      }
    }
  }

  private getRelativePath(): string {
    if (process.platform === 'win32') {
      return Infos.win32.relativePath;
    } else if (process.platform === 'darwin') {
      return Infos.darwin.relativePath;
    } else {
      throw new Error(`Unsupported platform: ${process.platform}`);
    }
  }

  private async moveFile(uncompressedPath: string): Promise<void> {
    const relativePath = this.getRelativePath();
    const source = path.resolve(uncompressedPath, relativePath);
    const geckoDriverPath = HostPaths.external.browser.geckoDriverPath();
    await this.browserInstaller.lockBrowsersPath(async () => {
      await fs.promises.mkdir(HostPaths.external.browser.browsersPath(), { recursive: true });
      const stat = await fs.promises.stat(geckoDriverPath).catch(() => null);
      if (stat) {
        await fs.promises.rm(geckoDriverPath, { recursive: true, force: true });
      }
      await renameRetry(source, geckoDriverPath, this.stdLogCallbackService.createPrintable());
    });
  }

  private getUncompressFunction(): (source: string, dest: string) => Promise<void> {
    if (process.platform === 'win32') {
      return Infos.win32.uncompress;
    } else if (process.platform === 'darwin') {
      return Infos.darwin.uncompress;
    } else {
      throw new Error(`Unsupported platform: ${process.platform}`);
    }
  }

  private getFileExtensionPattern(): RegExp {
    if (process.platform === 'win32') {
      return Infos.win32.fileExtensionPattern;
    } else if (process.platform === 'darwin') {
      return Infos.darwin.fileExtensionPattern;
    } else {
      throw new Error(`Unsupported platform: ${process.platform}`);
    }
  }

  private async uncompress(compressedFilePath: string): Promise<string> {
    const uncompressFunction = this.getUncompressFunction();
    const fileExtensionPattern = this.getFileExtensionPattern();
    const uncompressedPath = compressedFilePath.replace(fileExtensionPattern, '');
    await uncompressFunction(compressedFilePath, uncompressedPath);
    return uncompressedPath;
  }

  private getDownloadUrl(): string {
    if (process.platform === 'win32') {
      return Infos.win32.url;
    } else if (process.platform === 'darwin') {
      if (process.arch === 'x64') {
        return Infos.darwin.url.x64;
      } else if (process.arch === 'arm64') {
        return Infos.darwin.url.arm64;
      } else {
        throw new Error(`Unsupported arch: ${process.arch}`);
      }
    } else {
      throw new Error(`Unsupported platform: ${process.platform}`);
    }
  }

  private async download(): Promise<string> {
    const window = this.windowService.window;
    if (!window) {
      throw new Error('window not exist');
    }
    if (this.canceler) {
      throw new Error('already installing');
    }
    const downloadUrl = this.getDownloadUrl();
    const downloadsPath = HostPaths.downloadsPath(HostPaths.doguHomePath);
    await fs.promises.mkdir(downloadsPath, { recursive: true });
    const geckoDriverItem = await download(window, downloadUrl, {
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
    const geckoDriverSavePath = geckoDriverItem.getSavePath();
    this.stdLogCallbackService.stdout(`Download completed. path: ${geckoDriverSavePath}`);
    this.unitCallback.onDownloadCompleted();
    return geckoDriverSavePath;
  }

  cancelInstall(): void {
    this.logger.warn('cancelInstall not supported');
  }

  uninstall(): void {
    this.logger.warn('uninstall not supported');
  }

  isAgreementNeeded(): boolean {
    return false;
  }

  writeAgreement(): void {
    this.logger.warn('do not need agreement');
  }

  getTermUrl(): string | null {
    return null;
  }
}
