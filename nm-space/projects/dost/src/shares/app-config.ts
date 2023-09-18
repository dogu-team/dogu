import { AppConfigKey, AppConfigSchema } from '@dogu-private/dogu-agent-core';
import { instanceKeys } from './electron-ipc';

export const appConfigClientKey = instanceKeys<IAppConfigClient>('appConfigClient');

export type AppConfigTable = {
  [K in keyof AppConfigSchema]?: any;
};

export interface IAppConfigClient {
  getOrDefault: <T = any>(key: AppConfigKey, value: T) => Promise<T>;
  get: <T = any>(key: AppConfigKey) => Promise<T>;
  set: <T = any>(key: AppConfigKey, value: T) => Promise<void>;
  delete: (key: AppConfigKey) => Promise<void>;
}
