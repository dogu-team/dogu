import { errorify, PrefixLogger, stringify } from '@dogu-tech/common';
import { HostPaths, renameRetry } from '@dogu-tech/node';
import { spawn } from 'child_process';
import compressing from 'compressing';
import { download } from 'electron-dl';
import fs from 'fs';
import path from 'path';
import { ExternalKey } from '../../../src/shares/external';
import { AppConfigService } from '../../app-config/app-config-service';
import { DotEnvConfigService } from '../../dot-env-config/dot-env-config-service';
import { logger } from '../../log/logger.instance';
import { StdLogCallbackService } from '../../log/std-log-callback-service';
import { WindowService } from '../../window/window-service';
import { ExternalUnitCallback, IExternalUnit } from '../external-unit';

const Infos = {
  darwin: {
    url: {
      x64: 'https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.7%2B7/OpenJDK17U-jdk_x64_mac_hotspot_17.0.7_7.tar.gz',
      arm64: 'https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.7%2B7/OpenJDK17U-jdk_aarch64_mac_hotspot_17.0.7_7.tar.gz',
    },
    uncompress: compressing.tgz.uncompress,
    fileExtensionPattern: /\.tar(?: \(\d+\))?\.gz$/,
    relativeJavaHomePath: 'jdk-17.0.7+7/Contents/Home',
  },
  win32: {
    url: {
      x64: 'https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.7%2B7/OpenJDK17U-jdk_x64_windows_hotspot_17.0.7_7.zip',
    },
    uncompress: compressing.zip.uncompress,
    fileExtensionPattern: /\.zip$/,
    relativeJavaHomePath: 'jdk-17.0.7+7',
  },
};

export class JdkExternalUnit extends IExternalUnit {
  private readonly logger = new PrefixLogger(logger, '[JDK]');

  constructor(
    private readonly dotEnvConfigService: DotEnvConfigService,
    private readonly stdLogCallbackService: StdLogCallbackService,
    private readonly appConfigService: AppConfigService,
    private readonly windowService: WindowService,
    private readonly unitCallback: ExternalUnitCallback,
  ) {
    super();
  }

  isPlatformSupported(): boolean {
    return true;
  }

  isManualInstallNeeded(): boolean {
    return false;
  }

  getKey(): ExternalKey {
    return 'jdk';
  }

  getName(): string {
    return 'Java Development Kit';
  }

  getEnvKeys(): string[] {
    return ['JAVA_HOME'];
  }

  async validateInternal(): Promise<void> {
    const javaHomePath = this.dotEnvConfigService.get('JAVA_HOME');
    if (!javaHomePath) {
      throw new Error('JAVA_HOME not exist in env file');
    }
    const javaHomeStat = await fs.promises.stat(javaHomePath).catch(() => null);
    if (!javaHomeStat || !javaHomeStat.isDirectory()) {
      throw new Error(`JAVA_HOME not exist or not directory. path: ${javaHomePath}`);
    }
    await this.checkJavaVersion(javaHomePath);
  }

  private async checkJavaVersion(javaHomePath: string): Promise<void> {
    const javaPath = HostPaths.java.javaPath(javaHomePath);
    const javaStat = await fs.promises.stat(javaPath).catch(() => null);
    if (!javaStat || !javaStat.isFile()) {
      throw new Error(`java executable not exist or not file. path: ${javaPath}`);
    }
    await new Promise<void>((resolve, reject) => {
      const child = spawn(javaPath, ['-version']);
      child.on('spawn', () => {
        this.stdLogCallbackService.stdout(`Checking java version... path: ${javaPath}`);
      });
      child.on('error', (error) => {
        this.stdLogCallbackService.stderr(stringify(error));
      });
      child.on('close', (code, signal) => {
        this.stdLogCallbackService.stdout(`exit code: ${code}, signal: ${signal}`);
        if (code !== null) {
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`java executable exit with code ${code}`));
          }
        } else {
          reject(new Error(`java executable exit with signal ${signal}`));
        }
      });
      child.stdout.setEncoding('utf8');
      child.stdout.on('data', (data) => {
        const message = stringify(data);
        if (!message) {
          return;
        }
        this.stdLogCallbackService.stdout(message);
        this.logger.info(message);
      });
      child.stderr.setEncoding('utf8');
      child.stderr.on('data', (data) => {
        const message = stringify(data);
        if (!message) {
          return;
        }
        this.stdLogCallbackService.stderr(message);
        this.logger.warn(message);
      });
    });
  }

  private getDownloadUrl(): string {
    if (process.platform === 'darwin' && process.arch === 'x64') {
      return Infos.darwin.url.x64;
    } else if (process.platform === 'darwin' && process.arch === 'arm64') {
      return Infos.darwin.url.arm64;
    } else if (process.platform === 'win32' && process.arch === 'x64') {
      return Infos.win32.url.x64;
    } else {
      throw new Error(`platform not supported. platform: ${process.platform}, arch: ${process.arch}`);
    }
  }

  private getRelativeJavaHomePath(): string {
    if (process.platform === 'darwin') {
      return Infos.darwin.relativeJavaHomePath;
    } else if (process.platform === 'win32') {
      return Infos.win32.relativeJavaHomePath;
    } else {
      throw new Error(`platform not supported. platform: ${process.platform}`);
    }
  }

  async install(): Promise<void> {
    const window = this.windowService.window;
    if (!window) {
      throw new Error('window not exist');
    }
    if (this.canceler) {
      throw new Error('already installing');
    }
    const downloadUrl = this.getDownloadUrl();
    const downloadsPath = HostPaths.downloadsPath(HostPaths.doguHomePath);
    await fs.promises.mkdir(downloadsPath, { recursive: true });
    const item = await download(window, downloadUrl, {
      directory: downloadsPath,
      onStarted: (item) => {
        this.canceler = () => {
          item.cancel();
        };
        this.unitCallback.onDownloadStarted();
        this.stdLogCallbackService.stdout(`Download started. url: ${item.getURL()}`);
      },
      onProgress: (progress) => {
        this.unitCallback.onDownloadInProgress(progress);
      },
    });
    this.canceler = null;
    const savePath = item.getSavePath();
    this.stdLogCallbackService.stdout(`Download complete. path: ${savePath}`);
    this.unitCallback.onDownloadCompleted();
    this.unitCallback.onInstallStarted();
    this.stdLogCallbackService.stdout(`Uncompressing... path: ${savePath}`);
    const uncompressedPath = await this.uncompress(savePath);
    this.stdLogCallbackService.stdout(`Uncompress complete. path: ${uncompressedPath}`);
    const uncompressedHomePath = path.resolve(uncompressedPath, this.getRelativeJavaHomePath());
    const javaHomeStat = await fs.promises.stat(uncompressedHomePath).catch(() => null);
    if (!javaHomeStat || !javaHomeStat.isDirectory()) {
      throw new Error(`JAVA_HOME not exist or not directory. path: ${uncompressedHomePath}`);
    }
    const defaultJavaHomePath = HostPaths.external.defaultJavaHomePath();
    const defaultJavaHomeStat = await fs.promises.stat(defaultJavaHomePath).catch(() => null);
    if (defaultJavaHomeStat && defaultJavaHomeStat.isDirectory()) {
      this.stdLogCallbackService.stdout(`Deleting default JAVA_HOME... ${defaultJavaHomePath}`);
      await fs.promises.rm(defaultJavaHomePath, { recursive: true, force: true });
      this.stdLogCallbackService.stdout(`Delete complete. ${defaultJavaHomePath}`);
    }
    const defaultJavaHomeParentPath = path.dirname(defaultJavaHomePath);
    await fs.promises.mkdir(defaultJavaHomeParentPath, { recursive: true });
    this.stdLogCallbackService.stdout(`Moving... ${uncompressedHomePath} to ${defaultJavaHomePath}`);
    await renameRetry(uncompressedHomePath, defaultJavaHomePath, this.stdLogCallbackService.createPrintable());
    this.stdLogCallbackService.stdout(`Move complete. ${uncompressedPath} to ${defaultJavaHomePath}`);
    this.stdLogCallbackService.stdout('Writing JAVA_HOME to env file...');
    await this.dotEnvConfigService.write('JAVA_HOME', defaultJavaHomePath);
    this.stdLogCallbackService.stdout('Write complete');
    try {
      this.logger.info('deleting uncompressedPath and savePath...', {
        uncompressedPath,
        savePath,
      });
      await fs.promises.rmdir(uncompressedPath, { recursive: true });
      await fs.promises.unlink(savePath);
    } catch (error) {
      this.logger.warn('uncompressedPath or savePath delete failed.', {
        uncompressedPath,
        savePath,
        error: errorify(error),
      });
    }
    this.unitCallback.onInstallCompleted();
  }

  private getFileExtensionPattern(): RegExp {
    if (process.platform === 'darwin') {
      return Infos.darwin.fileExtensionPattern;
    } else if (process.platform === 'win32') {
      return Infos.win32.fileExtensionPattern;
    } else {
      throw new Error(`platform not supported. platform: ${process.platform}`);
    }
  }

  private getUncompressFunction(): (savePath: string, uncompressedPath: string) => Promise<void> {
    if (process.platform === 'darwin') {
      return compressing.tgz.uncompress;
    } else if (process.platform === 'win32') {
      return compressing.zip.uncompress;
    } else {
      throw new Error(`platform not supported. platform: ${process.platform}`);
    }
  }

  private async uncompress(savePath: string): Promise<string> {
    const uncompress = this.getUncompressFunction();
    const fileExtensionPattern = this.getFileExtensionPattern();
    const uncompressedPath = savePath.replace(fileExtensionPattern, '');
    await fs.promises.rm(uncompressedPath, { recursive: true, force: true });
    await uncompress(savePath, uncompressedPath);
    return uncompressedPath;
  }

  cancelInstall(): void {
    if (!this.canceler) {
      this.logger.warn('canceler not exist');
      return;
    }
    this.canceler();
    this.canceler = null;
  }

  uninstall(): void {
    this.logger.warn('uninstall not supported');
  }

  async isAgreementNeeded(): Promise<boolean> {
    const value = (await this.appConfigService.getAgreement('jdk')) ?? false;
    return !value;
  }

  writeAgreement(value: boolean): Promise<void> {
    return this.appConfigService.setAgreement('jdk', value);
  }

  getTermUrl(): string | null {
    return 'https://www.eclipse.org/legal/termsofuse.php';
  }
}
