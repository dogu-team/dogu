import { errorify, PrefixLogger, stringify } from '@dogu-tech/common';
import { getFileSizeRecursive, HostPaths, removeItemRecursive } from '@dogu-tech/node';
import compressing from 'compressing';
import { download } from 'electron-dl';
import fs from 'fs';
import fsPromise from 'fs/promises';
import https from 'https';
import path from 'path';
import shelljs from 'shelljs';
import { ExternalKey } from '../../../src/shares/external';
import { logger } from '../../log/logger.instance';
import { StdLogCallbackService } from '../../log/std-log-callback-service';
import { WindowService } from '../../window/window-service';
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

  constructor(private readonly stdLogCallbackService: StdLogCallbackService, private readonly windowService: WindowService, private readonly unitCallback: ExternalUnitCallback) {
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

    const window = this.windowService.window;
    if (!window) {
      throw new Error('window not exist');
    }

    for (const file of files) {
      const downloadsPath = HostPaths.downloadsPath(HostPaths.doguHomePath);
      await fs.promises.mkdir(downloadsPath, { recursive: true });
      const downloadItem = await download(window, file.url, {
        directory: downloadsPath,
        onStarted: (item) => {
          this.unitCallback.onDownloadStarted();
          this.stdLogCallbackService.stdout(`Download started. url: ${item.getURL()}`);
        },
        onProgress: (progress) => {
          this.unitCallback.onDownloadInProgress(progress);
        },
      }).catch((err) => {
        this.stdLogCallbackService.stderr(`Failed to download ${file.url}: ${err}`);
        throw err;
      });
      const savedPath = downloadItem.getSavePath();
      this.stdLogCallbackService.stdout(`Download completed. path: ${savedPath}`);

      const destPath = file.path();
      const isZip = savedPath.endsWith('.zip');
      if (isZip) {
        this.stdLogCallbackService.stdout(`${savedPath} unzipping`);
        await compressing.zip.uncompress(savedPath, path.dirname(destPath));
        removeMacosxFiles(destPath);
        if (file.unzipDirName) {
          await renameUnzipedDir(file.unzipDirName, destPath, this.stdLogCallbackService);
        }

        fs.unlinkSync(savedPath);
      } else {
        await fs.promises.mkdir(path.dirname(destPath), { recursive: true });
        await fs.promises.copyFile(savedPath, destPath);
        await fs.promises.unlink(savedPath);
        this.stdLogCallbackService.stdout(`Download move completed. path: ${destPath}`);
      }
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

async function renameUnzipedDir(fileUrl: string, destPath: string, stdLogCallbackService: StdLogCallbackService): Promise<void> {
  const uncompressedDirPath = path.resolve(path.dirname(destPath), path.basename(fileUrl));
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
  await removeItemRecursive(uncompressedDirPath);
}

async function makeDirectories(): Promise<void> {
  for (const file of files) {
    const destPath = file.path();
    if (fs.existsSync(destPath)) {
      continue;
    }
    await fsPromise.mkdir(path.dirname(destPath), { recursive: true });
  }
}
