import { BrowserInstaller } from '@dogu-private/device-server';
import { PrefixLogger } from '@dogu-tech/common';
import { ExternalKey } from '../../../src/shares/external';
import { logger } from '../../log/logger.instance';
import { StdLogCallbackService } from '../../log/std-log-callback-service';
import { ExternalUnitCallback, IExternalUnit } from '../external-unit';

const Name = 'Chrome Driver';
const BrowserName = 'chrome';
const BrowserDriverName = 'chromedriver';
const DefaultVersion = 'latest';

export class ChromeDriverExternalUnit extends IExternalUnit {
  private readonly logger = new PrefixLogger(logger, `[${Name}]`);
  private readonly browserInstaller = new BrowserInstaller();

  constructor(private readonly stdLogCallbackService: StdLogCallbackService, private readonly unitCallback: ExternalUnitCallback) {
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
    return 'chrome-driver';
  }

  getName(): string {
    return Name;
  }

  getEnvKeys(): string[] {
    return [];
  }

  async validateInternal(): Promise<void> {
    const resolvedBrowserVersion = await this.browserInstaller.resolveLatestVersion(BrowserName, DefaultVersion);
    const foundBrowserVersion = await this.browserInstaller.findHighestInstalledVersion(BrowserName, resolvedBrowserVersion);
    if (!foundBrowserVersion) {
      /**
       * @note depends on chrome browser
       */
      return;
    }

    const isInstalled = await this.browserInstaller.isInstalled(BrowserDriverName, foundBrowserVersion);
    if (!isInstalled) {
      throw new Error('Chrome driver not found');
    }
  }

  async install(): Promise<void> {
    this.unitCallback.onDownloadStarted();
    const resolvedBrowserVersion = await this.browserInstaller.resolveLatestVersion(BrowserName, DefaultVersion);
    const toDownloadVersion = await this.browserInstaller.resolveToDownloadVersion(BrowserDriverName, resolvedBrowserVersion);

    let downloadPercent = 0;
    await this.browserInstaller.install({
      name: BrowserDriverName,
      version: toDownloadVersion,
      downloadProgressCallback: (downloadedBytes, totalBytes) => {
        const percent = Math.ceil((downloadedBytes * 100) / totalBytes);
        this.unitCallback.onDownloadInProgress({
          percent,
          transferredBytes: downloadedBytes,
          totalBytes,
        });
        if (percent > downloadPercent) {
          this.info(`download progress: ${percent}%`);
          downloadPercent = percent;
        }
      },
    });
    this.unitCallback.onDownloadCompleted();
    this.unitCallback.onInstallStarted();
    this.unitCallback.onInstallCompleted();
    this.info('install completed');
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
