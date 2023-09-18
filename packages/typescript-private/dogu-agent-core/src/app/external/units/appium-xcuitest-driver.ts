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

export class AppiumXcUiTestDriverExternalUnit extends IExternalUnit {
  private readonly logger: PrefixLogger;

  constructor(
    private readonly dotenvConfigService: DotenvConfigService, //
    private readonly appConfigService: AppConfigService,
    private readonly unitCallback: ExternalUnitCallback,
    private readonly thirdPartyPathMap: ThirdPartyPathMap,
    logger: Printable,
  ) {
    super();
    this.logger = new PrefixLogger(logger, '[Appium XCUITest Driver]');
  }

  isPlatformSupported(): boolean {
    return process.platform === 'darwin';
  }

  isManualInstallNeeded(): boolean {
    return false;
  }

  getKey(): ExternalKey {
    return 'appium-xcuitest-driver';
  }

  getName(): string {
    return 'Appium XCUITest Driver';
  }

  getEnvKeys(): string[] {
    return ['APPIUM_HOME'];
  }

  async validateInternal(): Promise<void> {
    const appiumHome = this.dotenvConfigService.get('APPIUM_HOME');
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
    const version = _.get(packageJson, 'devDependencies.appium-xcuitest-driver') as string | undefined;
    if (!version) {
      throw new Error('appium-xcuitest-driver not exist in package.json');
    }
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

  async install(): Promise<void> {
    this.unitCallback.onInstallStarted();
    const appiumHome = this.dotenvConfigService.get('APPIUM_HOME');
    if (!appiumHome) {
      throw new Error('APPIUM_HOME not exist in env file');
    }
    const appiumHomeStat = await fs.promises.stat(appiumHome).catch(() => null);
    if (!appiumHomeStat || !appiumHomeStat.isDirectory()) {
      await fs.promises.mkdir(appiumHome, { recursive: true });
    }
    await new Promise<void>((resolve, reject) => {
      const { pnpm } = this.thirdPartyPathMap.common;
      const appiumPath = HostPaths.external.nodePackage.appiumPath();
      const cleanNodeEnv = newCleanNodeEnv();
      const env = _.merge(cleanNodeEnv, {
        APPIUM_HOME: appiumHome,
        PATH: `${this.thirdPartyPathMap.common.nodeBin}${path.delimiter}${cleanNodeEnv.PATH || ''}`,
      });
      this.logger.verbose('merged env', { env });
      const child = spawn(pnpm, ['appium', 'driver', 'install', 'xcuitest'], {
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
        this.logger.info(`Installing appium-xcuitest-driver...`);
        child.on('close', (code, signal) => {
          this.logger.info(`appium-xcuitest-driver install completed. code: ${stringify(code)} signal: ${stringify(signal)}`);
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`appium-xcuitest-driver install failed. code: ${stringify(code)} signal: ${stringify(signal)}`));
          }
        });
        child.stdout.setEncoding('utf8');
        child.stdout.on('data', (data) => {
          const message = stringify(data);
          if (!message) {
            return;
          }
          this.logger.info(message);
          this.logger.info(message);
        });
        child.stderr.setEncoding('utf8');
        child.stderr.on('data', (data) => {
          const message = stringify(data);
          if (!message) {
            return;
          }
          this.logger.error(message);
          this.logger.warn(message);
        });
      });
    });
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
