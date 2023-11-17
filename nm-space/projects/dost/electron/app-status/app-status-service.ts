import { errorify } from '@dogu-tech/common';
import { app, ipcMain } from 'electron';
import { appStatusClientKey } from '../../src/shares/app-status';
import { logger } from '../log/logger.instance';

const AppTranslocationPathPattern = /\/private\/var.*AppTranslocation.*/;

export class AppStatusService {
  static instance: AppStatusService;

  private static _open = (() => {
    AppStatusService.instance = new AppStatusService();
    ipcMain.handle(appStatusClientKey.isAppLocationValid, () => AppStatusService.instance.isAppLocationValid());
    ipcMain.handle(appStatusClientKey.isServicesOpened, () => AppStatusService.instance.isServicesOpened());
  })();

  async openServices(onOpenServices: () => Promise<void>) {
    try {
      await onOpenServices();
      this._isServicesOpened = true;
    } catch (error) {
      this._isServicesOpened = false;
      logger.error('openServices error', { error: errorify(error) });
      throw error;
    }
  }

  private _isServicesOpened = false;

  isServicesOpened(): boolean {
    return this._isServicesOpened;
  }

  isAppLocationValid(): boolean {
    const appPath = app.getAppPath();
    if (appPath.match(AppTranslocationPathPattern)) {
      return false;
    }

    return true;
  }
}
