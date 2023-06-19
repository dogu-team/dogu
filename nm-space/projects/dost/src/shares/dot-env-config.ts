import { instanceKeys } from './electron-ipc';

export const dotEnvConfigClientKey = instanceKeys<IDotEnvConfigClient>('dotEnvConfigClient');

export type DotEnvConfigKey = 'JAVA_HOME' | 'ANDROID_HOME' | 'APPIUM_HOME';

export interface IDotEnvConfigClient {
  load(): Promise<void>;
  get(key: DotEnvConfigKey): Promise<string | undefined>;
  getDotEnvConfigPath(): Promise<string>;
}
