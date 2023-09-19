import { PrefixLogger, Printable, stringify } from '@dogu-tech/common';
import { HostPaths, newCleanNodeEnv } from '@dogu-tech/node';
import { ThirdPartyPathMap } from '@dogu-tech/types';
import { spawn } from 'child_process';
import fs from 'fs';
import _ from 'lodash';
import path from 'path';
import { ExternalKey } from '../../../shares/external';
import { AppConfigService } from '../../app-config/service';
import { DotenvConfigService } from '../../dotenv-config/service';
import { ExternalUnitCallback } from '../types';
import { IExternalUnit } from '../unit';

const AppiumVersion = '2.0.0';

export class AppiumExternalUnit extends IExternalUnit {
  private readonly logger: PrefixLogger;

  constructor(
    private readonly dotEnvConfigService: DotenvConfigService, //
    private readonly appConfigService: AppConfigService,
    private readonly unitCallback: ExternalUnitCallback,
    private readonly thirdPartyPathMap: ThirdPartyPathMap,
    logger: Printable,
  ) {
    super();
    this.logger = new PrefixLogger(logger, '[Appium]');
  }

  isPlatformSupported(): boolean {
    return true;
  }

  isManualInstallNeeded(): boolean {
    return false;
  }

  getKey(): ExternalKey {
    return 'appium';
  }

  getName(): string {
    return 'Appium';
  }

  getEnvKeys(): string[] {
    return [];
  }

  async validateInternal(): Promise<void> {
    const appiumPath = HostPaths.external.nodePackage.appiumPath();
    const stat = await fs.promises.stat(appiumPath).catch((error) => null);
    if (!stat || !stat.isDirectory()) {
      throw new Error(`appium not exist or not directory. path: ${appiumPath}`);
    }
    const packageJsonPath = path.resolve(appiumPath, 'package.json');
    const packageJsonStat = await fs.promises.stat(packageJsonPath).catch((error) => null);
    if (!packageJsonStat || !packageJsonStat.isFile()) {
      throw new Error(`package.json not exist or not file. path: ${packageJsonPath}`);
    }
    const content = await fs.promises.readFile(packageJsonPath, { encoding: 'utf8' });
    const packageJson = JSON.parse(content) as Record<string, unknown>;
    const version = _.get(packageJson, 'dependencies.appium') as string | undefined;
    if (!version) {
      throw new Error('appium not exist in package.json');
    }
  }

  isAgreementNeeded(): boolean {
    const value = this.appConfigService.getOrDefault('external_is_agreed_appium', false);
    return !value;
  }

  writeAgreement(value: boolean): void {
    return this.appConfigService.set('external_is_agreed_appium', value);
  }

  private async createAppiumPath(): Promise<void> {
    const appiumPath = HostPaths.external.nodePackage.appiumPath();
    const appiumPathStat = await fs.promises.stat(appiumPath).catch(() => null);
    if (!appiumPathStat || !appiumPathStat.isDirectory()) {
      await fs.promises.mkdir(appiumPath, { recursive: true });
    }
  }

  private createEnv(): NodeJS.ProcessEnv {
    const appiumHome = this.dotEnvConfigService.get('APPIUM_HOME');
    if (!appiumHome) {
      throw new Error('APPIUM_HOME not exist in env file');
    }
    const cleanNodeEnv = newCleanNodeEnv();
    const env = _.merge(cleanNodeEnv, {
      APPIUM_HOME: appiumHome,
      PATH: `${this.thirdPartyPathMap.common.nodeBin}${path.delimiter}${cleanNodeEnv.PATH || ''}`,
    });
    this.logger.verbose('merged env', { env });
    return env;
  }

  private async pnpmInit(env: NodeJS.ProcessEnv): Promise<void> {
    const { pnpm } = this.thirdPartyPathMap.common;
    const appiumPath = HostPaths.external.nodePackage.appiumPath();
    await new Promise<void>((resolve, reject) => {
      const child = spawn(pnpm, ['init'], {
        cwd: appiumPath,
        env,
      });
      const onErrorForReject = (error: Error): void => {
        reject(error);
      };
      child.on('error', onErrorForReject);
      child.on('spawn', () => {
        child.off('error', onErrorForReject);
        child.on('error', (error) => {
          this.logger.error(stringify(error));
        });
        this.logger.info(`appium pnpm project initializing...`);
        child.on('close', (code, signal) => {
          this.logger.info(`appium pnpm project initialized. code: ${stringify(code)} signal: ${stringify(signal)}`);
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`appium pnpm project initialize failed. code: ${stringify(code)} signal: ${stringify(signal)}`));
          }
        });
      });
      child.stdout.setEncoding('utf8');
      child.stdout.on('data', (data) => {
        const message = stringify(data);
        if (!message) {
          return;
        }
        this.logger.info(message);
      });
      child.stderr.setEncoding('utf8');
      child.stderr.on('data', (data) => {
        const message = stringify(data);
        if (!message) {
          return;
        }
        this.logger.error(message);
      });
    });
  }

  private async installAppium(env: NodeJS.ProcessEnv): Promise<void> {
    const { pnpm } = this.thirdPartyPathMap.common;
    const appiumPath = HostPaths.external.nodePackage.appiumPath();
    await new Promise<void>((resolve, reject) => {
      const child = spawn(pnpm, ['install', `appium@${AppiumVersion}`], {
        cwd: appiumPath,
        env,
      });
      const onErrorForReject = (error: Error): void => {
        reject(error);
      };
      child.on('error', onErrorForReject);
      child.on('spawn', () => {
        child.off('error', onErrorForReject);
        child.on('error', (error) => {
          this.logger.error(stringify(error));
        });
        this.logger.info('Installing appium...');
        child.on('close', (code, signal) => {
          this.logger.info(`appium install completed. code: ${stringify(code)} signal: ${stringify(signal)}`);
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`appium install failed. code: ${stringify(code)} signal: ${stringify(signal)}`));
          }
        });
      });
      child.stdout.setEncoding('utf8');
      child.stdout.on('data', (data) => {
        const message = stringify(data);
        if (!message) {
          return;
        }
        this.logger.info(message);
      });
      child.stderr.setEncoding('utf8');
      child.stderr.on('data', (data) => {
        const message = stringify(data);
        if (!message) {
          return;
        }
        this.logger.error(message);
      });
    });
  }

  async install(): Promise<void> {
    this.unitCallback.onInstallStarted();
    await this.createAppiumPath();
    const env = this.createEnv();
    await this.pnpmInit(env);
    await this.installAppium(env);
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
