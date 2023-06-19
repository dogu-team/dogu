import { errorify } from '@dogu-tech/common';
import fs from 'fs';
import lodash from 'lodash';
import path from 'path';
import yaml from 'yaml';

interface Schema {
  parent?: string;
  [key: string]: unknown;
}

export class OptionsConfig {
  private readonly config: Schema;

  constructor(config_: Schema = {}) {
    Reflect.deleteProperty(config_, 'parent');
    this.config = config_;
  }

  get<T>(path: string, defaultValue: T): T {
    return lodash.get(this.config, path, defaultValue) as T;
  }

  static async load(filePath: string = 'options.config.yaml'): Promise<OptionsConfig> {
    return OptionsConfig.loadRecursive(filePath, []);
  }

  private static async loadRecursive(filePath: string, children: Schema[]): Promise<OptionsConfig> {
    const stat = await fs.promises.stat(filePath).catch(() => null);
    if (!stat) {
      return new OptionsConfig(lodash.merge({}, ...children));
    }
    if (!stat.isFile()) {
      throw new Error(`File is not a file. path: ${filePath}`);
    }
    const content = await fs.promises.readFile(filePath, {
      encoding: 'utf8',
    });
    let config: Schema | null = null;
    try {
      config = yaml.parse(content) as Schema;
    } catch (error) {
      throw new Error(`Invalid YAML. path: ${filePath}`, { cause: errorify(error) });
    }
    if (!config) {
      throw new Error(`Config is null. path: ${filePath}`);
    }
    if (!config.parent || config.parent.length === 0) {
      return new OptionsConfig(lodash.merge(config, ...children));
    } else {
      const parentPath = path.resolve(config.parent, filePath);
      return OptionsConfig.loadRecursive(parentPath, [config, ...children]);
    }
  }
}

export const NullOptionsConfig = new OptionsConfig();
