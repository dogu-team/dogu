import { PreloadDeviceServerEnv, PreloadHostAgentEnv } from '@dogu-private/dost-children';
import { Class, transformAndValidate } from '@dogu-tech/common';
import dotenv from 'dotenv';
import isDev from 'electron-is-dev';
import fs, { constants } from 'fs';
import path from 'path';
import { Env } from '../env';
import { logger } from '../log/logger.instance';
import { AppConfigService } from './app-config-service';

interface DotenvInfo<T extends Class<T> = any> {
  fileName: string;
  classConstructor: T;
}

export class DotenvMerger {
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

  async merge(instance: AppConfigService): Promise<void> {
    const { searchPaths, dotenvInfos } = this;
    for (const { fileName, classConstructor } of dotenvInfos) {
      let found = '';
      for (const searchPath of searchPaths) {
        try {
          const filePath = path.resolve(searchPath, fileName);
          fs.promises.access(filePath, constants.R_OK);
          found = filePath;
          break;
        } catch (error) {
          logger.debug('file not found', { searchPath, fileName });
          continue;
        }
      }
      if (!found) {
        throw new Error(`file not found: ${fileName}`);
      }
      const content = await fs.promises.readFile(found);
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
