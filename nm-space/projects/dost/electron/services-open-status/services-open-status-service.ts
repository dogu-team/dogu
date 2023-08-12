import { errorify } from '@dogu-tech/common';
import { ipcMain } from 'electron';
import { servicesOpenStatusClientKey } from '../../src/shares/services-open-status';
import { logger } from '../log/logger.instance';

export class ServicesOpenStatusService {
  static instance: ServicesOpenStatusService;

  private static _open = (() => {
    ServicesOpenStatusService.instance = new ServicesOpenStatusService();
    ipcMain.handle(servicesOpenStatusClientKey.isServicesOpened, () => ServicesOpenStatusService.instance.isServicesOpened());
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
}
