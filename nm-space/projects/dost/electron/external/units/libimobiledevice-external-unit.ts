import { errorify, PrefixLogger, stringify } from '@dogu-tech/common';
import { getFileSizeRecursive, HostPaths } from '@dogu-tech/node';
import compressing from 'compressing';
import fs from 'fs';
import fsPromise from 'fs/promises';
import https from 'https';
import path from 'path';
import shelljs from 'shelljs';
import { ExternalKey } from '../../../src/shares/external';
import { logger } from '../../log/logger.instance';
import { StdLogCallbackService } from '../../log/std-log-callback-service';
import { ExternalUnitCallback, IExternalUnit } from '../external-unit';

interface File {
  condition?: () => boolean;
  url: string;
  path: () => string;
  unzipDirName?: string;
}

const files: File[] = [
  {
    condition: () => process.platform === 'darwin',
    url: 'https://github.com/dogu-team/third-party-binaries/releases/download/libimobiledevice-1.0.6/idevicediagnostics-arm64',
    path: () => HostPaths.external.libimobiledevice.idevicediagnostics(),
  },
  {
    condition: () => process.platform === 'darwin',
    url: 'https://github.com/dogu-team/third-party-binaries/releases/download/libimobiledevice-1.0.6/idevicediagnostics-x64',
    path: () => HostPaths.external.libimobiledevice.idevicediagnostics(),
  },
  {
    condition: () => process.platform === 'darwin',
    url: 'https://github.com/dogu-team/third-party-binaries/releases/download/libimobiledevice-1.0.6/idevicesyslog-arm64',
    path: () => HostPaths.external.libimobiledevice.idevicesyslog(),
  },
  {
    condition: () => process.platform === 'darwin',
    url: 'https://github.com/dogu-team/third-party-binaries/releases/download/libimobiledevice-1.0.6/idevicesyslog-x64',
    path: () => HostPaths.external.libimobiledevice.idevicesyslog(),
  },
  {
    condition: () => process.platform === 'darwin',
    url: 'https://github.com/dogu-team/third-party-binaries/releases/download/libimobiledevice-1.0.6/libimobiledevice-dylib-arm64.zip',
    path: () => HostPaths.external.libimobiledevice.libimobiledeviceLibPath(),
    unzipDirName: 'libimobiledevice',
  },
  {
    condition: () => process.platform === 'darwin',
    url: 'https://github.com/dogu-team/third-party-binaries/releases/download/libimobiledevice-1.0.6/libimobiledevice-dylib-x64.zip',
    path: () => HostPaths.external.libimobiledevice.libimobiledeviceLibPath(),
    unzipDirName: 'libimobiledevice',
  },
];

export class LibimobledeviceExternalUnit extends IExternalUnit {
  private readonly logger = new PrefixLogger(logger, '[libimobiledevice]');

  constructor(private readonly stdLogCallbackService: StdLogCallbackService, private readonly unitCallback: ExternalUnitCallback) {
    super();
  }

  isPlatformSupported(): boolean {
    return process.platform === 'darwin';
  }

  isManualInstallNeeded(): boolean {
    return false;
  }

  getKey(): ExternalKey {
    return 'libimobiledevice';
  }

  getName(): string {
    return 'libimobiledevice';
  }

  getEnvKeys(): string[] {
    return [];
  }

  async validateInternal(): Promise<void> {
    for (const file of files) {
      const path = file.path();
      if (!fs.existsSync(path)) {
        throw new Error(`${path} not found`);
      }
      const size = await getFileSizeRecursive(path);
      if (size === 0) {
        throw new Error(`${path} is empty`);
      }
    }
  }

  isAgreementNeeded(): boolean {
    return false;
  }

  writeAgreement(): void {
    this.logger.warn('do not need agreement');
  }

  async install(): Promise<void> {
    this.unitCallback.onInstallStarted();
    await makeDirectories();

    for (const file of files) {
      const name = path.basename(file.url);
      await download(file, this.stdLogCallbackService).catch((err) => {
        this.stdLogCallbackService.stderr(`Failed to download ${file.url}: ${err}`);
        throw err;
      });
    }

    this.unitCallback.onInstallCompleted();
  }

  cancelInstall(): void {
    this.logger.warn('cancel install not supported');
  }

  uninstall(): void {
    this.logger.warn('uninstall not supported');
  }

  getTermUrl(): string | null {
    return null;
  }
}

async function download(file: File, stdLogCallbackService: StdLogCallbackService): Promise<void> {
  const shouldDownload = file.condition?.() ?? true;
  if (!shouldDownload) {
    return;
  }
  const fileUrl = file.url;
  const destinationPath = file.path();

  shelljs.rm('-rf', destinationPath);
  const isZip = fileUrl.endsWith('.zip');

  stdLogCallbackService.stdout(`downloading ${file.url}`);
  await getRetry(fileUrl, destinationPath, stdLogCallbackService);

  stdLogCallbackService.stdout(`${destinationPath} downloaded`);
  if (isZip) {
    stdLogCallbackService.stdout(`${destinationPath} unzipping`);
    fs.renameSync(destinationPath, destinationPath + '.zip');
    await compressing.zip.uncompress(destinationPath + '.zip', path.dirname(destinationPath));
    removeMacosxFiles(destinationPath);
    if (file.unzipDirName) {
      await renameUnzipedDir(file.unzipDirName, destinationPath, '.zip', stdLogCallbackService);
    }

    fs.unlinkSync(destinationPath + '.zip');
  }

  stdLogCallbackService.stdout(`${destinationPath} done`);
}

async function getRetry(url: string, destPath: string, stdLogCallbackService: StdLogCallbackService): Promise<void> {
  for (let i = 0; i < 20; i++) {
    try {
      return await get(url, destPath);
    } catch (err) {
      stdLogCallbackService.stderr(errorify(err).message);
      stdLogCallbackService.stderr(`Failed to download ${url}, ${err} retrying...`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
  throw new Error(`Failed to download ${url}`);
}

async function get(url: string, destPath: string): Promise<void> {
  return new Promise((resolve, reject): void => {
    const file = fs.createWriteStream(destPath);
    https
      .get(url, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          get(res.headers.location!, destPath).then(resolve).catch(reject);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`Failed to download ${url} with status code ${res.statusCode ?? 'unknown'}`));
          return;
        }
        res.pipe(file);
        file.on('finish', () => {
          fs.chmodSync(destPath, 0o777);
          file.close();
          resolve();
        });
      })
      .on('error', (err) => {
        console.error(`Failed to download ${url}`);
        fs.unlink(destPath, () => {
          reject(err);
        });
      });
  });
}

function removeMacosxFiles(destPath: string): void {
  const macosxPath = path.resolve(path.dirname(destPath), '__MACOSX');
  shelljs.rm('-rf', macosxPath);
}

async function renameUnzipedDir(fileUrl: string, destPath: string, ext: string, stdLogCallbackService: StdLogCallbackService): Promise<void> {
  const uncompressedDirPath = path.resolve(path.dirname(destPath), path.basename(fileUrl).replace(ext, ''));
  if (fs.existsSync(uncompressedDirPath) && !fs.existsSync(destPath)) {
    for (let i = 0; i < 10; i++) {
      try {
        fs.renameSync(uncompressedDirPath, destPath);
        break;
      } catch (e) {
        stdLogCallbackService.stderr(`rename failed ${i} times. ${stringify(e)}`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        continue;
      }
    }
  }
}

async function makeDirectories(): Promise<void> {
  for (const file of files) {
    const dirPath = file.path();
    if (fs.existsSync(dirPath)) {
      continue;
    }
    await fsPromise.mkdir(dirPath, { recursive: true });
  }
}
