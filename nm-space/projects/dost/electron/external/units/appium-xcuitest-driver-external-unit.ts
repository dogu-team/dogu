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

export class AppiumXcUiTestDriverExternalUnit extends IExternalUnit {
  private readonly logger = new PrefixLogger(logger, '[Appium XCUITest Driver]');

  constructor(
    private readonly dotEnvConfigService: DotEnvConfigService,
    private readonly stdLogCallbackService: StdLogCallbackService,
    private readonly appConfigService: AppConfigService,
    private readonly unitCallback: ExternalUnitCallback,
  ) {
    super();
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
    const version = _.get(packageJson, 'devDependencies.appium-xcuitest-driver') as string | undefined;
    if (!version) {
      throw new Error('appium-xcuitest-driver not exist in package.json');
    }
  }

  async isAgreementNeeded(): Promise<boolean> {
    const value = await this.appConfigService.getOrDefault('DOGU_EXTERNAL_IS_AGREED_appium', false);
    return !value;
  }

  writeAgreement(value: boolean): Promise<void> {
    // write on appium unit
    return Promise.resolve();
  }

  async install(): Promise<void> {
    this.unitCallback.onInstallStarted();
    const appiumHome = this.dotEnvConfigService.get('APPIUM_HOME');
    if (!appiumHome) {
      throw new Error('APPIUM_HOME not exist in env file');
    }
    const appiumHomeStat = await fs.promises.stat(appiumHome).catch(() => null);
    if (!appiumHomeStat || !appiumHomeStat.isDirectory()) {
      await fs.promises.mkdir(appiumHome, { recursive: true });
    }
    await new Promise<void>((resolve, reject) => {
      const { pnpm } = ThirdPartyPathMap.common;
      const appiumPath = HostPaths.external.nodePackage.appiumPath();
      const cleanNodeEnv = newCleanNodeEnv();
      const env = _.merge(cleanNodeEnv, {
        APPIUM_HOME: appiumHome,
        PATH: `${ThirdPartyPathMap.common.nodeBin}${path.delimiter}${cleanNodeEnv.PATH}`,
      });
      logger.verbose('merged env', { env });
      const child = spawn(pnpm, ['appium', 'driver', 'install', 'xcuitest'], {
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
        this.stdLogCallbackService.stdout(`Installing appium-xcuitest-driver...`);
        child.on('close', (code, signal) => {
          this.stdLogCallbackService.stdout(`appium-xcuitest-driver install completed. code: ${code} signal: ${signal}`);
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`appium-xcuitest-driver install failed. code: ${code} signal: ${signal}`));
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
