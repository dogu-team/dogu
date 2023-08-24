import { PrefixLogger, stringify } from '@dogu-tech/common';
import { HostPaths, newCleanNodeEnv } from '@dogu-tech/node';
import { exec, spawn } from 'child_process';
import fs from 'fs';
import _ from 'lodash';
import path from 'path';
import { promisify } from 'util';
import { ExternalKey, SeleniumWebdriver } from '../../../src/shares/external';
import { AppConfigService } from '../../app-config/app-config-service';
import { logger } from '../../log/logger.instance';
import { StdLogCallbackService } from '../../log/std-log-callback-service';
import { ThirdPartyPathMap } from '../../path-map';
import { ExternalUnitCallback, IExternalUnit } from '../external-unit';

const execAsync = promisify(exec);

const name = 'Selenium Webdriver';
const version = '4.11.1';

export class SeleniumWebdriverExternalUnit extends IExternalUnit {
  private readonly logger = new PrefixLogger(logger, `[${name}]`);

  constructor(
    private readonly stdLogCallbackService: StdLogCallbackService,
    private readonly appConfigService: AppConfigService,
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
    return 'selenium-webdriver';
  }

  getName(): string {
    return name;
  }

  getEnvKeys(): string[] {
    return [];
  }

  async validateInternal(): Promise<void> {
    const rootPath = HostPaths.external.nodePackage.seleniumWebdriver.rootPath();
    const rootPathStat = await fs.promises.stat(rootPath).catch(() => null);
    if (!rootPathStat || !rootPathStat.isDirectory()) {
      throw new Error(`rootPath not exist or not directory. path: ${rootPath}`);
    }
    const packageJsonPath = path.resolve(rootPath, 'package.json');
    const packageJsonStat = await fs.promises.stat(packageJsonPath).catch(() => null);
    if (!packageJsonStat || !packageJsonStat.isFile()) {
      throw new Error(`package.json not exist or not file. path: ${packageJsonPath}`);
    }
    const content = await fs.promises.readFile(packageJsonPath, { encoding: 'utf8' });
    const packageJson = JSON.parse(content);
    const version = _.get(packageJson, `dependencies.${SeleniumWebdriver}`) as string | undefined;
    if (!version) {
      throw new Error('selenium-webdriver not exist in package.json');
    }

    const seleniumManagerPath = HostPaths.external.nodePackage.seleniumWebdriver.seleniumManagerPath();
    const seleniumManagerPathStat = await fs.promises.stat(seleniumManagerPath).catch(() => null);
    if (!seleniumManagerPathStat || !seleniumManagerPathStat.isFile()) {
      throw new Error(`selenium-manager not exist or not file. path: ${seleniumManagerPath}`);
    }

    await this.checkSeleniumManagerVersion();
  }

  private async checkSeleniumManagerVersion(): Promise<void> {
    const seleniumManagerPath = HostPaths.external.nodePackage.seleniumWebdriver.seleniumManagerPath();
    const { stdout } = await execAsync(`${seleniumManagerPath} --version`, { timeout: 60_000 });
    const version = stdout.trim();
    this.stdLogCallbackService.stdout(`selenium manager version: ${version}`);
  }

  async isAgreementNeeded(): Promise<boolean> {
    const value = await this.appConfigService.getOrDefault('external_is_agreed_selenium_webdriver', false);
    return !value;
  }

  writeAgreement(value: boolean): Promise<void> {
    return this.appConfigService.set('external_is_agreed_selenium_webdriver', value);
  }

  private async createSeleniumWebdriverRootPath(): Promise<void> {
    const rootPath = HostPaths.external.nodePackage.seleniumWebdriver.rootPath();
    if (await fs.promises.stat(rootPath).catch(() => null)) {
      await fs.promises.rm(rootPath, { recursive: true, force: true });
    }

    const rootPathStat = await fs.promises.stat(rootPath).catch(() => null);
    if (!rootPathStat || !rootPathStat.isDirectory()) {
      await fs.promises.mkdir(rootPath, { recursive: true });
    }
  }

  private createEnv(): NodeJS.ProcessEnv {
    const cleanNodeEnv = newCleanNodeEnv();
    const env = _.merge(cleanNodeEnv, {
      PATH: `${ThirdPartyPathMap.common.nodeBin}${path.delimiter}${cleanNodeEnv.PATH}`,
    });
    this.logger.verbose('merged env', { env });
    return env;
  }

  private async pnpmInit(env: NodeJS.ProcessEnv): Promise<void> {
    const { pnpm } = ThirdPartyPathMap.common;
    const seleniumWebdriverPath = HostPaths.external.nodePackage.seleniumWebdriver.rootPath();
    await new Promise<void>((resolve, reject) => {
      const child = spawn(pnpm, ['init'], {
        cwd: seleniumWebdriverPath,
        env,
      });
      const onErrorForReject = (error: Error) => {
        reject(error);
      };
      child.on('error', onErrorForReject);
      child.on('spawn', () => {
        child.off('error', onErrorForReject);
        child.on('error', (error) => {
          this.stdLogCallbackService.stderr(stringify(error));
        });
        this.stdLogCallbackService.stdout(`${SeleniumWebdriver} pnpm project initializing...`);
        child.on('close', (code, signal) => {
          this.stdLogCallbackService.stdout(`${SeleniumWebdriver} pnpm project initialized. code: ${code} signal: ${signal}`);
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`${SeleniumWebdriver} pnpm project initialize failed. code: ${code} signal: ${signal}`));
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

  private async installSeleniumWebdriver(env: NodeJS.ProcessEnv): Promise<void> {
    const { pnpm } = ThirdPartyPathMap.common;
    const seleniumWebdriverPath = HostPaths.external.nodePackage.seleniumWebdriver.rootPath();
    await new Promise<void>((resolve, reject) => {
      const child = spawn(pnpm, ['install', `${SeleniumWebdriver}@${version}`], {
        cwd: seleniumWebdriverPath,
        env,
      });
      const onErrorForReject = (error: Error) => {
        reject(error);
      };
      child.on('error', onErrorForReject);
      child.on('spawn', () => {
        child.off('error', onErrorForReject);
        child.on('error', (error) => {
          this.stdLogCallbackService.stderr(stringify(error));
        });
        this.stdLogCallbackService.stdout(`Installing ${SeleniumWebdriver}...`);
        child.on('close', (code, signal) => {
          this.stdLogCallbackService.stdout(`${SeleniumWebdriver} install completed. code: ${code} signal: ${signal}`);
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`${SeleniumWebdriver} install failed. code: ${code} signal: ${signal}`));
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

  async install(): Promise<void> {
    this.unitCallback.onInstallStarted();
    await this.createSeleniumWebdriverRootPath();
    const env = this.createEnv();
    await this.pnpmInit(env);
    await this.installSeleniumWebdriver(env);
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
