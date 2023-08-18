import { GetLatestVersionResponse } from '@dogu-private/dost-children';
import { app, ipcMain } from 'electron';
import { InstallUpdateResult, UpdateCheckResult, updaterClientKey } from '../../src/shares/updater';
import { AppConfigService } from '../app-config/app-config-service';
import { ChildService } from '../child/child-service';
import { FeatureConfigService } from '../feature-config/feature-config-service';
import { logger } from '../log/logger.instance';

export class UpdaterService {
  static instance: UpdaterService;
  private lastestVersion: GetLatestVersionResponse | undefined;

  private constructor(private readonly featureConfigService: FeatureConfigService, private readonly childService: ChildService) {
    ipcMain.handle(updaterClientKey.getAppVersion, () => app.getVersion());
    ipcMain.handle(updaterClientKey.checkForUpdates, () => this.checkForUpdates());
    ipcMain.handle(updaterClientKey.downloadAndInstallUpdate, () => this.downloadAndInstallUpdate());
  }

  static async open(appConfig: AppConfigService, featureConfigService: FeatureConfigService, childService: ChildService): Promise<void> {
    UpdaterService.instance = new UpdaterService(featureConfigService, childService);
  }

  async checkForUpdates(): Promise<UpdateCheckResult> {
    logger.verbose('checkForUpdates');
    if (!this.featureConfigService.get('useAppUpdate')) {
      return {
        lastestVersion: app.getVersion(),
        error: '',
      };
    }
    try {
      this.lastestVersion = await this.childService.hostAgent.getLatestVersion();
      return {
        lastestVersion: this.lastestVersion.version,
        error: '',
      };
    } catch (e: unknown) {
      return {
        lastestVersion: app.getVersion(),
        error: `${e}`,
      };
    }
  }

  async downloadAndInstallUpdate(): Promise<InstallUpdateResult> {
    logger.verbose('downloadAndInstallUpdate');
    if (!this.featureConfigService.get('useAppUpdate')) {
      return {
        error: '',
      };
    }
    if (!this.lastestVersion) {
      return {
        error: 'No latest version',
      };
    }
    try {
      await this.childService.hostAgent.updateLatestVersion(this.lastestVersion);
      return {
        error: '',
      };
    } catch (e: unknown) {
      return {
        error: `${e}`,
      };
    }
  }
}
