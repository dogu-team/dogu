import { Printable } from '@dogu-tech/common';
import fs from 'fs';
import path from 'path';

const CwdConfigFilePath = path.resolve(process.cwd(), 'feature.config.json');

function configPathByDoguRunType(doguRunType: string): string {
  return path.resolve(process.cwd(), 'features', `${doguRunType}.feature.config.json`);
}

function createFeatureConfigFileNotFoundError(...paths: string[]): Error {
  return new Error(`Feature config file not found. paths: ${paths.join(', ')}`);
}

function parseConfig<T>(filePath: string, content: string, printable: Printable): FeatureConfig<T> {
  try {
    const data = JSON.parse(content) as T;
    printable.info(`Feature config load complete. path: ${filePath}`);
    return new FeatureConfig<T>(filePath, data);
  } catch (error) {
    printable.error(`Feature config load failed. path: ${filePath}`);
    throw error;
  }
}

export function loadFeatureConfigSync<T>(doguRunType: string, printable: Printable): FeatureConfig<T> {
  const isCwdConfigExist = fs.existsSync(CwdConfigFilePath);
  if (isCwdConfigExist) {
    const content = fs.readFileSync(CwdConfigFilePath, 'utf8');
    return parseConfig<T>(CwdConfigFilePath, content, printable);
  } else {
    const configPath = configPathByDoguRunType(doguRunType);
    const isRunTypeConfigExist = fs.existsSync(configPath);
    if (!isRunTypeConfigExist) {
      throw createFeatureConfigFileNotFoundError(CwdConfigFilePath, configPath);
    }
    const content = fs.readFileSync(configPath, 'utf8');
    return parseConfig<T>(configPath, content, printable);
  }
}

export async function loadFeatureConfig<T>(doguRunType: string, printable: Printable, resourcesPath?: string): Promise<FeatureConfig<T>> {
  const isExist = async (path: string): Promise<boolean> => {
    return fs.promises
      .stat(path)
      .then((stat) => {
        return stat.isFile();
      })
      .catch(() => false);
  };
  if (resourcesPath) {
    const resourcesConfigPath = path.resolve(resourcesPath, 'feature.config.json');
    const isResourcesConfigExist = await isExist(resourcesConfigPath);
    if (isResourcesConfigExist) {
      const content = await fs.promises.readFile(resourcesConfigPath, 'utf8');
      return parseConfig<T>(resourcesConfigPath, content, printable);
    }
    throw new Error(`Feature config file not found. path: ${resourcesConfigPath}`);
  }
  const isCwdConfigExist = await isExist(CwdConfigFilePath);
  if (isCwdConfigExist) {
    const content = await fs.promises.readFile(CwdConfigFilePath, 'utf8');
    return parseConfig<T>(CwdConfigFilePath, content, printable);
  } else {
    const configPath = configPathByDoguRunType(doguRunType);
    const isRunTypeConfigExist = await isExist(configPath);
    if (!isRunTypeConfigExist) {
      throw createFeatureConfigFileNotFoundError(CwdConfigFilePath, configPath);
    }
    const content = await fs.promises.readFile(configPath, 'utf8');
    return parseConfig<T>(configPath, content, printable);
  }
}

export class FeatureConfig<T> {
  constructor(readonly filePath: string, private readonly data: T) {}

  get(key: keyof T): T[keyof T] {
    return this.data[key];
  }
}
