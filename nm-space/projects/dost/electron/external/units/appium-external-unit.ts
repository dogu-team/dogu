import { PrefixLogger, stringify } from '@dogu-tech/common';
import { HostPaths, newCleanNodeEnv } from '@dogu-tech/node';
import { spawn } from 'child_process';
import fs from 'fs';
import _ from 'lodash';
import path from 'path';
import { ExternalKey } from '../../../src/shares/external';
import { AppConfigService } from '../../app-config/app-config-service';
import { DotEnvConfigService } from '../../dot-env-config/dot-env-config-service';
import { logger } from '../../log/logger.instance';
import { StdLogCallbackService } from '../../log/std-log-callback-service';
import { ThirdPartyPathMap } from '../../path-map';
import { ExternalUnitCallback, IExternalUnit } from '../external-unit';

const AppiumVersion = '2.0.0';

export class AppiumExternalUnit extends IExternalUnit {
  private readonly logger = new PrefixLogger(logger, '[Appium]');

  constructor(
    private readonly dotEnvConfigService: DotEnvConfigService,
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
    const packageJson = JSON.parse(content);
    const version = _.get(packageJson, 'dependencies.appium') as string | undefined;
    if (!version) {
      throw new Error('appium not exist in package.json');
    }
  }

  async isAgreementNeeded(): Promise<boolean> {
    const value = (await this.appConfigService.getAgreement('appium')) ?? false;
    return !value;
  }

  writeAgreement(value: boolean): Promise<void> {
    return this.appConfigService.setAgreement('appium', value);
  }

  private async createAppiumPath(): Promise<void> {
    const appiumPath = HostPaths.external.nodePackage.appiumPath();
    const appiumPatheStat = await fs.promises.stat(appiumPath).catch(() => null);
    if (!appiumPatheStat || !appiumPatheStat.isDirectory()) {
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
      PATH: `${ThirdPartyPathMap.common.nodeBin}${path.delimiter}${cleanNodeEnv.PATH}`,
    });
    this.logger.verbose('merged env', { env });
    return env;
  }

  private async pnpmInit(env: NodeJS.ProcessEnv): Promise<void> {
    const { pnpm } = ThirdPartyPathMap.common;
    const appiumPath = HostPaths.external.nodePackage.appiumPath();
    await new Promise<void>((resolve, reject) => {
      const child = spawn(pnpm, ['init'], {
        cwd: appiumPath,
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
        this.stdLogCallbackService.stdout(`appium pnpm project initializing...`);
        child.on('close', (code, signal) => {
          this.stdLogCallbackService.stdout(`appium pnpm project initialized. code: ${code} signal: ${signal}`);
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`appium pnpm project initialize failed. code: ${code} signal: ${signal}`));
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

  private async installAppium(env: NodeJS.ProcessEnv): Promise<void> {
    const { pnpm } = ThirdPartyPathMap.common;
    const appiumPath = HostPaths.external.nodePackage.appiumPath();
    await new Promise<void>((resolve, reject) => {
      const child = spawn(pnpm, ['install', `appium@${AppiumVersion}`], {
        cwd: appiumPath,
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
        this.stdLogCallbackService.stdout('Installing appium...');
        child.on('close', (code, signal) => {
          this.stdLogCallbackService.stdout(`appium install completed. code: ${code} signal: ${signal}`);
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`appium install failed. code: ${code} signal: ${signal}`));
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
