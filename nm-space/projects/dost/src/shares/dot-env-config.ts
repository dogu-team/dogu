import { DotEnvConfigKey } from '@dogu-private/dogu-agent-core';
import { instanceKeys } from './electron-ipc';
export { type DotEnvConfigKey };

export const dotEnvConfigClientKey = instanceKeys<IDotEnvConfigClient>('dotEnvConfigClient');

export interface IDotEnvConfigClient {
  set(key: DotEnvConfigKey, value: string): Promise<void>;
  get(key: DotEnvConfigKey): Promise<string | undefined>;
  getDotEnvConfigPath(): Promise<string>;
}
