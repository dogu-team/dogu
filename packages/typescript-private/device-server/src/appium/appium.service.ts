import { Platform, Serial } from '@dogu-private/types';
import { errorify, PrefixLogger } from '@dogu-tech/common';
import { HostPaths, newCleanNodeEnv } from '@dogu-tech/node';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { exec } from 'child_process';
import _ from 'lodash';
import path from 'path';
import util from 'util';
import { env } from '../env';
import { DoguLogger } from '../logger/logger';
import { pathMap } from '../path-map';
import { AppiumContext, AppiumContextProxy, DefaultAppiumContextOptions } from './appium.context';

const execAsync = util.promisify(exec);

/**
 * @reference
 * appium: https://appium.io/docs/en/2.0
 *
 * android driver: https://github.com/appium/appium-uiautomator2-driver
 */
@Injectable()
export class AppiumService implements OnModuleInit {
  private _defaultAppiumContextOptions: DefaultAppiumContextOptions | null = null;
  get defaultAppiumContextOptions(): Readonly<DefaultAppiumContextOptions> {
    if (!this._defaultAppiumContextOptions) {
      throw new Error('Appium channel options is not initialized');
    }
    return this._defaultAppiumContextOptions;
  }

  private logger: PrefixLogger;

  constructor(logger: DoguLogger) {
    this.logger = new PrefixLogger(logger, '[AppiumService]');
  }

  async onModuleInit(): Promise<void> {
    this.createDefaultAppiumContextOptions();
    await this.validateExternalAppium();
  }

  createAppiumContext(platform: Platform, serial: Serial): AppiumContext {
    const context = new AppiumContextProxy({
      ...this.defaultAppiumContextOptions,
      service: this,
      platform,
      serial,
    });
    return context;
  }

  private createDefaultAppiumContextOptions(): void {
    const pnpmPath = pathMap().common.pnpm;
    const appiumPath = HostPaths.external.nodePackage.appiumPath();
    const androidHomePath = path.resolve(env.ANDROID_HOME);
    const javaHomePath = path.resolve(env.JAVA_HOME);
    const cleanEnv = newCleanNodeEnv();
    const serverEnv = _.merge(cleanEnv, {
      PATH: `${pathMap().common.nodeBin}${path.delimiter}${cleanEnv.PATH ?? ''}`,
    });
    this._defaultAppiumContextOptions = {
      pnpmPath,
      appiumPath,
      androidHomePath,
      javaHomePath,
      serverEnv,
    };
    this.logger.verbose('Default appium channel options created', {
      defaultAppiumContextOptions: this._defaultAppiumContextOptions,
    });
  }

  private async validateExternalAppium(): Promise<void> {
    const { pnpmPath, appiumPath, serverEnv } = this.defaultAppiumContextOptions;
    const command = `${pnpmPath} appium --version`;
    try {
      const { stdout, stderr } = await execAsync(command, {
        cwd: appiumPath,
        env: serverEnv,
      });
      if (stderr) {
        this.logger.warn('external appium is not valid', { stderr });
      }
      if (!stdout) {
        throw new Error(`external appium is not valid. command: ${command}, stdout: ${stdout}`);
      }
      this.logger.info('external appium is valid', { stdout });
    } catch (error) {
      throw new Error(`external appium is not valid. command: ${command}`, { cause: errorify(error) });
    }
  }
}
