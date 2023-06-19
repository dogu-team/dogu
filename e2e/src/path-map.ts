import fs from 'fs';
import path from 'path';
import { ChromeVersionFinder } from './chrome-version';

interface IPathMap {
  root: string;
  chromeDriver: string;
}

function findChromeDriverPathSync(): string {
  const { platform, arch } = process;
  const versionFinder = new ChromeVersionFinder();
  const version = versionFinder.findSync();
  const { major } = version;
  if (platform === 'win32') {
    return path.resolve(`third-party/${major}/win32/chromedriver.exe`);
  }
  return path.resolve(`third-party/${major}/${platform}/${arch}/chromedriver`);
}

function resolveExecutableSync(path: string): string {
  fs.chmodSync(path, 0o755);
  fs.accessSync(path, fs.constants.X_OK);
  return path;
}

function resolve(): IPathMap {
  const root = path.resolve('../');
  const chromeDriver = resolveExecutableSync(findChromeDriverPathSync());
  return { root, chromeDriver };
}

export const pathMap = resolve();
