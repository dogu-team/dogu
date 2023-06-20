import { HostPaths } from '@dogu-tech/node';
import dotenv from 'dotenv';
import { ipcMain } from 'electron';
import fs from 'fs';
import { dotEnvConfigClientKey, DotEnvConfigKey } from '../../src/shares/dot-env-config';
import { AppConfigService } from '../app-config/app-config-service';
import { logger } from '../log/logger.instance';
import { dotEnvConfigPath } from '../path-map';

export class DotEnvConfigService {
  static instance: DotEnvConfigService;

  private constructor(private readonly dotEnvConfigPath: string) {}

  static async open(appConfigService: AppConfigService): Promise<void> {
    const runType = await appConfigService.get<string>('DOGU_RUN_TYPE');
    DotEnvConfigService.instance = new DotEnvConfigService(dotEnvConfigPath(runType));
    const { instance } = DotEnvConfigService;
    await instance.load();
    ipcMain.handle(dotEnvConfigClientKey.load, () => instance.load());
    ipcMain.handle(dotEnvConfigClientKey.get, (_, key: string) => {
      return process.env[key];
    });
    ipcMain.handle(dotEnvConfigClientKey.getDotEnvConfigPath, () => instance.dotEnvConfigPath);
  }

  async load(): Promise<void> {
    logger.verbose('external env load');
    const stat = await fs.promises.stat(this.dotEnvConfigPath).catch(() => null);
    if (!stat) {
      logger.verbose('external env not exist. write default external env');
      await this.writeDefaultExternalEnv();
    }
    const result = dotenv.config({ path: this.dotEnvConfigPath, override: true });
    if (result.error) {
      logger.error('external env load error', { error: result.error });
    }
  }

  getDotEnvConfigPath(): string {
    return this.dotEnvConfigPath;
  }

  get(key: DotEnvConfigKey): string | undefined {
    return process.env[key];
  }

  async write(key: DotEnvConfigKey, value: string): Promise<void> {
    process.env[key] = value;
    const content = await fs.promises.readFile(this.dotEnvConfigPath, 'utf8');
    const lines = content.split('\n');
    const lineIndex = lines.findIndex((line) => line.startsWith(`${key}=`));
    if (lineIndex === -1) {
      lines.push(`${key}=${value}`);
    } else {
      lines[lineIndex] = `${key}=${value}`;
    }
    await fs.promises.writeFile(this.dotEnvConfigPath, lines.join('\n'));
  }

  private async writeDefaultExternalEnv(): Promise<void> {
    const content = `JAVA_HOME=${HostPaths.external.defaultJavaHomePath()}
ANDROID_HOME=${HostPaths.external.defaultAndroidHomePath()}
APPIUM_HOME=${HostPaths.external.defaultAppiumHomePath()}
`;
    await fs.promises.writeFile(this.dotEnvConfigPath, content);
  }
}
