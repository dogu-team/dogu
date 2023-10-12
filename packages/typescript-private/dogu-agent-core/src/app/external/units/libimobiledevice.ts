import { NullLogger, PrefixLogger, Printable, stringify } from '@dogu-tech/common';
import { ChildProcess, download, getFileSizeRecursive, HostPaths, renameRetry } from '@dogu-tech/node';
import compressing from 'compressing';
import fs from 'fs';
import fsPromise from 'fs/promises';
import path from 'path';
import shelljs from 'shelljs';
import { ExternalKey } from '../../../shares/external';
import { AppConfigService } from '../../app-config/service';
import { ExternalUnitCallback } from '../types';
import { IExternalUnit } from '../unit';

interface File {
  condition?: () => boolean;
  url: string;
  path: () => string;
  fileMode?: number;
  archCheckPath: () => string;
  archName: 'arm64' | 'x86_64';
  unzipDirName?: string;
}

const LibimobiledeviceArchivesVersion = '12-10-2023';

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
    url: 'https://github.com/dogu-team/third-party-binaries/releases/download/libimobiledevice-1.0.6/ideviceinstaller-arm64',
    path: () => HostPaths.external.libimobiledevice.ideviceinstaller(),
    archCheckPath: () => HostPaths.external.libimobiledevice.ideviceinstaller(),
    fileMode: 0o777,
    archName: 'arm64',
  },
  {
    condition: () => process.platform === 'darwin' && process.arch === 'x64',
    url: 'https://github.com/dogu-team/third-party-binaries/releases/download/libimobiledevice-1.0.6/ideviceinstaller-x64',
    path: () => HostPaths.external.libimobiledevice.ideviceinstaller(),
    archCheckPath: () => HostPaths.external.libimobiledevice.ideviceinstaller(),
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
  private readonly logger: PrefixLogger;

  constructor(
    private readonly appConfigService: AppConfigService, //
    private readonly unitCallback: ExternalUnitCallback,
    logger: Printable,
  ) {
    super();
    this.logger = new PrefixLogger(logger, '[libimobiledevice]');
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
    const version = await this.readVersion();
    if (version !== LibimobiledeviceArchivesVersion) {
      throw new Error(`invalid version: ${version}`);
    }
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

      await ChildProcess.execIgnoreError(`xattr -dr com.apple.quarantine ${archCheckPath}`, {}, NullLogger.instance);
      await ChildProcess.execIgnoreError(`xattr -d com.apple.quarantine ${archCheckPath}`, {}, NullLogger.instance);
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
    const value = this.appConfigService.getOrDefault('external_is_agreed_libimobiledevice', false);
    return !value;
  }

  writeAgreement(value: boolean): void {
    return this.appConfigService.set('external_is_agreed_libimobiledevice', value);
  }

  async install(): Promise<void> {
    this.unitCallback.onInstallStarted();
    const destDirPath = path.resolve(HostPaths.external.externalsPath(), 'libimobiledevice');
    if (fs.existsSync(destDirPath)) {
      await fs.promises.rm(path.resolve(HostPaths.external.externalsPath(), 'libimobiledevice'), { force: true, recursive: true });
    }
    await makeDirectories();

    for (const file of files) {
      if (file.condition && !file.condition()) {
        continue;
      }
      const downloadsPath = HostPaths.downloadsPath(HostPaths.doguHomePath);
      await fs.promises.mkdir(downloadsPath, { recursive: true });

      const fileName = file.url.split('/').pop();
      if (!fileName) {
        throw new Error(`Invalid download url: ${file.url}`);
      }

      const savedPath = path.resolve(downloadsPath, fileName);
      this.logger.info(`Download started. url: ${file.url}`);
      this.unitCallback.onDownloadStarted();
      await download({
        url: file.url,
        filePath: savedPath,
        logger: this.logger,
        onProgress: (progress) => {
          this.unitCallback.onDownloadInProgress(progress);
        },
      });
      this.unitCallback.onDownloadCompleted();
      this.logger.info(`Download completed. path: ${savedPath}`);

      const destPath = file.path();
      const isZip = savedPath.endsWith('.zip');
      if (isZip) {
        this.logger.info(`${savedPath} unzipping`);
        await compressing.zip.uncompress(savedPath, path.dirname(destPath));
        fs.unlinkSync(savedPath);
        removeMacosxFiles(destPath);
        if (file.unzipDirName) {
          await renameUnzipedDir(file.unzipDirName, destPath, this.logger);
        }
      } else {
        await fs.promises.mkdir(path.dirname(destPath), { recursive: true });
        await fs.promises.copyFile(savedPath, destPath);
        await fs.promises.unlink(savedPath);
        this.logger.info(`Download move completed. path: ${destPath}`);
      }
    }
    await this.writeVersion();

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

  private async readVersion(): Promise<string> {
    const versionPath = HostPaths.external.libimobiledevice.version();
    if (!fs.existsSync(versionPath)) {
      throw new Error(`version file not found: ${versionPath}`);
    }
    const version = await fs.promises.readFile(versionPath, 'utf-8');
    return version;
  }

  private async writeVersion(): Promise<void> {
    await fs.promises.writeFile(HostPaths.external.libimobiledevice.version(), LibimobiledeviceArchivesVersion, 'utf-8');
  }
}

function removeMacosxFiles(destPath: string): void {
  const macosxPath = path.resolve(path.dirname(destPath), '__MACOSX');
  shelljs.rm('-rf', macosxPath);
}

async function renameUnzipedDir(dirname: string, destPath: string, logger: Printable): Promise<void> {
  const uncompressedDirPath = path.resolve(path.dirname(destPath), dirname);
  if (fs.existsSync(uncompressedDirPath) && !fs.existsSync(destPath)) {
    for (let i = 0; i < 10; i++) {
      try {
        await renameRetry(uncompressedDirPath, destPath, logger);
        break;
      } catch (e) {
        logger.error(`rename failed ${i} times. ${stringify(e)}`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        continue;
      }
    }
  }
  if (fs.existsSync(uncompressedDirPath)) {
    await fs.promises.rm(uncompressedDirPath, { force: true, recursive: true });
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
