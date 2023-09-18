import { DotenvConfigKey } from '@dogu-private/dogu-agent-core/shares';
import { instanceKeys } from './electron-ipc';

export const dotenvConfigClientKey = instanceKeys<IDotenvConfigClient>('dotenvConfigClient');

export interface IDotenvConfigClient {
  set(key: DotenvConfigKey, value: string): Promise<void>;
  get(key: DotenvConfigKey): Promise<string | undefined>;
  getDotenvConfigPath(): Promise<string>;
}
