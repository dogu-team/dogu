/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Platform, platformTypeFromPlatform, Serial } from '@dogu-private/types';
import { callAsyncWithTimeout, Class, delay, errorify, Instance, NullLogger, Printable, Retry, stringify } from '@dogu-tech/common';
import { Android, AppiumContextInfo, ContextPageSource, Rect, ScreenSize, SystemBar } from '@dogu-tech/device-client-common';
import { HostPaths, killChildProcess, killProcessOnPort, Logger, TaskQueueTask } from '@dogu-tech/node';
import AsyncLock from 'async-lock';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import fs from 'fs';
import _ from 'lodash';
import path from 'path';
import { remote } from 'webdriverio';
import { DOGU_ADB_SERVER_PORT } from '../internal/externals/cli/adb/adb';
import { Adb } from '../internal/externals/index';
import { Zombieable, ZombieProps } from '../internal/services/zombie/zombie-component';
import { ZombieServiceInstance } from '../internal/services/zombie/zombie-service';
import { getFreePort } from '../internal/util/net';
import { createAppiumLogger, logger } from '../logger/logger.instance';
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
  serverPort: number;
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

export type AppiumContextKey = 'builtin' | 'remote' | 'null';
export type AppiumOpeningState = 'opening' | 'openingSucceeded' | 'openingFailed';

export interface AppiumContext extends Zombieable {
  get key(): AppiumContextKey;
  get openingState(): AppiumOpeningState;
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
  public readonly props: ZombieProps = {};
  constructor(private readonly options: AppiumContextOptions, public readonly printable: Logger) {}
  get name(): string {
    return 'NullAppiumContext';
  }
  get platform(): Platform {
    return this.options.platform;
  }
  get serial(): string {
    return this.options.serial;
  }
  get key(): AppiumContextKey {
    return 'null';
  }
  get openingState(): AppiumOpeningState {
    return 'openingSucceeded';
  }

  revive(): Promise<void> {
    return Promise.resolve();
  }
  onDie(): void | Promise<void> {
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
  private notHealthyCount = 0;

  openingState: 'opening' | 'openingSucceeded' | 'openingFailed' = 'opening';
  constructor(private readonly options: AppiumContextOptions, public readonly printable: Logger) {}

  get name(): string {
    return 'AppiumContextImpl';
  }
  get platform(): Platform {
    return this.options.platform;
  }
  get serial(): string {
    return this.options.serial;
  }
  get props(): ZombieProps {
    return { srvPort: this._data?.server.port, cliSessId: this._data?.client.driver.sessionId };
  }

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

  get key(): AppiumContextKey {
    return 'builtin';
  }

  async revive(): Promise<void> {
    this.openingState = 'opening';
    try {
      const serverData = await this.openServer();
      const clientData = await this.openClient(serverData.port);
      this._data = {
        server: serverData,
        client: clientData,
      };
      this.openingState = 'openingSucceeded';
    } catch (error) {
      this.openingState = 'openingFailed';
      throw error;
    }
  }

  async onDie(): Promise<void> {
    if (!this._data) {
      return;
    }
    const data = this._data;
    this._data = null;
    await this.stopClient(data.client.driver);
    await this.stopServer(data.server.process);
  }

  async update(): Promise<void> {
    if (!this._data) {
      this.printable.verbose('Appium impl is not found. Skipping');
      return;
    }

    const { client } = this._data;
    try {
      await client.driver.getWindowSize();
      this.notHealthyCount = 0;
    } catch (error) {
      this.printable.error('Appium impl is not healthy', { error: errorify(error) });
      this.notHealthyCount++;
      if (this.notHealthyCount >= AppiumHealthCheckMaxNotHealthyCount) {
        ZombieServiceInstance.notifyDie(this, 'windowSize is not available');
      }
    }
    await delay(AppiumHealthCheckInterval);
  }

  private async openServer(): Promise<AppiumData['server']> {
    const { pnpmPath, appiumPath, serverEnv } = this.options;
    await killProcessOnPort(this.options.serverPort, this.printable).catch((e) => {
      this.printable.error('killProcessOnPort failed', { error: errorify(e) });
    });
    const port = this.options.serverPort;
    const args = ['appium', '--log-no-colors', '--port', `${port}`, '--session-override', '--log-level', 'debug'];
    const command = `${pnpmPath} ${args.join(' ')}`;
    this.printable.info('server starting', { command, cwd: appiumPath, env: serverEnv });
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
        this.printable.info('server spawned');
        child.off('error', onErrorForReject);
        child.on('error', (error) => {
          this.printable.error('server error', { error: errorify(error) });
        });
        child.on('close', (code, signal) => {
          this.printable.info('server closed', { code, signal });
        });
        child.stdout.setEncoding('utf8');
        child.stdout.on('data', (data) => {
          const message = stringify(data);
          if (!message) {
            return;
          }
          this.printable.info(message);
        });
        child.stderr.setEncoding('utf8');
        child.stderr.on('data', (data) => {
          const message = stringify(data);
          if (!message) {
            return;
          }
          this.printable.warn(message);
        });
        resolve(child);
      });
    });
    this.printable.info('server started', { command, cwd: appiumPath });
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
    await killChildProcess(process);
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
          'appium:adbPort': DOGU_ADB_SERVER_PORT,
        };
      }
      case Platform.PLATFORM_IOS: {
        const { tempPath } = HostPaths;
        const derivedDataPath = path.resolve(tempPath, 'derived-data', serial);
        await fs.promises.mkdir(derivedDataPath, { recursive: true });
        const wdaLocalPort = await getFreePort();
        const mjpegServerPort = await getFreePort();
        return {
          platformName: 'ios',
          'appium:automationName': 'XCUITest',
          'appium:deviceName': serial,
          'appium:udid': serial,
          'appium:wdaLocalPort': wdaLocalPort,
          'appium:derivedDataPath': derivedDataPath,
          'appium:mjpegServerPort': mjpegServerPort,
          'appium:newCommandTimeout': AppiumNewCommandTimeout,
          // 'appium:wdaLaunchTimeout': 300 * 1000,
          // 'appium:wdaConnectionTimeout': 300 * 1000,
          // 'appium:wdaStartupRetries': 1,
          // 'appium:waitForIdleTimeout': 300 * 1000,
          // 'appium:shouldUseSingletonTestManager': false,
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
      this.printable.error('Adb getSystemBarVisibility failed', { error: errorify(error) });
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
  @Retry({ retryCount: 10, retryInterval: 3000, printable: logger })
  private async restartClient(serverPort: number): Promise<AppiumData['client']> {
    this.printable.info('Appium client starting');
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
    this.printable.info('Appium client started', { remoteOptions, sessionId: driver.sessionId, capabilities: driver.capabilities });
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
      this.printable.error('client delete session failed', { error: errorify(error) });
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
        this.printable.error('Appium context switch failed', { error: errorify(error) });
      }
    }
    return contextPageSources;
  }
}

const constructorMap = {
  builtin: AppiumContextImpl,
  remote: AppiumRemoteContext,
  null: NullAppiumContext,
};

class AppiumContextProxyTask extends TaskQueueTask<void> {}

export class AppiumContextProxy implements AppiumContext, Zombieable {
  private readonly logger: Logger;
  private impl: AppiumContext;
  private next: AppiumContext | null = null;
  private nullContext: NullAppiumContext;
  private contextLock = new AsyncLock();

  constructor(private readonly options: AppiumContextOptions) {
    this.logger = createAppiumLogger(options.serial);
    this.nullContext = new NullAppiumContext(options, this.logger);

    this.impl = AppiumContextProxy.createAppiumContext(options, this.logger);
    ZombieServiceInstance.addComponent(this.impl);
  }
  get name(): string {
    return 'AppiumContextProxy';
  }
  get platform(): Platform {
    return this.options.platform;
  }
  get serial(): string {
    return this.options.serial;
  }
  get printable(): Printable {
    return this.logger;
  }

  get props(): ZombieProps {
    return {};
  }

  revive(): Promise<void> {
    return Promise.resolve();
  }

  async update(): Promise<void> {
    if (this.impl.key !== 'null' && false === ZombieServiceInstance.isAlive(this.impl)) {
      this.next = this.impl;
      this.impl = this.nullContext;
      return;
    }
    if (this.impl.key === 'null' && this.next && ZombieServiceInstance.isAlive(this.next)) {
      this.impl = this.next;
    }
  }

  onDie(): void {
    // noop
  }

  onComponentDeleted(): void {
    ZombieServiceInstance.deleteComponent(this.impl);
  }

  get key(): AppiumContextKey {
    return this.impl.key;
  }

  get openingState(): AppiumOpeningState {
    return this.impl.openingState;
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

  async switchAppiumContext(key: AppiumContextKey): Promise<void> {
    await this.contextLock.acquire('switchAppiumContext', async () => {
      const befImplKey = this.impl.key;
      this.logger.info(`switching appium context: from: ${befImplKey}, to: ${key} start`);
      const befImpl = this.impl;
      this.impl = this.nullContext;
      ZombieServiceInstance.deleteComponent(befImpl, 'switching appium context');

      const appiumContext = AppiumContextProxy.createAppiumContext({ ...this.options, key: key }, this.logger);
      const awaiter = ZombieServiceInstance.addComponent(appiumContext);
      await awaiter.waitUntilAlive();
      this.impl = appiumContext;
      this.logger.info(`switching appium context: from: ${befImplKey}, to: ${key} done`);
    });
  }

  getImpl<T extends Class<T>>(constructor: T): Instance<T> {
    if (!(this.impl instanceof constructor)) {
      throw new Error(`AppiumContextImpl is not instance of ${constructor.name}`);
    }
    return this.impl as Instance<T>;
  }

  private static createAppiumContext(options: AppiumContextOptions, logger: Logger): AppiumContext {
    const constructor = constructorMap[options.key];
    return new constructor(options, logger);
  }
}
