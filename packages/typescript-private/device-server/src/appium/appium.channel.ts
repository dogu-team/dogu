import { Platform, platformTypeFromPlatform, Serial } from '@dogu-private/types';
import { errorify, NullLogger, Retry } from '@dogu-tech/common';
import { Android, AppiumChannelInfo, AppiumChannelKey, ContextPageSource, Rect, ScreenSize, SystemBar } from '@dogu-tech/device-client-common';
import { HostPaths, Logger } from '@dogu-tech/node';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import fs from 'fs';
import _ from 'lodash';
import path from 'path';
import { getFreePort } from '../internal/util/net';
import { createAppiumLogger } from '../logger/logger.instance';
import { AppiumService } from './appium.service';

const AppiumNewCommandTimeout = 24 * 60 * 60;

export interface DefaultAppiumChannelOptions {
  pnpmPath: string;
  appiumPath: string;
  androidHomePath: string;
  javaHomePath: string;
  serverEnv: NodeJS.ProcessEnv;
}

export interface AppiumChannelOptions extends DefaultAppiumChannelOptions {
  service: AppiumService;
  platform: Platform;
  serial: Serial;
  key: AppiumChannelKey;
}

function transformId(context: any): string {
  if (typeof context === 'string') {
    return context;
  } else {
    const id = _.get(context, 'id') as string | undefined;
    if (!id) {
      throw new Error('Context id is not found');
    }
    return id;
  }
}

export class AppiumChannel {
  private readonly logger: Logger;
  private _serverProcess: ChildProcessWithoutNullStreams | null = null;
  private get serverProcess(): ChildProcessWithoutNullStreams {
    if (!this._serverProcess) {
      throw new Error('Server process is null');
    }
    return this._serverProcess;
  }

  private _serverPort: number | null = null;
  private get serverPort(): number {
    if (!this._serverPort) {
      throw new Error('Server port is null');
    }
    return this._serverPort;
  }

  private _serverCommand: string | null = null;
  private get serverCommand(): string {
    if (!this._serverCommand) {
      throw new Error('Server command is null');
    }
    return this._serverCommand;
  }

  private _browser: WebdriverIO.Browser | null = null;
  private get browser(): WebdriverIO.Browser {
    if (!this._browser) {
      throw new Error('Browser is null');
    }
    return this._browser;
  }

  private _requestedCapabilities: Record<string, unknown> | null = null;
  private get requestedCapabilities(): Record<string, unknown> {
    if (!this._requestedCapabilities) {
      throw new Error('Requested capabilities is null');
    }
    return this._requestedCapabilities;
  }

  private get capabilities(): Record<string, unknown> {
    return this.browser.capabilities as Record<string, unknown>;
  }

  get info(): AppiumChannelInfo {
    return {
      serial: this.options.serial,
      channelKey: this.options.key,
      requestedCapabilities: this.requestedCapabilities,
      capabilities: this.capabilities,
      sessionId: this.browser.sessionId,
      server: {
        port: this.serverPort,
        workingDirectory: this.options.appiumPath,
        command: this.serverCommand,
        env: this.options.serverEnv,
      },
    };
  }

  constructor(private readonly options: AppiumChannelOptions) {
    this.logger = createAppiumLogger(options.serial);
  }

  open(): Promise<void> {
    return this.restartServerAndClient();
  }

  close(): Promise<void> {
    return this.stopClientAndServer();
  }

  private async stopClientAndServer(): Promise<void> {
    await this.stopClient();
    await this.stopServer();
  }

  private async restartServerAndClient(): Promise<void> {
    await this.stopClientAndServer();
    this._serverPort = await getFreePort();
    this.logger.info('Appium server starting with', {
      serverPort: this.serverPort,
    });
    const { pnpmPath, appiumPath, serverEnv } = this.options;
    const appiumServerCommands = ['appium', '--log-no-colors', '--port', `${this.serverPort}`, '--session-override'];
    this._serverProcess = await new Promise<ChildProcessWithoutNullStreams>((resolve, reject) => {
      const child = spawn(pnpmPath, appiumServerCommands, {
        cwd: appiumPath,
        env: serverEnv,
      });
      const onErrorForReject = (error: Error): void => {
        reject(error);
      };
      child.on('error', onErrorForReject);
      child.on('spawn', () => {
        this.logger.info('Appium server spawned');
        child.off('error', onErrorForReject);
        child.on('error', (error) => {
          this.logger.error('Appium server error', { error: errorify(error) });
        });
        child.on('close', (code, signal) => {
          this.logger.info('Appium server closed', { code, signal });
          if (code === 0 || signal === 'SIGTERM' || signal === 'SIGINT') {
            return;
          }
          this.restartServerAndClient().catch((error) => {
            this.logger.error('Appium server restart failed', { error: errorify(error) });
          });
        });
        child.stdout.setEncoding('utf8');
        child.stdout.on('data', (data) => {
          this.logger.info(data);
          const stringified = String(data);
          this.onStdout(stringified);
        });
        child.stderr.setEncoding('utf8');
        child.stderr.on('data', (data) => {
          this.logger.error(data);
        });
        resolve(child);
      });
    });
    this._serverCommand = `${pnpmPath} ${appiumServerCommands.join(' ')}`;
    this.logger.info('Appium server started with', {
      serverPort: this.serverPort,
    });
    await this.restartClient();
  }

  private onStdout(stdout: string): void {
    if (stdout.includes('xcodebuild failed with code')) {
      this.logger.error(`****************************************

Error: Xcode signing certificate is not found. Please check the following:

1. You have Xcode installed
2. You have a valid provisioning profile
3. Your code signing settings are correct
4. 'xcodebuild -version' is correct

****************************************`);
    }
  }

  private async stopServer(): Promise<void> {
    await new Promise<void>((resolve) => {
      const nullifyAndResolve = (): void => {
        this._serverProcess = null;
        this._serverPort = null;
        this._serverCommand = null;
        resolve();
      };

      if (!this._serverProcess) {
        nullifyAndResolve();
        return;
      }
      if (this.serverProcess.exitCode !== null || this.serverProcess.signalCode !== null) {
        nullifyAndResolve();
        return;
      }
      this.serverProcess.once('close', (code, signal) => {
        this.logger.info('Appium server closed', { code, signal });
        nullifyAndResolve();
      });
      this.serverProcess.kill();
    });
  }

  /**
   *
   * @see https://appium.io/docs/en/2.0/guides/caps/
   * @see https://appium.github.io/appium-xcuitest-driver/latest/capabilities/
   */
  private async createRequestedCapabilities(): Promise<Record<string, unknown>> {
    const { platform, serial, key } = this.options;
    switch (platform) {
      case Platform.PLATFORM_ANDROID: {
        const mjepgServerPort = await getFreePort();
        return {
          platformName: 'android',
          'appium:automationName': 'UiAutomator2',
          'appium:deviceName': serial,
          'appium:udid': serial,
          'appium:mjpegServerPort': mjepgServerPort,
          'appium:newCommandTimeout': AppiumNewCommandTimeout,
        };
      }
      case Platform.PLATFORM_IOS: {
        const { tempPath } = HostPaths;
        const derivedDataPath = path.resolve(tempPath, 'derived-data', serial, key);
        await fs.promises.mkdir(derivedDataPath, { recursive: true });
        const wdaLocalPort = await getFreePort();
        const mjepgServerPort = await getFreePort();
        return {
          platformName: 'ios',
          'appium:automationName': 'XCUITest',
          'appium:deviceName': serial,
          'appium:udid': serial,
          'appium:wdaLocalPort': wdaLocalPort,
          'appium:derivedDataPath': derivedDataPath,
          'appium:mjpegServerPort': mjepgServerPort,
          'appium:newCommandTimeout': AppiumNewCommandTimeout,
          'appium:showXcodeLog': true,
        };
      }
      default:
        throw new Error(`platform ${platformTypeFromPlatform(platform)} is not supported`);
    }
  }

  async getAndroid(): Promise<Android | undefined> {
    const { platform } = this.options;
    if (platform !== Platform.PLATFORM_ANDROID) {
      return undefined;
    }
    const viewportRect = _.get(this.capabilities, 'viewportRect') as { left: number; top: number; width: number; height: number } | undefined;
    const viewport: Rect = {
      x: _.get(viewportRect, 'left') ?? -1,
      y: _.get(viewportRect, 'top') ?? -1,
      width: _.get(viewportRect, 'width') ?? -1,
      height: _.get(viewportRect, 'height') ?? -1,
    };
    const systemBar = (await this.browser.getSystemBars()) as unknown as {
      statusBar: SystemBar;
      navigationBar: SystemBar;
    };
    const statusBarRaw = _.get(systemBar, 'statusBar');
    const statusBar: SystemBar = {
      visible: _.get(statusBarRaw, 'visible') ?? false,
      x: _.get(statusBarRaw, 'x') ?? -1,
      y: _.get(statusBarRaw, 'y') ?? -1,
      width: _.get(statusBarRaw, 'width') ?? -1,
      height: _.get(statusBarRaw, 'height') ?? -1,
    };
    const navigationBarRaw = _.get(systemBar, 'navigationBar') as SystemBar | undefined;
    const navigationBar: SystemBar = {
      visible: _.get(navigationBarRaw, 'visible') ?? false,
      x: _.get(navigationBarRaw, 'x') ?? -1,
      y: _.get(navigationBarRaw, 'y') ?? -1,
      width: _.get(navigationBarRaw, 'width') ?? -1,
      height: _.get(navigationBarRaw, 'height') ?? -1,
    };
    return {
      viewport,
      statusBar,
      navigationBar,
    };
  }

  async getScreenSize(): Promise<ScreenSize> {
    const { platform } = this.options;
    switch (platform) {
      case Platform.PLATFORM_ANDROID: {
        const deviceScreenSize = _.get(this.capabilities, 'deviceScreenSize') as string | undefined;
        if (!deviceScreenSize) {
          throw new Error('deviceScreenSize is not found');
        }
        const [width, height] = deviceScreenSize.split('x').map((value) => Number(value));
        return { width, height };
      }
      default: {
        const { width, height } = await this.browser.getWindowSize();
        return { width, height };
      }
    }
  }

  /**
   * @reference
   * https://w3c.github.io/webdriver/#new-session
   * https://webdriver.io/docs/api/webdriver#newsession
   * https://webdriver.io/docs/api/modules#webdriverio
   */
  @Retry({ retryCount: 10, retryInterval: 3000, printable: NullLogger.instance })
  private async restartClient(): Promise<void> {
    await this.stopClient();
    this.logger.info('Appium client starting');
    const webdriverio = await import('webdriverio');
    const requestedCapabilities = await this.createRequestedCapabilities();
    const browser = await webdriverio.remote({
      port: this.serverPort,
      capabilities: {
        alwaysMatch: {},
        firstMatch: [requestedCapabilities],
      },
    });
    this._requestedCapabilities = requestedCapabilities;
    this._browser = browser;
    this.logger.info('Appium client started', { requestedCapabilities, sessionId: browser.sessionId, capabilities: this.capabilities });
  }

  /**
   * @reference
   * https://w3c.github.io/webdriver/#delete-session
   * https://webdriver.io/docs/api/webdriver/#deletesession
   */
  private async stopClient(): Promise<void> {
    if (!this._browser) {
      return;
    }
    try {
      await this.browser.deleteSession();
    } catch (error) {
      this.logger.error('Appium client delete session failed', { error: errorify(error) });
    } finally {
      this._browser = null;
      this._requestedCapabilities = null;
    }
  }

  /**
   * @reference
   * https://w3c.github.io/webdriver/#get-page-source
   * https://webdriver.io/docs/api/webdriver/#getpagesource
   */
  @Retry({ retryCount: 3, retryInterval: 3000, printable: NullLogger.instance })
  async getPageSource(): Promise<string> {
    return this.browser.getPageSource();
  }

  /**
   * @reference
   * https://github.com/SeleniumHQ/mobile-spec/blob/master/spec-draft.md#webviews-and-other-contexts
   */
  @Retry({ retryCount: 3, retryInterval: 3000, printable: NullLogger.instance })
  async getContexts(): Promise<string[]> {
    const contexts = await this.browser.getContexts();
    const contextIds = contexts.map(transformId);
    return contextIds;
  }

  /**
   * @reference
   * https://github.com/SeleniumHQ/mobile-spec/blob/master/spec-draft.md#webviews-and-other-contexts
   */
  @Retry({ retryCount: 3, retryInterval: 3000, printable: NullLogger.instance })
  async getContext(): Promise<string> {
    const context = await this.browser.getContext();
    const contextId = transformId(context);
    return contextId;
  }

  /**
   * @reference
   *  https://github.com/SeleniumHQ/mobile-spec/blob/master/spec-draft.md#webviews-and-other-contexts
   */
  @Retry({ retryCount: 3, retryInterval: 3000, printable: NullLogger.instance })
  async switchContext(contextId: string): Promise<void> {
    return this.browser.switchContext(contextId);
  }

  async switchContextAndGetPageSource(contextId: string): Promise<string> {
    await this.switchContext(contextId);
    return this.getPageSource();
  }

  async getContextPageSources(): Promise<ContextPageSource[]> {
    const currentContext = await this.getContext().catch(() => '');
    const contexts = await this.getContexts();
    const contextPageSources: ContextPageSource[] = [];
    for (const context of contexts) {
      const pageSource = await this.switchContextAndGetPageSource(context);
      const screenSize = await this.getScreenSize();
      const android = await this.getAndroid();
      contextPageSources.push({
        context,
        pageSource,
        screenSize,
        android,
      });
    }
    if (currentContext) {
      await this.switchContext(currentContext).catch((error) => {
        this.logger.error('Appium context switch failed', { error: errorify(error) });
      });
    }
    return contextPageSources;
  }
}
