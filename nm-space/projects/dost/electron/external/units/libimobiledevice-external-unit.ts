import { PrefixLogger, stringify } from '@dogu-tech/common';
import { ChildProcess, getFileSizeRecursive, HostPaths, removeItemRecursive, renameRetry } from '@dogu-tech/node';
import compressing from 'compressing';
import { download } from 'electron-dl';
import fs from 'fs';
import fsPromise from 'fs/promises';
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
  fileMode?: number;
  archCheckPath: () => string;
  archName: 'arm64' | 'x86_64';
  unzipDirName?: string;
}

const files: File[] = [
  {
    condition: () => process.platform === 'darwin' && process.arch === 'arm64',
    url: 'https://github.com/dogu-team/third-party-binaries/releases/download/libimobiledevice-1.0.6/idevicediagnostics-arm64',
    path: () => HostPaths.external.libimobiledevice.idevicediagnostics(),
    archCheckPath: () => HostPaths.external.libimobiledevice.idevicediagnostics(),
    fileMode: 0o777,
    archName: 'arm64',
  },
  {
    condition: () => process.platform === 'darwin' && process.arch === 'x64',
    url: 'https://github.com/dogu-team/third-party-binaries/releases/download/libimobiledevice-1.0.6/idevicediagnostics-x64',
    path: () => HostPaths.external.libimobiledevice.idevicediagnostics(),
    archCheckPath: () => HostPaths.external.libimobiledevice.idevicediagnostics(),
    fileMode: 0o777,
    archName: 'x86_64',
  },
  {
    condition: () => process.platform === 'darwin' && process.arch === 'arm64',
    url: 'https://github.com/dogu-team/third-party-binaries/releases/download/libimobiledevice-1.0.6/idevicesyslog-arm64',
    path: () => HostPaths.external.libimobiledevice.idevicesyslog(),
    archCheckPath: () => HostPaths.external.libimobiledevice.idevicesyslog(),
    fileMode: 0o777,
    archName: 'arm64',
  },
  {
    condition: () => process.platform === 'darwin' && process.arch === 'x64',
    url: 'https://github.com/dogu-team/third-party-binaries/releases/download/libimobiledevice-1.0.6/idevicesyslog-x64',
    path: () => HostPaths.external.libimobiledevice.idevicesyslog(),
    archCheckPath: () => HostPaths.external.libimobiledevice.idevicesyslog(),
    fileMode: 0o777,
    archName: 'x86_64',
  },
  {
    condition: () => process.platform === 'darwin' && process.arch === 'arm64',
    url: 'https://github.com/dogu-team/third-party-binaries/releases/download/libimobiledevice-1.0.6/libimobiledevice-dylib-arm64.zip',
    path: () => HostPaths.external.libimobiledevice.libimobiledeviceLibPath(),
    archCheckPath: () => path.resolve(HostPaths.external.libimobiledevice.libimobiledeviceLibPath(), 'libimobiledevice-1.0.6.dylib'),
    archName: 'arm64',
    unzipDirName: 'libimobiledevice',
  },
  {
    condition: () => process.platform === 'darwin' && process.arch === 'x64',
    url: 'https://github.com/dogu-team/third-party-binaries/releases/download/libimobiledevice-1.0.6/libimobiledevice-dylib-x64.zip',
    path: () => HostPaths.external.libimobiledevice.libimobiledeviceLibPath(),
    archCheckPath: () => path.resolve(HostPaths.external.libimobiledevice.libimobiledeviceLibPath(), 'libimobiledevice-1.0.6.dylib'),
    archName: 'x86_64',
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
      if (file.condition && !file.condition()) {
        continue;
      }
      const path = file.path();
      if (!fs.existsSync(path)) {
        throw new Error(`${path} not found`);
      }
      const archCheckPath = file.archCheckPath();
      const { stdout, stderr } = await ChildProcess.execIgnoreError(`lipo -info ${archCheckPath}`, {}, this.logger);
      if (!stdout.includes(`architecture: ${file.archName}`)) {
        throw new Error(`${archCheckPath} should be ${file.archName} file`);
      }
      await ChildProcess.execIgnoreError(`xattr -dr com.apple.quarantine ${archCheckPath}`, {}, this.logger);
      if (file.fileMode) {
        await fs.promises.chmod(path, 0o777);
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
    const destDirPath = path.resolve(HostPaths.external.externalsPath(), 'libimobiledevice');
    if (fs.existsSync(destDirPath)) {
      await removeItemRecursive(path.resolve(HostPaths.external.externalsPath(), 'libimobiledevice'));
    }
    await makeDirectories();

    const window = this.windowService.window;
    if (!window) {
      throw new Error('window not exist');
    }

    for (const file of files) {
      if (file.condition && !file.condition()) {
        continue;
      }
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
        fs.unlinkSync(savedPath);
        removeMacosxFiles(destPath);
        if (file.unzipDirName) {
          await renameUnzipedDir(file.unzipDirName, destPath, this.stdLogCallbackService);
        }
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

function removeMacosxFiles(destPath: string): void {
  const macosxPath = path.resolve(path.dirname(destPath), '__MACOSX');
  shelljs.rm('-rf', macosxPath);
}

async function renameUnzipedDir(dirname: string, destPath: string, stdLogCallbackService: StdLogCallbackService): Promise<void> {
  const uncompressedDirPath = path.resolve(path.dirname(destPath), dirname);
  if (fs.existsSync(uncompressedDirPath) && !fs.existsSync(destPath)) {
    for (let i = 0; i < 10; i++) {
      try {
        await renameRetry(uncompressedDirPath, destPath, stdLogCallbackService.createPrintable());
        break;
      } catch (e) {
        stdLogCallbackService.stderr(`rename failed ${i} times. ${stringify(e)}`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        continue;
      }
    }
  }
  if (fs.existsSync(uncompressedDirPath)) {
    await removeItemRecursive(uncompressedDirPath);
  }
}

async function makeDirectories(): Promise<void> {
  for (const file of files) {
    if (file.condition && !file.condition()) {
      continue;
    }
    const destPath = file.path();
    if (fs.existsSync(destPath)) {
      continue;
    }
    await fsPromise.mkdir(path.dirname(destPath), { recursive: true });
  }
}
