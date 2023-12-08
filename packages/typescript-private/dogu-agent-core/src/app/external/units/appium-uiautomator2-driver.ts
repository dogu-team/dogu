import { delay, PrefixLogger, Printable, stringify } from '@dogu-tech/common';
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

const installRetryCount = 3;
const installRetryInterval = 5_000;

export class AppiumUiAutomator2DriverExternalUnit extends IExternalUnit {
  private readonly logger: PrefixLogger;

  constructor(
    private readonly dotEnvConfigService: DotenvConfigService,
    private readonly appConfigService: AppConfigService,
    private readonly unitCallback: ExternalUnitCallback,
    private readonly thirdPartyPathMap: ThirdPartyPathMap,
    logger: Printable,
  ) {
    super();
    this.logger = new PrefixLogger(logger, '[Appium UiAutomator2 Driver]');
  }

  isPlatformSupported(): boolean {
    return true;
  }

  isManualInstallNeeded(): boolean {
    return false;
  }

  getKey(): ExternalKey {
    return 'appium-uiautomator2-driver';
  }

  getName(): string {
    return 'Appium UiAutomator2 Driver';
  }

  getEnvKeys(): string[] {
    return ['APPIUM_HOME'];
  }

  async validateInternal(): Promise<void> {
    const appiumHome = this.dotEnvConfigService.get('APPIUM_HOME');
    if (!appiumHome) {
      throw new Error('APPIUM_HOME not exist in env file');
    }
    const stat = await fs.promises.stat(appiumHome).catch((error) => null);
    if (!stat || !stat.isDirectory()) {
      throw new Error(`APPIUM_HOME not exist or not directory. path: ${appiumHome}`);
    }
    const packageJsonPath = path.resolve(appiumHome, 'package.json');
    const packageJsonStat = await fs.promises.stat(packageJsonPath).catch((error) => null);
    if (!packageJsonStat || !packageJsonStat.isFile()) {
      throw new Error(`package.json not exist or not file. path: ${packageJsonPath}`);
    }
    const content = await fs.promises.readFile(packageJsonPath, { encoding: 'utf8' });
    const packageJson = JSON.parse(content) as Record<string, unknown>;
    const version = _.get(packageJson, 'devDependencies.appium-uiautomator2-driver') as string | undefined;
    if (!version) {
      throw new Error('appium-uiautomator2-driver not found in package.json');
    }

    const upToDate = await this.checkUpToDate();
    if (!upToDate) {
      throw new Error('appium-uiautomator2-driver is not up to date');
    }
  }

  private async checkUpToDate(): Promise<boolean> {
    const messages: string[] = [];
    await this.execute(['appium', 'driver', 'list', '--json', '--installed', '--updates'], (message) => {
      messages.push(message);
    });
    const message = messages.join('');
    const packageJson = JSON.parse(message) as Record<string, unknown>;
    const upToDate = _.get(packageJson, `uiautomator2.upToDate`, false) as boolean;
    return upToDate;
  }

  private async checkInstalled(): Promise<boolean> {
    const messages: string[] = [];
    await this.execute(['appium', 'driver', 'list', '--json', '--installed'], (message) => {
      messages.push(message);
    });
    const message = messages.join('');
    const packageJson = JSON.parse(message) as Record<string, unknown>;
    const installed = _.get(packageJson, `uiautomator2.installed`, false) as boolean;
    return installed;
  }

  private async update(): Promise<void> {
    await this.execute(['appium', 'driver', 'update', 'uiautomator2']);
  }

  isAgreementNeeded(): boolean {
    const value = this.appConfigService.getOrDefault('external_is_agreed_appium', false);
    return !value;
  }

  writeAgreement(value: boolean): void {
    /**
     * @note write on appium unit
     */
  }

  private async execute(args: string[], onStdout?: (message: string) => void): Promise<void> {
    const command = args.join(' ');
    const appiumHome = this.dotEnvConfigService.get('APPIUM_HOME');
    if (!appiumHome) {
      throw new Error('APPIUM_HOME not exist in env');
    }
    const appiumHomeStat = await fs.promises.stat(appiumHome).catch(() => null);
    if (!appiumHomeStat || !appiumHomeStat.isDirectory()) {
      await fs.promises.mkdir(appiumHome, { recursive: true });
    }
    await new Promise<void>((resolve, reject) => {
      const { pnpm } = this.thirdPartyPathMap.common;
      const cleanNodeEnv = newCleanNodeEnv();
      const env = _.merge(cleanNodeEnv, {
        APPIUM_HOME: appiumHome,
        APPIUM_SKIP_CHROMEDRIVER_INSTALL: 1,
        PATH: `${this.thirdPartyPathMap.common.nodeBin}${path.delimiter}${cleanNodeEnv.PATH || ''}`,
      });
      this.logger.verbose('merged env', { env });
      const appiumPath = HostPaths.external.nodePackage.appiumPath();
      const child = spawn(pnpm, args, {
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
        this.logger.info(`appium-uiautomator2-driver ${command}...`);
        child.on('close', (code, signal) => {
          this.logger.info(`appium-uiautomator2-driver ${command} completed. code: ${stringify(code)} signal: ${stringify(signal)}`);
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`appium-uiautomator2-driver ${command} failed. code: ${stringify(code)} signal: ${stringify(signal)}`));
          }
        });
      });
      child.stdout.setEncoding('utf8');
      child.stdout.on('data', (data) => {
        const message = stringify(data);
        if (!message) {
          return;
        }
        onStdout?.(message);
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

  private async installDriver(): Promise<void> {
    await this.execute(['appium', 'driver', 'install', 'uiautomator2']);
  }

  async install(): Promise<void> {
    this.unitCallback.onInstallStarted();
    for (let i = 0; i < installRetryCount; i++) {
      try {
        const installed = await this.checkInstalled();
        if (installed) {
          this.logger.info('already installed');
          await this.update();
        } else {
          this.logger.info('not installed');
          await this.installDriver();
        }
        break;
      } catch (error) {
        this.logger.error(error);
        await delay(installRetryInterval);
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
