import { Logger } from '@dogu-tech/node';
import Store from 'electron-store';
import fs from 'fs';
import _ from 'lodash';
import path from 'path';
import { AppConfigKey, AppConfigSchema } from '../../shares/app-config';
import { DotenvService, DotEnvServiceOptions } from './dotenv-service';

export type Client = Store<AppConfigSchema>;

export interface AppConfigServiceOptions {
  isDev: boolean;
  client: Client;
}

export class AppConfigService {
  private readonly isDev: boolean;
  readonly client: Readonly<Client>;

  constructor(options: AppConfigServiceOptions) {
    this.isDev = options.isDev;
    this.client = options.client;
  }

  getOrDefault<T = any>(key: AppConfigKey, value: T): T {
    return (this.client.get(key) as unknown as T) ?? value;
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

  openJsonConfig(): void {
    if (this.isDev) {
      this.client.openInEditor();
    }
  }
}
