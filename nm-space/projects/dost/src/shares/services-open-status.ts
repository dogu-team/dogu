import { instanceKeys } from './electron-ipc';

export const servicesOpenStatusClientKey = instanceKeys<IServicesOpenStatusClient>('servicesOpenStatusClient');

export interface IServicesOpenStatusClient {
  isServicesOpened: () => Promise<boolean>;
}
