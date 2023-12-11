import { PreloadDeviceServerEnv, PreloadHostAgentEnv } from '@dogu-private/dost-children';
import { Class, transformAndValidateSync } from '@dogu-tech/common';
import { Logger } from '@dogu-tech/node';
import dotenv from 'dotenv';
import fs from 'fs';
import _ from 'lodash';
import path from 'path';
import { AppConfigService } from './service';

interface DotenvInfo<T extends Class<T> = any> {
  fileName: string;
  classConstructor: T;
}

function findDotenvFileInSearchPathsSync(searchPaths: string[], fileName: string, logger: Logger): string | null {
  for (const searchPath of searchPaths) {
    const filePath = path.resolve(searchPath, fileName);
    let stat = null;
    try {
      stat = fs.statSync(filePath);
    } catch (e) {}
    if (stat && stat.isFile()) {
      return filePath;
    }
  }
  logger.debug('file not found', { searchPaths, fileName });
  return null;
}

export interface DotEnvMergerOptions {
  dotenvSearchPaths: string[];
  additionalDotenvInfos?: DotenvInfo[];
}

export class DotenvMerger {
  private readonly dotenvSearchPaths: string[];
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

  constructor(options: DotEnvMergerOptions) {
    this.dotenvSearchPaths = options.dotenvSearchPaths;
    if (options.additionalDotenvInfos) {
      this.dotenvInfos.push(...options.additionalDotenvInfos);
    }
  }

  find(key: string, logger: Logger): string | null {
    const { dotenvSearchPaths, dotenvInfos } = this;
    for (const { fileName } of dotenvInfos) {
      const found = findDotenvFileInSearchPathsSync(dotenvSearchPaths, fileName, logger);
      if (found) {
        const content = fs.readFileSync(found, { encoding: 'utf8' });
        const parsed = dotenv.parse(content);
        if (_.has(parsed, key)) {
          return parsed[key];
        }
      }
    }
    return null;
  }

  merge(appConfigService: AppConfigService, logger: Logger): void {
    const { dotenvSearchPaths, dotenvInfos } = this;
    for (const { fileName, classConstructor } of dotenvInfos) {
      const found = findDotenvFileInSearchPathsSync(dotenvSearchPaths, fileName, logger);
      if (!found) {
        throw new Error(`file not found: ${fileName}`);
      }
      const content = fs.readFileSync(found, { encoding: 'utf8' });
      const parsed = dotenv.parse(content);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const validated = transformAndValidateSync(classConstructor, parsed) as Record<string, unknown>;
      Object.entries(validated).forEach(([key, value]) => {
        if (!appConfigService.client.has(key)) {
          appConfigService.client.set(key, value);
        }
      });
    }
  }
}
