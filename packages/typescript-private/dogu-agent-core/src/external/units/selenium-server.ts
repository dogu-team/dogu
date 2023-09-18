import { PrefixLogger, Printable } from '@dogu-tech/common';
import { download, HostPaths, renameRetry } from '@dogu-tech/node';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import util from 'util';
import { AppConfigService } from '../../app-config/service';
import { ExternalKey, ExternalUnitCallback } from '../types';
import { IExternalUnit } from '../unit';

const execAsync = util.promisify(exec);

const Name = 'Selenium Server';
const DownloadUrl = 'https://github.com/SeleniumHQ/selenium/releases/download/selenium-4.10.0/selenium-server-4.10.0.jar';

export class SeleniumServerExternalUnit extends IExternalUnit {
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
    return 'selenium-server';
  }

  getName(): string {
    return Name;
  }

  getEnvKeys(): string[] {
    return [];
  }

  async validateInternal(): Promise<void> {
    const seleniumServerPath = HostPaths.external.selenium.seleniumServerPath();
    const seleniumServerStat = await fs.promises.stat(seleniumServerPath).catch(() => null);
    if (!seleniumServerStat) {
      throw new Error(`${seleniumServerPath} not installed`);
    }
    if (!seleniumServerStat.isFile()) {
      throw new Error(`${seleniumServerPath} is not a file`);
    }
    const javaHomePath = HostPaths.external.defaultJavaHomePath();
    const javaPath = HostPaths.java.javaPath(javaHomePath);
    const { stdout, stderr } = await execAsync(`${javaPath} -jar ${seleniumServerPath} standalone --version`);
    if (stderr) {
      this.logger.error(stderr);
    }
    if (stdout) {
      this.logger.info(stdout);
    }
  }

  async install(): Promise<void> {
    const seleniumServerPath = HostPaths.external.selenium.seleniumServerPath();
    const seleniumDirPath = path.dirname(seleniumServerPath);
    await fs.promises.mkdir(seleniumDirPath, { recursive: true });

    const downloadFileName = DownloadUrl.split('/').pop();
    if (!downloadFileName) {
      throw new Error(`Invalid download url: ${DownloadUrl}`);
    }

    const downloadFilePath = path.join(seleniumDirPath, downloadFileName);
    this.unitCallback.onDownloadStarted();
    this.logger.info(`Download started. url: ${DownloadUrl}`);
    await download({
      url: DownloadUrl,
      filePath: downloadFilePath,
      logger: this.logger,
      onProgress: (progress) => {
        this.unitCallback.onDownloadInProgress(progress);
      },
    });
    this.unitCallback.onDownloadCompleted();
    this.logger.info(`Download completed. path: ${downloadFilePath}`);

    this.unitCallback.onInstallStarted();
    await renameRetry(downloadFilePath, seleniumServerPath, this.logger);
    this.logger.info(`Install complete. path: ${seleniumServerPath}`);
    this.unitCallback.onInstallCompleted();
  }

  cancelInstall(): void {
    this.logger.warn('cancelInstall not supported');
  }

  uninstall(): void {
    this.logger.warn('uninstall not supported');
  }

  isAgreementNeeded(): boolean {
    const value = this.appConfigService.getOrDefault('external_is_agreed_selenium_server', false);
    return !value;
  }

  writeAgreement(value: boolean): void {
    return this.appConfigService.set('external_is_agreed_selenium_server', value);
  }

  getTermUrl(): string | null {
    return null;
  }
}
