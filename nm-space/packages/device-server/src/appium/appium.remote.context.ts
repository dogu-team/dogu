import { Platform } from '@dogu-private/types';
import { errorify, stringify } from '@dogu-tech/common';
import { Android, AppiumContextInfo, ContextPageSource, ScreenSize } from '@dogu-tech/device-client-common';
import { killChildProcess, killProcessOnPort, Logger, waitPortOpen } from '@dogu-tech/node';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { ZombieProps } from '../internal/services/zombie/zombie-component';
import { ZombieServiceInstance } from '../internal/services/zombie/zombie-service';
import { AppiumContext, AppiumContextKey, AppiumContextOptions, AppiumServerData, WDIOElement } from './appium.context';

export class AppiumRemoteContext implements AppiumContext {
  private _data: AppiumServerData | null = null;
  public sessionId = '';
  private get data(): AppiumServerData {
    if (!this._data) {
      throw new Error('Appium data is not found');
    }
    return this._data;
  }

  openingState: 'opening' | 'openingSucceeded' | 'openingFailed' = 'opening';

  constructor(
    public readonly options: AppiumContextOptions,
    public readonly printable: Logger,
  ) {}

  get name(): string {
    return 'AppiumRemoteContext';
  }
  get platform(): Platform {
    return this.options.platform;
  }
  get serial(): string {
    return this.options.serial;
  }

  get props(): ZombieProps {
    return { srvPort: this.options.serverPort, cliSessId: this.sessionId, openingState: this.openingState };
  }

  getInfo(): AppiumContextInfo {
    const { serial, platform } = this.options;
    const { port, command, workingPath, env } = this.data;
    return {
      serial,
      platform,
      client: {
        remoteOptions: {},
        capabilities: {},
        sessionId: '',
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
    return 'remote';
  }

  async revive(): Promise<void> {
    this.openingState = 'opening';
    try {
      const serverData = await this.openServer();
      this._data = serverData;
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
    await this.stopServer(data.process);
  }

  private async openServer(): Promise<AppiumServerData> {
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
          ZombieServiceInstance.notifyDie(this, `server closed ${code} ${signal}`);
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
    await waitPortOpen(port, 60000);
    this.printable.info('server started', { command, cwd: appiumPath });
    return {
      port,
      command,
      env: serverEnv,
      workingPath: appiumPath,
      process,
    };
  }

  private async stopServer(process: ChildProcessWithoutNullStreams): Promise<void> {
    return killChildProcess(process);
  }

  async getAndroid(): Promise<Android | undefined> {
    this.printable.error('AppiumRemoteContext.getAndroid is not implemented');
    return Promise.resolve(undefined);
  }

  async getScreenSize(): Promise<ScreenSize> {
    this.printable.error('AppiumRemoteContext.getScreenSize is not implemented');
    return Promise.resolve({ width: 0, height: 0 });
  }

  async getPageSource(): Promise<string> {
    this.printable.error('AppiumRemoteContext.getPageSource is not implemented');
    return Promise.resolve('');
  }

  async getContexts(): Promise<string[]> {
    this.printable.error('AppiumRemoteContext.getContexts is not implemented');
    return Promise.resolve([]);
  }

  async getContext(): Promise<string> {
    this.printable.error('AppiumRemoteContext.getContext is not implemented');
    return Promise.resolve('');
  }

  async switchContext(contextId: string): Promise<void> {
    this.printable.error('AppiumRemoteContext.switchContext is not implemented');
    return Promise.resolve();
  }

  async switchContextAndGetPageSource(contextId: string): Promise<string> {
    this.printable.error('AppiumRemoteContext.switchContextAndGetPageSource is not implemented');
    return Promise.resolve('');
  }

  async getContextPageSources(): Promise<ContextPageSource[]> {
    this.printable.error('AppiumRemoteContext.getContextPageSources is not implemented');
    return Promise.resolve([]);
  }

  async select(selector: string): Promise<WDIOElement | undefined> {
    this.printable.error('AppiumRemoteContext.findByText is not implemented');
    return Promise.resolve(undefined);
  }

  driver(): undefined {
    return;
  }
}
