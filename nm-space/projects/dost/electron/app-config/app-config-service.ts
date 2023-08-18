import { app, ipcMain } from 'electron';
import isDev from 'electron-is-dev';
import Store from 'electron-store';
import fs from 'fs';
import _ from 'lodash';
import path from 'path';
import { AgreementKey, appConfigClientKey, IAppConfigClient, Key, schema, Schema } from '../../src/shares/app-config';
import { logger } from '../log/logger.instance';
import { ConfigsPath } from '../path-map';
import { DotenvService } from './dotenv-service';

type Client = Store<Schema>;

const AppConfigFileNameWithoutExtension = app.name.toLowerCase().replaceAll(' ', '-');
const AppConfigFileExtension = 'json';

async function clearConfigsIfInvalid(dotenvService: DotenvService): Promise<void> {
  const doguRunTypeKey = 'DOGU_RUN_TYPE';
  const appConfigFilePath = path.resolve(ConfigsPath, `${AppConfigFileNameWithoutExtension}.${AppConfigFileExtension}`);
  const stat = await fs.promises.stat(appConfigFilePath).catch(() => null);
  if (stat && stat.isFile()) {
    const appConfigContent = await fs.promises.readFile(appConfigFilePath, { encoding: 'utf8' });
    const appConfigParsed = JSON.parse(appConfigContent);
    const appConfigDoguRunType = _.get(appConfigParsed, doguRunTypeKey) as string | undefined;
    const dotenvDoguRunType = await dotenvService.find(doguRunTypeKey);
    if (appConfigDoguRunType && dotenvDoguRunType && appConfigDoguRunType !== dotenvDoguRunType) {
      await fs.promises.rm(ConfigsPath, { recursive: true, force: true });
    }
  }
  await fs.promises.mkdir(ConfigsPath, { recursive: true });
}

export class AppConfigService implements IAppConfigClient {
  static instance: AppConfigService;

  static async open(): Promise<void> {
    Store.initRenderer();

    const dotenvService = new DotenvService();
    await clearConfigsIfInvalid(dotenvService);

    const client = new Store<Schema>({
      name: AppConfigFileNameWithoutExtension,
      schema,
      accessPropertiesByDotNotation: false,
      cwd: ConfigsPath,
      fileExtension: AppConfigFileExtension,
      clearInvalidConfig: true,
      migrations: {
        '0.0.0': (store) => {
          store.clear();
        },
      },
    });
    logger.debug('config path', { path: client.path });

    AppConfigService.instance = new AppConfigService(client);
    const { instance } = AppConfigService;
    await dotenvService.merge(instance);

    ipcMain.handle(appConfigClientKey.getOrDefault, (_, key: Key, value: unknown) => instance.getOrDefault(key, value));
    ipcMain.handle(appConfigClientKey.get, (_, key: Key) => instance.get(key));
    ipcMain.handle(appConfigClientKey.set, (_, key: Key, value: any) => instance.set(key, value));
    ipcMain.handle(appConfigClientKey.delete, (_, key: Key) => instance.delete(key));
  }

  private constructor(readonly client: Client) {}

  getOrDefault<T = any>(key: Key, value: T): Promise<T> {
    return Promise.resolve((this.client.get(key) as unknown as T) ?? value);
  }

  get<T = any>(key: Key): Promise<T> {
    return Promise.resolve(this.client.get(key) as unknown as T);
  }

  set<T = any>(key: Key, value: T): Promise<void> {
    return Promise.resolve(this.client.set(key, value));
  }

  delete(key: Key): Promise<void> {
    return Promise.resolve(this.client.delete(key));
  }

  openJsonConfig(): void {
    if (isDev) {
      AppConfigService.instance.client.openInEditor();
    }
  }

  async getAgreement(key: AgreementKey): Promise<boolean> {
    const agreements = (await this.client.get('DOGU_EXTERNAL_AGREEMENTS_STATUS')) as unknown as Record<AgreementKey, boolean>;
    return agreements[key] ?? false;
  }

  async setAgreement(key: AgreementKey, value: boolean): Promise<void> {
    const agreements = (await this.client.get('DOGU_EXTERNAL_AGREEMENTS_STATUS')) as unknown as Record<AgreementKey, boolean>;
    agreements[key] = value;
    await this.client.set('DOGU_EXTERNAL_AGREEMENTS_STATUS', agreements);
  }
}
