import { delay, errorify, PrefixLogger, stringify } from '@dogu-tech/common';
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

const installRetryCount = 2;
const installRetryInterval = 3000;

export class AppiumUiAutomator2DriverExternalUnit extends IExternalUnit {
  private readonly logger = new PrefixLogger(logger, '[Appium UiAutomator2 Driver]');

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
    const packageJson = JSON.parse(content);
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
    const packageJson = JSON.parse(message);
    const upToDate = _.get(packageJson, `uiautomator2.upToDate`, false) as boolean;
    return upToDate;
  }

  private async checkInstalled(): Promise<boolean> {
    const messages: string[] = [];
    await this.execute(['appium', 'driver', 'list', '--json', '--installed'], (message) => {
      messages.push(message);
    });
    const message = messages.join('');
    const packageJson = JSON.parse(message);
    const installed = _.get(packageJson, `uiautomator2.installed`, false) as boolean;
    return installed;
  }

  private async update(): Promise<void> {
    await this.execute(['appium', 'driver', 'update', 'uiautomator2']);
  }

  async isAgreementNeeded(): Promise<boolean> {
    const value = await this.appConfigService.getOrDefault('external_is_agreed_appium', false);
    return !value;
  }

  writeAgreement(value: boolean): Promise<void> {
    // write on appium unit
    return Promise.resolve();
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
      const { pnpm } = ThirdPartyPathMap.common;
      const cleanNodeEnv = newCleanNodeEnv();
      const env = _.merge(cleanNodeEnv, {
        APPIUM_HOME: appiumHome,
        PATH: `${ThirdPartyPathMap.common.nodeBin}${path.delimiter}${cleanNodeEnv.PATH}`,
      });
      logger.verbose('merged env', { env });
      const appiumPath = HostPaths.external.nodePackage.appiumPath();
      const child = spawn(pnpm, args, {
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
        this.stdLogCallbackService.stdout(`appium-uiautomator2-driver ${command}...`);
        child.on('close', (code, signal) => {
          this.stdLogCallbackService.stdout(`appium-uiautomator2-driver ${command} completed. code: ${code} signal: ${signal}`);
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`appium-uiautomator2-driver ${command} failed. code: ${code} signal: ${signal}`));
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

  private async installDriver(): Promise<void> {
    for (let i = 1; i <= installRetryCount; i++) {
      try {
        await this.execute(['appium', 'driver', 'install', 'uiautomator2']);
        return;
      } catch (error) {
        let casted = errorify(error);
        if (i === installRetryCount) {
          throw casted;
        } else {
          this.logger.warn(`appium-uiautomator2-driver install failed. retrying... ${i}/${installRetryCount}`, { error: casted });
          await delay(installRetryInterval);
        }
      }
    }
  }

  async install(): Promise<void> {
    this.unitCallback.onInstallStarted();
    const installed = await this.checkInstalled();
    if (installed) {
      this.logger.info('already installed');
      await this.update();
    } else {
      this.logger.info('not installed');
      await this.installDriver();
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
