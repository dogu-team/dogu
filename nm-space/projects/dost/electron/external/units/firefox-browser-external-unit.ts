import { BrowserInstaller } from '@dogu-private/device-server';
import { PrefixLogger } from '@dogu-tech/common';
import { ExternalKey } from '../../../src/shares/external';
import { logger } from '../../log/logger.instance';
import { StdLogCallbackService } from '../../log/std-log-callback-service';
import { ExternalUnitCallback, IExternalUnit } from '../external-unit';

const Name = 'Firefox Browser';
const BrowserName = 'firefox';
const DefaultVersion = 'latest';

export class FirefoxBrowserExternalUnit extends IExternalUnit {
  private readonly logger = new PrefixLogger(logger, `[${Name}]`);
  private readonly browserInstaller = new BrowserInstaller();

  constructor(private readonly stdLogCallbackService: StdLogCallbackService, private readonly unitCallback: ExternalUnitCallback) {
    super();
  }

  isPlatformSupported(): boolean {
    return true;
  }

  isManualInstallNeeded(): boolean {
    return false;
  }

  getKey(): ExternalKey {
    return 'firefox-browser';
  }

  getName(): string {
    return Name;
  }

  getEnvKeys(): string[] {
    return [];
  }

  async validateInternal(): Promise<void> {
    const isInstalled = await this.browserInstaller.isInstalled(BrowserName, DefaultVersion);
    if (!isInstalled) {
      throw new Error(`${BrowserName} not installed`);
    }
  }

  async install(): Promise<void> {
    this.unitCallback.onDownloadStarted();
    let downloadPercent = 0;
    await this.browserInstaller.install({
      name: BrowserName,
      version: DefaultVersion,
      downloadProgressCallback: (downloadedBytes, totalBytes) => {
        const percent = Math.ceil((downloadedBytes * 100) / totalBytes);
        this.unitCallback.onDownloadInProgress({
          percent,
          transferredBytes: downloadedBytes,
          totalBytes,
        });
        if (percent > downloadPercent) {
          this.stdLogCallbackService.stdout(`download progress: ${percent}%`);
          downloadPercent = percent;
        }
      },
    });
    this.unitCallback.onDownloadCompleted();
    this.unitCallback.onInstallStarted();
    this.unitCallback.onInstallCompleted();
    this.stdLogCallbackService.stdout('install completed');
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
