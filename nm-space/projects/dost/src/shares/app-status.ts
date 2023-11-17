import { instanceKeys } from './electron-ipc';

export const appStatusClientKey = instanceKeys<IAppStatusClient>('appStatusClient');

export interface IAppStatusClient {
  isAppLocationValid: () => Promise<boolean>;
  isServicesOpened: () => Promise<boolean>;
}
