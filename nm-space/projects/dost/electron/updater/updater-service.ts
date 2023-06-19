import { app, ipcMain } from 'electron';
import isDev from 'electron-is-dev';
import log from 'electron-log';
import { autoUpdater } from 'electron-updater';
import { InstallUpdateResult, UpdateCheckResult, updaterClientKey } from '../../src/shares/updater';
import { ChildService } from '../child/child-service';
import { Env } from '../env';
import { logger } from '../log/logger.instance';
import { AppConfigService } from '../app-config/app-config-service';
import { WindowService } from '../window/window-service';

export class UpdaterService {
  static instance: UpdaterService;
  private constructor(private readonly dostEnv: Env) {
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
    ipcMain.handle(updaterClientKey.getAppVersion, () => app.getVersion());
    ipcMain.handle(updaterClientKey.checkForUpdates, () => this.checkForUpdates());
    ipcMain.handle(updaterClientKey.downloadAndInstallUpdate, () => this.downloadAndInstallUpdate());
  }

  static async open(appConfig: AppConfigService): Promise<void> {
    const dostEnv: Env = {
      DOGU_APPUPDATE_PROVIDER: (await appConfig.get('DOGU_APPUPDATE_PROVIDER')) || 's3',
      DOGU_APPUPDATE_URL: (await appConfig.get('DOGU_APPUPDATE_URL')) || 'error',
      DOGU_APPUPDATE_SUBPATH: (await appConfig.get('DOGU_APPUPDATE_SUBPATH')) || '',
      DOGU_APPUPDATE_REGION: (await appConfig.get('DOGU_APPUPDATE_REGION')) || 'ap-northeast-2',
    };
    UpdaterService.instance = new UpdaterService(dostEnv);
  }

  async checkForUpdates(): Promise<UpdateCheckResult> {
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
  }

  async downloadAndInstallUpdate(): Promise<InstallUpdateResult> {
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
        setImmediate(() => {
          app.removeAllListeners('window-all-closed');
          app.removeAllListeners('before-quit');
          WindowService.close();
          autoUpdater.quitAndInstall();
        });
      });
      try {
        autoUpdater.downloadUpdate();
      } catch (e: unknown) {
        resolve({
          error: `${e}`,
        });
      }
    });
  }
}
