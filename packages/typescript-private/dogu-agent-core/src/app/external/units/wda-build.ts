import { PrefixLogger, Printable, stringify } from '@dogu-tech/common';
import { HostPaths, killChildProcess } from '@dogu-tech/node';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import { ExternalKey } from '../../../shares/external';
import { removeWdaDeviceAgent } from '../../settings/webdriver-agent-project';
import { IExternalUnit } from '../unit';
import { validateXcode } from '../xcode';

export class WdaBuildExternalUnit extends IExternalUnit {
  private readonly logger: PrefixLogger;
  private child: ChildProcessWithoutNullStreams | null = null;

  constructor(logger: Printable) {
    super();
    this.logger = new PrefixLogger(logger, '[WebDriverAgentBuild]');
  }

  isPlatformSupported(): boolean {
    return process.platform === 'darwin';
  }

  isManualInstallNeeded(): boolean {
    return true;
  }

  getKey(): ExternalKey {
    return 'web-driver-agent-build';
  }

  getName(): string {
    return 'WebDriverAgent';
  }

  getEnvKeys(): string[] {
    return [];
  }

  async validateInternal(): Promise<void> {
    await validateXcode(this.logger);
    const wdaProductsPath = path.resolve(HostPaths.external.xcodeProject.wdaDerivedDataPath(), 'Build/Products');
    const webDriverAgentExePath = path.resolve(wdaProductsPath, 'Debug-iphoneos/WebDriverAgentRunner-Runner.app/WebDriverAgentRunner-Runner');
    if (!fs.existsSync(webDriverAgentExePath)) {
      throw Error(`WebDriverAgentRunner-Runner not found. path: ${webDriverAgentExePath}`);
    }
    const stat = await fsPromises.stat(webDriverAgentExePath);
    if (stat.size === 0) {
      throw Error(`WebDriverAgentRunner-Runner is empty. path: ${webDriverAgentExePath}`);
    }
    const xctestrunFile = (await fsPromises.readdir(wdaProductsPath)).find((file) => file.endsWith('.xctestrun'));
    if (!xctestrunFile) {
      throw Error(`xctestrun file not found. path: ${wdaProductsPath}`);
    }
    const xctestrunPath = path.resolve(wdaProductsPath, xctestrunFile);
    const xctestrunStat = await fsPromises.stat(xctestrunPath);
    if (xctestrunStat.size === 0) {
      throw Error(`xctestrun file is empty. path: ${xctestrunPath}`);
    }
  }

  async install(): Promise<void> {
    this.logger.info(`Start ${this.getName()} `);
    if (this.child) {
      this.logger.info(`${this.getName()} is already running. kill it.`);
      await killChildProcess(this.child);
      this.child = null;
    }
    const wdaDerivedDataPath = HostPaths.external.xcodeProject.wdaDerivedDataPath();
    const wdaProjectPath = path.resolve(HostPaths.external.xcodeProject.wdaProjectDirectoryPath(), 'WebDriverAgent.xcodeproj');
    await new Promise<void>((resolve, reject) => {
      this.child = spawn('xcodebuild', [
        'build-for-testing',
        '-project',
        wdaProjectPath,
        '-scheme',
        'WebDriverAgentRunner',
        '-destination',
        'generic/platform=iOS',
        '-derivedDataPath',
        wdaDerivedDataPath,
      ]);

      const onErrorForReject = (error: Error): void => {
        reject(error);
      };
      this.child.on('error', onErrorForReject);
      this.child.on('spawn', () => {
        this.child?.off('error', onErrorForReject);
        this.child?.on('error', (error) => {
          this.logger.error(stringify(error));
        });
        this.logger.info(`${this.getName()} spawned`);
        this.child?.on('close', (code, signal) => {
          this.logger.info(`${this.getName()} is closed. code: ${stringify(code)} signal: ${stringify(signal)}`);
          this.child = null;
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`${this.getName()} failed. code: ${stringify(code)} signal: ${stringify(signal)}`));
          }
        });
        this.child?.stdout.setEncoding('utf8');
        this.child?.stdout.on('data', (data) => {
          const message = stringify(data);
          if (!message) {
            return;
          }
          this.logger.info(message);
        });
        this.child?.stderr.setEncoding('utf8');
        this.child?.stderr.on('data', (data) => {
          const message = stringify(data);
          if (!message) {
            return;
          }
          this.logger.error(message);
        });
      });
    });
  }

  isAgreementNeeded(): boolean {
    return false;
  }

  writeAgreement(): void {
    this.logger.warn('do not need agreement');
  }

  cancelInstall(): void {
    this.logger.warn('cancel install not supported');
  }

  async uninstall(): Promise<void> {
    await removeWdaDeviceAgent(this.logger);
  }

  getTermUrl(): string | null {
    return null;
  }
}
