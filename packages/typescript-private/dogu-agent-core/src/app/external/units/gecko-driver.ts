import { PrefixLogger, Printable } from '@dogu-tech/common';
import { download, HostPaths, renameRetry } from '@dogu-tech/node';
import { exec } from 'child_process';
import compressing from 'compressing';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { ExternalKey } from '../../../shares/external';
import { AppConfigService } from '../../app-config/service';
import { ExternalUnitCallback } from '../types';
import { IExternalUnit } from '../unit';

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
  private readonly logger: PrefixLogger;

  constructor(
    private readonly appConfigService: AppConfigService, //
    private readonly unitCallback: ExternalUnitCallback,
    logger: Printable,
  ) {
    super();
    this.logger = new PrefixLogger(logger, `[${Name}]`);
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
    const geckodriverPath = HostPaths.external.browser.geckodriverPath();
    const stat = await fs.promises.stat(geckodriverPath).catch(() => null);
    if (!stat || !stat.isFile()) {
      throw new Error('gecko driver not found or not a file');
    }

    const { stdout, stderr } = await execAsync(`${geckodriverPath} --version`, { timeout: 60_000 });
    if (stdout) {
      this.logger.info(stdout);
    }
    if (stderr) {
      this.logger.error(stderr);
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
      this.logger.info('install completed');
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
    const geckodriverPath = HostPaths.external.browser.geckodriverPath();
    await fs.promises.mkdir(HostPaths.external.browser.browsersPath(), { recursive: true });
    const stat = await fs.promises.stat(geckodriverPath).catch(() => null);
    if (stat) {
      await fs.promises.rm(geckodriverPath, { recursive: true, force: true });
    }
    await renameRetry(source, geckodriverPath, this.logger);
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
    if (this.canceler) {
      throw new Error('already installing');
    }
    const downloadUrl = this.getDownloadUrl();
    const downloadsPath = HostPaths.downloadsPath(HostPaths.doguHomePath);
    await fs.promises.mkdir(downloadsPath, { recursive: true });
    const downloadFileName = downloadUrl.split('/').pop();
    if (!downloadFileName) {
      throw new Error(`Invalid download url: ${downloadUrl}`);
    }

    this.canceler = (): void => {
      /* noop */
    };
    this.unitCallback.onDownloadStarted();
    const geckoDriverSavePath = path.resolve(downloadsPath, downloadFileName);
    this.logger.info(`Download started. url: ${downloadUrl}`);
    await download({
      url: downloadUrl,
      filePath: geckoDriverSavePath,
      logger: this.logger,
      onProgress: (progress) => {
        this.unitCallback.onDownloadInProgress(progress);
      },
    });
    this.unitCallback.onDownloadCompleted();
    this.canceler = null;
    this.logger.info(`Download completed. path: ${geckoDriverSavePath}`);
    return geckoDriverSavePath;
  }

  cancelInstall(): void {
    this.logger.warn('cancelInstall not supported');
  }

  uninstall(): void {
    this.logger.warn('uninstall not supported');
  }

  isAgreementNeeded(): boolean {
    const value = this.appConfigService.getOrDefault('external_is_agreed_gecko_driver', false);
    return !value;
  }

  writeAgreement(value: boolean): void {
    return this.appConfigService.set('external_is_agreed_gecko_driver', value);
  }

  getTermUrl(): string | null {
    return null;
  }
}
