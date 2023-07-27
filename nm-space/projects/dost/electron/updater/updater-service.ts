import { app, ipcMain } from 'electron';
import isDev from 'electron-is-dev';
import log from 'electron-log';
import { autoUpdater } from 'electron-updater';
import { InstallUpdateResult, UpdateCheckResult, updaterClientKey } from '../../src/shares/updater';
import { AppConfigService } from '../app-config/app-config-service';
import { ChildService } from '../child/child-service';
import { Env } from '../env';
import { FeatureConfigService } from '../feature-config/feature-config-service';
import { logger } from '../log/logger.instance';
import { WindowService } from '../window/window-service';

export class UpdaterService {
  static instance: UpdaterService;

  private constructor(private readonly dostEnv: Env, private readonly featureConfigService: FeatureConfigService) {
    if (this.featureConfigService.get('useAppUpdate')) {
      log.transports.file.level = isDev ? 'debug' : 'info';
      autoUpdater.logger = logger;

      autoUpdater.setFeedURL({
        provider: dostEnv.DOGU_APPUPDATE_PROVIDER as 's3',
        bucket: dostEnv.DOGU_APPUPDATE_URL,
        region: dostEnv.DOGU_APPUPDATE_REGION,
        path: dostEnv.DOGU_APPUPDATE_SUBPATH,
      });
      if (!app.isPackaged) {
        autoUpdater.forceDevUpdateConfig = true;
      }
    }
    ipcMain.handle(updaterClientKey.getAppVersion, () => app.getVersion());
    ipcMain.handle(updaterClientKey.checkForUpdates, () => this.checkForUpdates());
    ipcMain.handle(updaterClientKey.downloadAndInstallUpdate, () => this.downloadAndInstallUpdate());
  }

  static async open(appConfig: AppConfigService, featureConfigService: FeatureConfigService): Promise<void> {
    const dostEnv: Env = {
      DOGU_APPUPDATE_PROVIDER: (await appConfig.get('DOGU_APPUPDATE_PROVIDER')) || '',
      DOGU_APPUPDATE_URL: (await appConfig.get('DOGU_APPUPDATE_URL')) || '',
      DOGU_APPUPDATE_SUBPATH: (await appConfig.get('DOGU_APPUPDATE_SUBPATH')) || '',
      DOGU_APPUPDATE_REGION: (await appConfig.get('DOGU_APPUPDATE_REGION')) || '',
    };
    UpdaterService.instance = new UpdaterService(dostEnv, featureConfigService);
  }

  async checkForUpdates(): Promise<UpdateCheckResult> {
    if (this.featureConfigService.get('useAppUpdate')) {
      logger.verbose('checkForUpdates');
      if (!app.isPackaged) {
        logger.verbose('checkForUpdates app not packaged');
        return {
          lastestVersion: app.getVersion(),
          error: '',
        };
      }
      return new Promise((resolve) => {
        autoUpdater.once('update-available', (info) => {
          logger.verbose(`checkForUpdates.update-available ${info}}`);
          resolve({
            lastestVersion: info.version,
            error: '',
          });
        });
        autoUpdater.once('update-not-available', (info) => {
          logger.verbose(`checkForUpdates.update-not-available`, { info });
          resolve({
            lastestVersion: app.getVersion(),
            error: '',
          });
        });
        autoUpdater.once('error', (error) => {
          logger.error(`checkForUpdates.error ${error}`);
          resolve({
            lastestVersion: '',
            error: error.message,
          });
        });
        try {
          autoUpdater.checkForUpdates();
        } catch (e: unknown) {
          resolve({
            lastestVersion: app.getVersion(),
            error: `${e}`,
          });
        }
      });
    } else {
      return {
        lastestVersion: app.getVersion(),
        error: '',
      };
    }
  }

  async downloadAndInstallUpdate(): Promise<InstallUpdateResult> {
    if (this.featureConfigService.get('useAppUpdate')) {
      logger.verbose('downloadAndInstallUpdate');
      await ChildService.close();

      return new Promise((resolve) => {
        autoUpdater.once('error', (error) => {
          logger.error(`downloadAndInstallUpdate.error ${error}`);
          resolve({
            error: error.message,
          });
        });
        autoUpdater.once('update-downloaded', (info) => {
          logger.error(`downloadAndInstallUpdate.update-downloaded ${info}`);
          const timeout = process.platform === 'darwin' ? 10000 : 1000;

          setTimeout(() => {
            // https://github.com/electron-userland/electron-builder/issues/6058#issuecomment-1130344017
            WindowService.close();
            autoUpdater.quitAndInstall();
            app.exit();
          }, timeout);
        });
        try {
          autoUpdater.downloadUpdate();
        } catch (e: unknown) {
          resolve({
            error: `${e}`,
          });
        }
      });
    } else {
      return {
        error: '',
      };
    }
  }
}
