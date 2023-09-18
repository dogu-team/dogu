import Conf from 'conf';
import { AppConfigKey, AppConfigSchema } from '../../shares/app-config';

export type Client = Conf<AppConfigSchema>;

export interface AppConfigServiceOptions {
  enableOpenInEditor: boolean;
  client: Client;
}

export class AppConfigService {
  readonly client: Readonly<Client>;

  constructor(options: AppConfigServiceOptions) {
    this.client = options.client;
  }

  getOrDefault<T = any>(key: AppConfigKey, defaultValue: T): T {
    return (this.client.get(key) as unknown as T) ?? defaultValue;
  }

  get<T = any>(key: AppConfigKey): T {
    return this.client.get(key) as unknown as T;
  }

  set<T = any>(key: AppConfigKey, value: T): void {
    this.client.set(key, value);
  }

  delete(key: AppConfigKey): void {
    this.client.delete(key);
  }
}
