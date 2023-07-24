import { PreloadDeviceServerEnv, PreloadHostAgentEnv } from '@dogu-private/dost-children';
import { Class, transformAndValidate } from '@dogu-tech/common';
import dotenv from 'dotenv';
import isDev from 'electron-is-dev';
import fs from 'fs';
import _ from 'lodash';
import path from 'path';
import { Env } from '../env';
import { logger } from '../log/logger.instance';
import { AppConfigService } from './app-config-service';

interface DotenvInfo<T extends Class<T> = any> {
  fileName: string;
  classConstructor: T;
}

async function findDotenvFileInSearchPaths(searchPaths: string[], fileName: string): Promise<string | null> {
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
    {
      fileName: '.env.dost',
      classConstructor: Env,
    },
  ];

  constructor() {
    if (isDev) {
      this.searchPaths.push(process.cwd());
    }
    this.searchPaths.push(path.resolve(process.resourcesPath, 'dotenv'));
  }

  async find(key: string): Promise<string | null> {
    const { searchPaths, dotenvInfos } = this;
    for (const { fileName } of dotenvInfos) {
      const found = await findDotenvFileInSearchPaths(searchPaths, fileName);
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

  async merge(instance: AppConfigService): Promise<void> {
    const { searchPaths, dotenvInfos } = this;
    for (const { fileName, classConstructor } of dotenvInfos) {
      const found = await findDotenvFileInSearchPaths(searchPaths, fileName);
      if (!found) {
        throw new Error(`file not found: ${fileName}`);
      }
      const content = await fs.promises.readFile(found, { encoding: 'utf8' });
      const parsed = dotenv.parse(content);
      const validated = await transformAndValidate(classConstructor, parsed);
      Object.entries(validated).forEach(([key, value]) => {
        if (!instance.client.has(key)) {
          instance.client.set(key, value);
        }
      });
    }
  }
}
