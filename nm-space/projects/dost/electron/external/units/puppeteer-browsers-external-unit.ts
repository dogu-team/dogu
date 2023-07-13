import { BrowserInstaller } from '@dogu-private/device-server';
import { PrefixLogger, stringify } from '@dogu-tech/common';
import { HostPaths, newCleanNodeEnv } from '@dogu-tech/node';
import { exec, spawn } from 'child_process';
import fs from 'fs';
import _ from 'lodash';
import path from 'path';
import util from 'util';
import { ExternalKey } from '../../../src/shares/external';
import { logger } from '../../log/logger.instance';
import { StdLogCallbackService } from '../../log/std-log-callback-service';
import { ThirdPartyPathMap } from '../../path-map';
import { ExternalUnitCallback, IExternalUnit } from '../external-unit';

const execAsync = util.promisify(exec);

const PuppeteerBrowsers = '@puppeteer/browsers';
const DefaultChromeVersion = 'latest';
const DefaultFirefoxVersion = 'latest';

function getEnv(): NodeJS.ProcessEnv {
  const env = newCleanNodeEnv();
  env.PATH = `${ThirdPartyPathMap.common.nodeBin}${path.delimiter}${env.PATH}`;
  return env;
}

export class PuppeteerBrowsersExternalUnit extends IExternalUnit {
  private readonly logger = new PrefixLogger(logger, `[${PuppeteerBrowsers}]`);
  private readonly browserInstaller = new BrowserInstaller();

  constructor(private readonly stdLogCallbackService: StdLogCallbackService, private readonly unitCallback: ExternalUnitCallback) {
    super();
  }

  isPlatformSupported(): boolean {
    return true;
  }

  isManualInstallNeeded(): boolean {
    return false;
  }

  getKey(): ExternalKey {
    return 'puppeteer-browsers';
  }

  getName(): string {
    return PuppeteerBrowsers;
  }

  getEnvKeys(): string[] {
    return [];
  }

  async validateInternal(): Promise<void> {
    const puppeteerBrowsersPath = HostPaths.external.nodePackage.puppeteerBrowsersPath();
    const puppeteerBrowsersPathStat = await fs.promises.stat(puppeteerBrowsersPath).catch(() => null);
    if (!puppeteerBrowsersPathStat) {
      throw new Error(`${PuppeteerBrowsers} not exist`);
    }

    if (!puppeteerBrowsersPathStat.isDirectory()) {
      throw new Error(`${PuppeteerBrowsers} is not directory`);
    }

    const packageJsonPath = path.resolve(puppeteerBrowsersPath, 'package.json');
    const content = await fs.promises.readFile(packageJsonPath, 'utf8');
    const packageJson = JSON.parse(content);
    if (!_.has(packageJson, `dependencies.${PuppeteerBrowsers}`)) {
      throw new Error(`${PuppeteerBrowsers} not installed`);
    }

    const npxPath = ThirdPartyPathMap.common.npx;
    const env = getEnv();
    const { stdout, stderr } = await execAsync(`${npxPath} ${PuppeteerBrowsers} --version`, {
      cwd: puppeteerBrowsersPath,
      env,
    });
    if (stdout.length > 0) {
      this.logger.info(stdout);
    }
    if (stderr.length > 0) {
      this.logger.warn(stderr);
    }
  }

  async install(): Promise<void> {
    this.unitCallback.onInstallStarted();
    const puppeteerBrowsersPath = HostPaths.external.nodePackage.puppeteerBrowsersPath();
    const puppeteerBrowsersPathStat = await fs.promises.stat(puppeteerBrowsersPath).catch(() => null);
    if (puppeteerBrowsersPathStat && puppeteerBrowsersPathStat.isDirectory()) {
      await fs.promises.rm(puppeteerBrowsersPath, { recursive: true, force: true });
    }
    await fs.promises.mkdir(puppeteerBrowsersPath, { recursive: true });
    const npmPath = ThirdPartyPathMap.common.npm;
    const env = getEnv();
    await this.initPackage(npmPath, puppeteerBrowsersPath, env);
    await this.installPackage(npmPath, puppeteerBrowsersPath, env);
    const npxPath = ThirdPartyPathMap.common.npx;
    const browsersPath = HostPaths.external.browser.browsersPath();
    await this.browserInstaller.lockBrowsersPath(async () => {
      await this.installChromeLatest(npxPath, puppeteerBrowsersPath, env, browsersPath);
      await this.installFirefoxLatest(npxPath, puppeteerBrowsersPath, env, browsersPath);
    });
    this.unitCallback.onInstallCompleted();
  }

  private async initPackage(npmPath: string, puppeteerBrowsersPath: string, env: NodeJS.ProcessEnv): Promise<void> {
    const { stdout, stderr } = await execAsync(`${npmPath} init -y`, {
      cwd: puppeteerBrowsersPath,
      env,
    });
    if (stdout.length > 0) {
      this.stdLogCallbackService.stdout(stdout);
    }
    if (stderr.length > 0) {
      this.stdLogCallbackService.stderr(stderr);
    }
  }

  private async installPackage(npmPath: string, puppeteerBrowsersPath: string, env: NodeJS.ProcessEnv): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      const child = spawn(npmPath, ['install', PuppeteerBrowsers], {
        cwd: puppeteerBrowsersPath,
        env,
        stdio: 'pipe',
      });
      const rejectOnError = (error: Error) => {
        reject(error);
      };
      child.on('error', rejectOnError);
      child.on('spawn', () => {
        this.logger.info(`${child.spawnargs.join(' ')} started`);
        child.off('error', rejectOnError);
        child.on('close', (code, signal) => {
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`child process exited with code ${code} and signal ${signal}`));
          }
        });
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

  private async installChromeLatest(npxPath: string, puppeteerBrowsersPath: string, env: NodeJS.ProcessEnv, browsersPath: string): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      const child = spawn(npxPath, [PuppeteerBrowsers, 'install', `chrome@${DefaultChromeVersion}`, '--path', browsersPath], {
        cwd: puppeteerBrowsersPath,
        env,
        stdio: 'pipe',
      });
      const rejectOnError = (error: Error) => {
        reject(error);
      };
      child.on('error', rejectOnError);
      child.on('close', (code, signal) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`child process exited with code ${code} and signal ${signal}`));
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

  private async installFirefoxLatest(npxPath: string, puppeteerBrowsersPath: string, env: NodeJS.ProcessEnv, browsersPath: string): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      const child = spawn(npxPath, [PuppeteerBrowsers, 'install', `firefox@${DefaultFirefoxVersion}`, '--path', browsersPath], {
        cwd: puppeteerBrowsersPath,
        env,
        stdio: 'pipe',
      });
      const rejectOnError = (error: Error) => {
        reject(error);
      };
      child.on('error', rejectOnError);
      child.on('close', (code, signal) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`child process exited with code ${code} and signal ${signal}`));
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

  cancelInstall(): void {
    this.logger.warn('cancelInstall not supported');
  }

  uninstall(): void {
    this.logger.warn('uninstall not supported');
  }

  isAgreementNeeded(): boolean {
    return false;
  }

  writeAgreement(): void {
    this.logger.warn('do not need agreement');
  }

  getTermUrl(): string | null {
    return null;
  }
}
