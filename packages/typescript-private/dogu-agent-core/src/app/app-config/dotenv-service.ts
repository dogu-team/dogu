import { PreloadDeviceServerEnv, PreloadHostAgentEnv } from '@dogu-private/dost-children';
import { Class, transformAndValidate } from '@dogu-tech/common';
import dotenv from 'dotenv';
import fs from 'fs';
import _ from 'lodash';
import path from 'path';
import { AppConfigService } from './app-config-service';
import { Logger } from '@dogu-tech/node';

interface DotenvInfo<T extends Class<T> = any> {
  fileName: string;
  classConstructor: T;
}

async function findDotenvFileInSearchPaths(searchPaths: string[], fileName: string, logger: Logger): Promise<string | null> {
  for (const searchPath of searchPaths) {
    const filePath = path.resolve(searchPath, fileName);
    const stat = await fs.promises.stat(filePath).catch(() => null);
    if (stat && stat.isFile()) {
      return filePath;
    }
  }
  logger.debug('file not found', { searchPaths, fileName });
  return null;
}

export interface DotEnvServiceOptions {
  isDev: boolean;
  resourcesPath: string;
  additionalDotenvInfos?: DotenvInfo[];
}

export class DotenvService {
  private readonly searchPaths: string[] = [];
  private readonly dotenvInfos: DotenvInfo[] = [
    {
      fileName: '.env.device-server',
      classConstructor: PreloadDeviceServerEnv,
    },
    {
      fileName: '.env.host-agent',
      classConstructor: PreloadHostAgentEnv,
    },
  ];

  constructor(options: DotEnvServiceOptions) {
    const { isDev, resourcesPath } = options;
    if (isDev) {
      this.searchPaths.push(process.cwd());
    }
    this.searchPaths.push(path.resolve(resourcesPath, 'dotenv'));
    if (options.additionalDotenvInfos) {
      this.dotenvInfos.push(...options.additionalDotenvInfos);
    }
  }

  async find(key: string, logger: Logger): Promise<string | null> {
    const { searchPaths, dotenvInfos } = this;
    for (const { fileName } of dotenvInfos) {
      const found = await findDotenvFileInSearchPaths(searchPaths, fileName, logger);
      if (found) {
        const content = await fs.promises.readFile(found, { encoding: 'utf8' });
        const parsed = dotenv.parse(content);
        if (_.has(parsed, key)) {
          return parsed[key];
        }
      }
    }
    return null;
  }

  async merge(appConfigService: AppConfigService, logger: Logger): Promise<void> {
    const { searchPaths, dotenvInfos } = this;
    for (const { fileName, classConstructor } of dotenvInfos) {
      const found = await findDotenvFileInSearchPaths(searchPaths, fileName, logger);
      if (!found) {
        throw new Error(`file not found: ${fileName}`);
      }
      const content = await fs.promises.readFile(found, { encoding: 'utf8' });
      const parsed = dotenv.parse(content);
      const validated = await transformAndValidate(classConstructor, parsed);
      Object.entries(validated).forEach(([key, value]) => {
        if (!appConfigService.client.has(key)) {
          appConfigService.client.set(key, value);
        }
      });
    }
  }
}
