/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Platform, platformTypeFromPlatform, Serial } from '@dogu-private/types';
import { callAsyncWithTimeout, errorify, NullLogger, Retry, stringify } from '@dogu-tech/common';
import { Android, AppiumContextInfo, ContextPageSource, Rect, ScreenSize, SystemBar } from '@dogu-tech/device-client-common';
import { HostPaths, Logger } from '@dogu-tech/node';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import fs from 'fs';
import _ from 'lodash';
import path from 'path';
import { setInterval } from 'timers/promises';
import { remote } from 'webdriverio';
import { Adb } from '../internal/externals/index';
import { getFreePort } from '../internal/util/net';
import { createAppiumLogger } from '../logger/logger.instance';
import { AppiumRemoteContext } from './appium.remote.context';
import { AppiumService } from './appium.service';

type Browser = Awaited<ReturnType<typeof remote>>;

const AppiumNewCommandTimeout = 24 * 60 * 60; // unit: seconds
const AppiumClientCallAsyncTimeout = 10 * 1000; // unit: milliseconds
export const AppiumHealthCheckInterval = 5 * 1000; // unit: milliseconds
export const AppiumHealthCheckMaxNotHealthyCount = 3;

export interface DefaultAppiumContextOptions {
  pnpmPath: string;
  appiumPath: string;
  androidHomePath: string;
  javaHomePath: string;
  serverEnv: NodeJS.ProcessEnv;
}

export interface AppiumContextOptions extends DefaultAppiumContextOptions {
  service: AppiumService;
  platform: Platform;
  serial: Serial;
  key: AppiumContextKey;
}

function transformId(context: unknown): string {
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

function callClientAsyncWithTimeout<T>(callClientAsync: Promise<T>): Promise<T> {
  return callAsyncWithTimeout(callClientAsync, { timeout: AppiumClientCallAsyncTimeout });
}

export type AppiumContextKey = 'bulitin' | 'remote' | 'null';

export interface AppiumContext {
  get key(): AppiumContextKey;
  open(): Promise<void>;
  close(): Promise<void>;
  isHealthy(): boolean;
  getInfo(): AppiumContextInfo;
  getAndroid(): Promise<Android | undefined>;
  getScreenSize(): Promise<ScreenSize>;
  switchContext(contextId: string): Promise<void>;
  getContext(): Promise<string>;
  getContexts(): Promise<string[]>;
  getPageSource(): Promise<string>;
  switchContextAndGetPageSource(contextId: string): Promise<string>;
  getContextPageSources(): Promise<ContextPageSource[]>;
}

class NullAppiumContext implements AppiumContext {
  get key(): AppiumContextKey {
    return 'null';
  }

  open(): Promise<void> {
    return Promise.resolve();
  }

  close(): Promise<void> {
    return Promise.resolve();
  }

  isHealthy(): boolean {
    return false;
  }

  getInfo(): AppiumContextInfo {
    return {
      serial: '',
      platform: Platform.PLATFORM_UNSPECIFIED,
      client: {
        remoteOptions: {},
        capabilities: {},
        sessionId: '',
      },
      server: {
        port: 0,
        workingPath: '',
        command: '',
        env: {},
      },
    };
  }

  getAndroid(): Promise<undefined> {
    return Promise.resolve(undefined);
  }

  getScreenSize(): Promise<ScreenSize> {
    return Promise.resolve({ width: 0, height: 0 });
  }

  switchContext(contextId: string): Promise<void> {
    return Promise.resolve();
  }

  getContext(): Promise<string> {
    return Promise.resolve('');
  }

  getContexts(): Promise<string[]> {
    return Promise.resolve([]);
  }

  getPageSource(): Promise<string> {
    return Promise.resolve('');
  }

  switchContextAndGetPageSource(contextId: string): Promise<string> {
    return Promise.resolve('');
  }

  getContextPageSources(): Promise<ContextPageSource[]> {
    return Promise.resolve([]);
  }
}

export class AppiumContextProxy implements AppiumContext {
  private readonly logger: Logger;
  private impl: AppiumContext;
  private next: AppiumContextImpl | null = null;
  private closed = false;

  constructor(private readonly options: AppiumContextOptions) {
    this.logger = createAppiumLogger(options.serial);
    switch (options.key) {
      case 'bulitin':
        this.impl = new AppiumContextImpl(options, this.logger);
        break;
      case 'remote':
        this.impl = new AppiumRemoteContext(options, this.logger);
        break;
      case 'null':
        this.impl = new NullAppiumContext();
        break;
    }
  }

  get key(): AppiumContextKey {
    return this.impl.key;
  }

  async open(): Promise<void> {
    await this.impl.open();
    this.doHealthCheckLoop();
  }

  private doHealthCheckLoop(): void {
    (async (): Promise<void> => {
      for await (const _ of setInterval(AppiumHealthCheckInterval)) {
        if (this.closed) {
          this.logger.verbose('Appium health check loop stopped');
          return;
        }

        if (this.impl.isHealthy()) {
          continue;
        }

        this.logger.verbose('Appium context is not healthy. Restarting');
        try {
          await this.impl.close();
        } catch (error) {
          this.logger.error('Appium context close failed', { error: errorify(error) });
        }

        if (this.next) {
          if (this.next.openingState === 'opening') {
            this.logger.verbose('Appium context is opening. Skipping');
            continue;
          } else if (this.next.openingState === 'openingSucceeded') {
            this.logger.verbose('Appium context is opening succeeded. swaping impl');
            this.impl = this.next as AppiumContext;
            this.next = null;
            continue;
          } else if (this.next.openingState === 'openingFailed') {
            this.logger.verbose('Appium context is opening failed. swaping next');
            this.next.close().catch((error) => {
              this.logger.error('Appium context close failed', { error: errorify(error) });
            });
          } else {
            throw new Error(`unknown openingState: ${stringify(this.next.openingState)}`);
          }
        }

        this.logger.verbose('Appium context is not found. Creating new context');
        this.impl = new NullAppiumContext();
        this.next = new AppiumContextImpl(this.options, this.logger);
        this.next.open().catch((error) => {
          this.logger.error('Appium context open failed', { error: errorify(error) });
        });
      }
    })().catch((error) => {
      this.logger.error('Appium health check loop failed', { error: errorify(error) });
    });
  }

  async close(): Promise<void> {
    if (this.closed) {
      return;
    }
    this.closed = true;
    return this.impl.close();
  }

  isHealthy(): boolean {
    return this.impl.isHealthy();
  }

  getInfo(): AppiumContextInfo {
    return this.impl.getInfo();
  }

  getAndroid(): Promise<Android | undefined> {
    return this.impl.getAndroid();
  }

  getScreenSize(): Promise<ScreenSize> {
    return this.impl.getScreenSize();
  }

  switchContext(contextId: string): Promise<void> {
    return this.impl.switchContext(contextId);
  }

  getContext(): Promise<string> {
    return this.impl.getContext();
  }

  getContexts(): Promise<string[]> {
    return this.impl.getContexts();
  }

  getPageSource(): Promise<string> {
    return this.impl.getPageSource();
  }

  switchContextAndGetPageSource(contextId: string): Promise<string> {
    return this.impl.switchContextAndGetPageSource(contextId);
  }

  getContextPageSources(): Promise<ContextPageSource[]> {
    return this.impl.getContextPageSources();
  }
}

export interface AppiumData {
  server: {
    port: number;
    command: string;
    env: Record<string, string | undefined>;
    workingPath: string;
    process: ChildProcessWithoutNullStreams;
  };
  client: {
    remoteOptions: Record<string, unknown>;
    driver: Browser;
  };
}

export class AppiumContextImpl implements AppiumContext {
  private _data: AppiumData | null = null;
  private get data(): AppiumData {
    if (!this._data) {
      throw new Error('Appium data is not found');
    }
    return this._data;
  }
  private _isHealthy = true;
  private closed = false;

  openingState: 'opening' | 'openingSucceeded' | 'openingFailed' = 'opening';

  getInfo(): AppiumContextInfo {
    const { serial, platform } = this.options;
    const { server, client } = this.data;
    const { port, command, workingPath, env } = server;
    const { remoteOptions, driver } = client;
    const { sessionId, capabilities } = driver;
    return {
      serial,
      platform,
      client: {
        remoteOptions,
        capabilities: capabilities as Record<string, unknown>,
        sessionId,
      },
      server: {
        port,
        command,
        env,
        workingPath,
      },
    };
  }

  constructor(private readonly options: AppiumContextOptions, private readonly logger: Logger) {}

  get key(): AppiumContextKey {
    return 'bulitin';
  }

  async open(): Promise<void> {
    this.openingState = 'opening';
    try {
      const serverData = await this.openServer();
      const clientData = await this.openClient(serverData.port);
      this._data = {
        server: serverData,
        client: clientData,
      };
      this._isHealthy = true;
      this.doHealthCheckLoop();
      this.openingState = 'openingSucceeded';
    } catch (error) {
      this.openingState = 'openingFailed';
      throw error;
    }
  }

  async close(): Promise<void> {
    if (this.closed) {
      return;
    }
    this.closed = true;
    if (!this._data) {
      return;
    }
    const data = this._data;
    this._data = null;
    await this.stopClient(data.client.driver);
    await this.stopServer(data.server.process);
  }

  isHealthy(): boolean {
    return this._isHealthy;
  }

  private doHealthCheckLoop(): void {
    (async (): Promise<void> => {
      let notHealthyCount = 0;
      for await (const _ of setInterval(AppiumHealthCheckInterval)) {
        if (this.closed) {
          this.logger.verbose('Appium impl health check loop stopped');
          return;
        }

        if (!this._data) {
          this.logger.verbose('Appium impl is not found. Skipping');
          continue;
        }

        const { client } = this._data;
        try {
          await client.driver.getWindowSize();
          this._isHealthy = true;
          notHealthyCount = 0;
        } catch (error) {
          this.logger.error('Appium impl is not healthy', { error: errorify(error) });
          notHealthyCount++;
          if (notHealthyCount >= AppiumHealthCheckMaxNotHealthyCount) {
            this._isHealthy = false;
          }
        }
      }
    })().catch((error) => {
      this.logger.error('Appium impl health check loop failed', { error: errorify(error) });
    });
  }

  private async openServer(): Promise<AppiumData['server']> {
    const { pnpmPath, appiumPath, serverEnv } = this.options;
    const port = await getFreePort();
    const args = ['appium', '--log-no-colors', '--port', `${port}`, '--session-override', '--log-level', 'debug'];
    const command = `${pnpmPath} ${args.join(' ')}`;
    this.logger.info('server starting', { command, cwd: appiumPath, env: serverEnv });
    const process = await new Promise<ChildProcessWithoutNullStreams>((resolve, reject) => {
      const child = spawn(pnpmPath, args, {
        cwd: appiumPath,
        env: serverEnv,
      });
      const onErrorForReject = (error: Error): void => {
        reject(error);
      };
      child.on('error', onErrorForReject);
      child.on('spawn', () => {
        this.logger.info('server spawned');
        child.off('error', onErrorForReject);
        child.on('error', (error) => {
          this.logger.error('server error', { error: errorify(error) });
        });
        child.on('close', (code, signal) => {
          this.logger.info('server closed', { code, signal });
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
          this.logger.warn(message);
        });
        resolve(child);
      });
    });
    this.logger.info('server started', { command, cwd: appiumPath });
    return {
      port,
      command,
      env: serverEnv,
      workingPath: appiumPath,
      process,
    };
  }

  private async openClient(serverPort: number): Promise<AppiumData['client']> {
    return this.restartClient(serverPort);
  }

  private async stopServer(process: ChildProcessWithoutNullStreams): Promise<void> {
    await new Promise<void>((resolve) => {
      if (process.exitCode !== null || process.signalCode !== null) {
        resolve();
        return;
      }
      process.once('close', () => {
        resolve();
      });
      process.kill();
    });
  }

  /**
   *
   * @see https://appium.io/docs/en/2.0/guides/caps/
   * @see https://appium.github.io/appium-xcuitest-driver/latest/capabilities/
   */
  private async createArgumentCapabilities(): Promise<Record<string, unknown>> {
    const { platform, serial } = this.options;
    switch (platform) {
      case Platform.PLATFORM_ANDROID: {
        const systemPort = await getFreePort();
        const chromedriverPort = await getFreePort();
        const mjepgServerPort = await getFreePort();
        return {
          platformName: 'android',
          'appium:automationName': 'UiAutomator2',
          'appium:deviceName': serial,
          'appium:udid': serial,
          'appium:mjpegServerPort': mjepgServerPort,
          'appium:newCommandTimeout': AppiumNewCommandTimeout,
          'appium:systemPort': systemPort,
          'appium:chromedriverPort': chromedriverPort,
        };
      }
      case Platform.PLATFORM_IOS: {
        const { tempPath } = HostPaths;
        const derivedDataPath = path.resolve(tempPath, 'derived-data', serial);
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
    const { platform, serial } = this.options;
    if (platform !== Platform.PLATFORM_ANDROID) {
      return undefined;
    }
    const viewport: Rect = {
      x: (_.get(this.data.client.driver.capabilities, 'viewportRect.left') as number) ?? 0,
      y: (_.get(this.data.client.driver.capabilities, 'viewportRect.top') as number) ?? 0,
      width: (_.get(this.data.client.driver.capabilities, 'viewportRect.width') as number) ?? 0,
      height: (_.get(this.data.client.driver.capabilities, 'viewportRect.height') as number) ?? 0,
    };

    const systemBars = await callClientAsyncWithTimeout(this.data.client.driver.getSystemBars());
    const statusBar: SystemBar = {
      visible: (_.get(systemBars, 'statusBar.visible') as boolean) ?? false,
      x: (_.get(systemBars, 'statusBar.x') as number) ?? 0,
      y: (_.get(systemBars, 'statusBar.y') as number) ?? 0,
      width: (_.get(systemBars, 'statusBar.width') as number) ?? 0,
      height: (_.get(systemBars, 'statusBar.height') as number) ?? 0,
    };
    const navigationBar: SystemBar = {
      visible: (_.get(systemBars, 'navigationBar.visible') as boolean) ?? false,
      x: (_.get(systemBars, 'navigationBar.x') as number) ?? 0,
      y: (_.get(systemBars, 'navigationBar.y') as number) ?? 0,
      width: (_.get(systemBars, 'navigationBar.width') as number) ?? 0,
      height: (_.get(systemBars, 'navigationBar.height') as number) ?? 0,
    };

    try {
      const systemBarVisibility = await Adb.getSystemBarVisibility(serial);
      statusBar.visible = systemBarVisibility.statusBar;
      navigationBar.visible = systemBarVisibility.navigationBar;
    } catch (error) {
      this.logger.error('Adb getSystemBarVisibility failed', { error: errorify(error) });
    }

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
        const deviceScreenSize = _.get(this.data.client.driver.capabilities, 'deviceScreenSize') as string | undefined;
        if (!deviceScreenSize) {
          throw new Error('deviceScreenSize is not found');
        }
        const [width, height] = deviceScreenSize.split('x').map((value) => Number(value));
        return { width, height };
      }
      default: {
        const { width, height } = await callClientAsyncWithTimeout(this.data.client.driver.getWindowSize());
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
  private async restartClient(serverPort: number): Promise<AppiumData['client']> {
    this.logger.info('Appium client starting');
    const argumentCapabilities = await this.createArgumentCapabilities();
    const remoteOptions: Parameters<typeof remote>[0] = {
      port: serverPort,
      logLevel: 'trace',
      capabilities: {
        alwaysMatch: {},
        firstMatch: [argumentCapabilities],
      },
    };
    const driver = await remote(remoteOptions);
    const filteredRemoteOptions = Object.keys(remoteOptions).reduce((acc, key) => {
      const value = _.get(remoteOptions, key) as unknown;
      if (_.isFunction(value)) {
        return acc;
      } else {
        _.set(acc, key, value);
        return acc;
      }
    }, {} as Record<string, unknown>);
    this.logger.info('Appium client started', { remoteOptions, sessionId: driver.sessionId, capabilities: driver.capabilities });
    return {
      remoteOptions: filteredRemoteOptions,
      driver,
    };
  }

  /**
   * @reference
   * https://w3c.github.io/webdriver/#delete-session
   * https://webdriver.io/docs/api/webdriver/#deletesession
   */
  private async stopClient(driver: Browser): Promise<void> {
    try {
      await driver.deleteSession();
    } catch (error) {
      this.logger.error('client delete session failed', { error: errorify(error) });
    }
  }

  /**
   * @reference
   * https://w3c.github.io/webdriver/#get-page-source
   * https://webdriver.io/docs/api/webdriver/#getpagesource
   */
  @Retry({ retryCount: 3, retryInterval: 3000, printable: NullLogger.instance })
  async getPageSource(): Promise<string> {
    return callClientAsyncWithTimeout(this.data.client.driver.getPageSource());
  }

  /**
   * @reference
   * https://github.com/SeleniumHQ/mobile-spec/blob/master/spec-draft.md#webviews-and-other-contexts
   */
  @Retry({ retryCount: 3, retryInterval: 3000, printable: NullLogger.instance })
  async getContexts(): Promise<string[]> {
    const contexts = (await callClientAsyncWithTimeout(this.data.client.driver.getContexts())) as unknown[];
    const contextIds = contexts.map(transformId);
    return contextIds;
  }

  /**
   * @reference
   * https://github.com/SeleniumHQ/mobile-spec/blob/master/spec-draft.md#webviews-and-other-contexts
   */
  @Retry({ retryCount: 3, retryInterval: 3000, printable: NullLogger.instance })
  async getContext(): Promise<string> {
    const context = await callClientAsyncWithTimeout(this.data.client.driver.getContext());
    const contextId = transformId(context);
    return contextId;
  }

  /**
   * @reference
   *  https://github.com/SeleniumHQ/mobile-spec/blob/master/spec-draft.md#webviews-and-other-contexts
   */
  @Retry({ retryCount: 3, retryInterval: 3000, printable: NullLogger.instance })
  async switchContext(contextId: string): Promise<void> {
    return callClientAsyncWithTimeout(this.data.client.driver.switchContext(contextId));
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
      try {
        await this.switchContext(currentContext);
      } catch (error) {
        this.logger.error('Appium context switch failed', { error: errorify(error) });
      }
    }
    return contextPageSources;
  }
}
