import { instanceKeys } from './electron-ipc';

export const schema = {
  NODE_ENV: {
    type: 'string',
  },
  DOGU_RUN_TYPE: {
    type: 'string',
  },
  DOGU_HOST_TOKEN: {
    type: 'string',
  },
  DOGU_API_BASE_URL: {
    type: 'string',
  },
  DOGU_DEVICE_SERVER_HOST_PORT: {
    type: 'string',
  },
  DOGU_DEVICE_SERVER_PORT: {
    type: 'number',
  },
  DOGU_APPUPDATE_PROVIDER: {
    type: 'string',
  },
  DOGU_APPUPDATE_URL: {
    type: 'string',
  },
  DOGU_APPUPDATE_SUBPATH: {
    type: 'string',
  },
  DOGU_APPUPDATE_REGION: {
    type: 'string',
  },
  DOGU_IS_ANDROID_TERMS_AGREED: {
    type: 'boolean',
  },
  DOGU_IS_SUPPORTED_PLATFORM_VALID: {
    type: 'boolean',
  },
  DOGU_HOST_AGENT_PORT: {
    type: 'number',
  },
} as const;

export type Schema = typeof schema;
export type Key = keyof Schema;

export const appConfigClientKey = instanceKeys<IAppConfigClient>('appConfigClient');

export interface IAppConfigClient {
  get: <T = any>(key: Key) => Promise<T>;
  set: <T = any>(key: Key, value: T) => Promise<void>;
  delete: (key: Key) => Promise<void>;
}
