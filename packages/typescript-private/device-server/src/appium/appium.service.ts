import { Platform, Serial } from '@dogu-private/types';
import { Injectable, OnModuleInit } from '@nestjs/common';
import path from 'path';
import { env } from '../env';
import { DoguLogger } from '../logger/logger';
import { pathMap } from '../path-map';
import { AppiumChannel, DefaultAppiumChannelOptions } from './appium.channel';
import util from 'util';
import { exec } from 'child_process';
import { errorify, PrefixLogger } from '@dogu-tech/common';
import { HostPaths, newCleanNodeEnv } from '@dogu-tech/node';
import { AppiumChannelKey } from '@dogu-tech/device-client-common';

const execAsync = util.promisify(exec);

/**
 * @reference
 * appium: https://appium.io/docs/en/2.0
 *
 * android driver: https://github.com/appium/appium-uiautomator2-driver
 */
@Injectable()
export class AppiumService implements OnModuleInit {
  private _defaultAppiumChannelOptions: DefaultAppiumChannelOptions | null = null;
  get defaultAppiumChannelOptions(): Readonly<DefaultAppiumChannelOptions> {
    if (!this._defaultAppiumChannelOptions) {
      throw new Error('Appium channel options is not initialized');
    }
    return this._defaultAppiumChannelOptions;
  }

  private logger: PrefixLogger;

  constructor(logger: DoguLogger) {
    this.logger = new PrefixLogger(logger, '[AppiumService]');
  }

  async onModuleInit(): Promise<void> {
    this.createDefaultAppiumChannelOptions();
    await this.validateExternalAppium();
  }

  /**
   * @note This method does not guarantee key duplication.
   */
  async createAppiumChannel(platform: Platform, serial: Serial, key: AppiumChannelKey): Promise<AppiumChannel> {
    const channel = new AppiumChannel({
      ...this.defaultAppiumChannelOptions,
      service: this,
      platform,
      serial,
      key,
    });
    await channel.open();
    return channel;
  }

  private createDefaultAppiumChannelOptions(): void {
    const pnpmPath = pathMap().common.pnpm;
    const appiumPath = HostPaths.external.nodePackage.appiumPath();
    const androidHomePath = path.resolve(env.ANDROID_HOME);
    const javaHomePath = path.resolve(env.JAVA_HOME);
    const serverEnv = newCleanNodeEnv();
    this._defaultAppiumChannelOptions = {
      pnpmPath,
      appiumPath,
      androidHomePath,
      javaHomePath,
      serverEnv,
    };
    this.logger.verbose('Default appium channel options created', {
      defaultAppiumChannelOptions: this._defaultAppiumChannelOptions,
    });
  }

  private async validateExternalAppium(): Promise<void> {
    const { pnpmPath, appiumPath, serverEnv } = this.defaultAppiumChannelOptions;
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
