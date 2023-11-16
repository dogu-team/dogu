import { Platform, Serial } from '@dogu-private/types';
import { callAsyncWithTimeout, delay, errorify, NullLogger, Retry, stringify } from '@dogu-tech/common';
import { Android, AppiumContextInfo, ContextPageSource, Rect, ScreenSize, SystemBar } from '@dogu-tech/device-client-common';
import { killChildProcess, killProcessOnPort, Logger } from '@dogu-tech/node';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import _ from 'lodash';
import WebDriverIO, { remote } from 'webdriverio';
import { DevicePortService } from '../device-port/device-port.service';
import { AdbSerial } from '../internal/externals/index';
import { Zombieable, ZombieProps } from '../internal/services/zombie/zombie-component';
import { ZombieServiceInstance } from '../internal/services/zombie/zombie-service';
import { logger } from '../logger/logger.instance';
import { createAppiumCapabilities } from './appium.capabilites';
import { AppiumService } from './appium.service';

export type WDIOBrowser = WebDriverIO.Browser<'async'>;
export type WDIOElement = WebDriverIO.Element<'async'>;

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

export interface BaseAppiumContextOptions extends DefaultAppiumContextOptions {
  service: AppiumService;
  devicePortService: DevicePortService;
  serial: Serial;
  key: AppiumContextKey;
}

export interface AndroidAppiumContextOptions extends BaseAppiumContextOptions {
  platform: Platform.PLATFORM_ANDROID;
}

export interface IosAppiumContextOptions extends BaseAppiumContextOptions {
  platform: Platform.PLATFORM_IOS;
  wdaForwardPort: number;
}

export type AppiumContextOptions = AndroidAppiumContextOptions | IosAppiumContextOptions;

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

async function callClientAsyncWithTimeout<T>(callClientAsync: Promise<T>): Promise<T> {
  return callAsyncWithTimeout(callClientAsync, { timeout: AppiumClientCallAsyncTimeout });
}

export type AppiumContextKey = 'builtin' | 'remote' | 'null';
export type AppiumOpeningState = 'opening' | 'openingSucceeded' | 'openingFailed';

export interface AppiumContext extends Zombieable {
  get key(): AppiumContextKey;
  get openingState(): AppiumOpeningState;
  get options(): AppiumContextOptions;
  getInfo(): AppiumContextInfo;
  getAndroid(): Promise<Android | undefined>;
  getScreenSize(): Promise<ScreenSize>;
  switchContext(contextId: string): Promise<void>;
  getContext(): Promise<string>;
  getContexts(): Promise<string[]>;
  getPageSource(): Promise<string>;
  switchContextAndGetPageSource(contextId: string): Promise<string>;
  getContextPageSources(): Promise<ContextPageSource[]>;
  select(selector: string): Promise<WDIOElement | undefined>;
  driver(): WDIOBrowser | undefined;
}

export class NullAppiumContext implements AppiumContext {
  public readonly props: ZombieProps = {};
  constructor(
    public readonly options: AppiumContextOptions,
    public readonly printable: Logger,
  ) {}

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

  async revive(): Promise<void> {
    return Promise.resolve();
  }
  onDie(reason: string): void | Promise<void> {
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

  async getAndroid(): Promise<undefined> {
    return Promise.resolve(undefined);
  }

  async getScreenSize(): Promise<ScreenSize> {
    return Promise.resolve({ width: 0, height: 0 });
  }

  async switchContext(contextId: string): Promise<void> {
    return Promise.resolve();
  }

  async getContext(): Promise<string> {
    return Promise.resolve('');
  }

  async getContexts(): Promise<string[]> {
    return Promise.resolve([]);
  }

  async getPageSource(): Promise<string> {
    return Promise.resolve('');
  }

  async switchContextAndGetPageSource(contextId: string): Promise<string> {
    return Promise.resolve('');
  }

  async getContextPageSources(): Promise<ContextPageSource[]> {
    return Promise.resolve([]);
  }
  async select(selector: string): Promise<WDIOElement | undefined> {
    return Promise.resolve(undefined);
  }
  driver(): undefined {
    return;
  }
}

export interface AppiumServerData {
  port: number;
  command: string;
  env: Record<string, string | undefined>;
  workingPath: string;
  process: ChildProcessWithoutNullStreams;
}

export interface AppiumData {
  server: AppiumServerData;
  client: {
    remoteOptions: Record<string, unknown>;
    driver: WDIOBrowser;
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
  constructor(
    public readonly options: AppiumContextOptions,
    public readonly printable: Logger,
  ) {}

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
    return { srvPort: this.options.serverPort, cliSessId: this._data?.client.driver.sessionId, openingState: this.openingState };
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
      await clientData.driver.getWindowSize();
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

  async onDie(reason: string): Promise<void> {
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
    const args = ['appium', '--log-no-colors', '--port', `${port}`, '--session-override', '--log-level', 'debug', '--allow-insecure=adb_shell'];
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

  async getAndroid(): Promise<Android | undefined> {
    const { platform, serial } = this.options;
    if (platform !== Platform.PLATFORM_ANDROID) {
      return undefined;
    }
    const adb = new AdbSerial(serial, this.printable);
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
      const systemBarVisibility = await adb.getSystemBarVisibility();
      statusBar.visible = systemBarVisibility.statusBar;
      navigationBar.visible = systemBarVisibility.navigationBar;
    } catch (error) {
      this.printable.error('Adb getSystemBarVisibility failed', { error: errorify(error) });
    }

    return {
      // viewport,
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
    const argumentCapabilities = await createAppiumCapabilities(this.options, this.printable);
    const remoteOptions: Parameters<typeof remote>[0] = {
      port: serverPort,
      logLevel: 'trace',
      capabilities: {
        alwaysMatch: {},
        firstMatch: [argumentCapabilities],
      },
    };
    const driver = await remote(remoteOptions);
    const filteredRemoteOptions = Object.keys(remoteOptions).reduce(
      (acc, key) => {
        const value = _.get(remoteOptions, key) as unknown;
        if (_.isFunction(value)) {
          return acc;
        } else {
          _.set(acc, key, value);
          return acc;
        }
      },
      {} as Record<string, unknown>,
    );

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
  private async stopClient(driver: WDIOBrowser): Promise<void> {
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

  async select(selector: string): Promise<WDIOElement | undefined> {
    try {
      const elem = await this.data.client.driver.$(selector);
      return elem;
    } catch (e) {
      return undefined;
    }
  }

  driver(): WDIOBrowser | undefined {
    return this.data.client.driver;
  }
}
