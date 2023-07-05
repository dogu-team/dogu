import { errorify, stringify } from '@dogu-tech/common';
import { Android, AppiumContextInfo, ContextPageSource, ScreenSize } from '@dogu-tech/device-client-common';
import { Logger } from '@dogu-tech/node';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { getFreePort } from '../internal/util/net';
import { AppiumContext, AppiumContextKey, AppiumContextOptions, AppiumData } from './appium.context';

function emptyClientData(): AppiumData['client'] {
  return {
    remoteOptions: {},
    driver: null,
  };
}

export class AppiumRemoteContext implements AppiumContext {
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
    const { server } = this.data;
    const { port, command, workingPath, env } = server;
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

  constructor(private readonly options: AppiumContextOptions, private readonly logger: Logger) {}

  get key(): AppiumContextKey {
    return 'remote';
  }

  async open(): Promise<void> {
    this.openingState = 'opening';
    try {
      const serverData = await this.openServer();
      this._data = {
        server: serverData,
        client: emptyClientData(),
      };
      this._isHealthy = true;
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
    await this.stopServer(data.server.process);
  }

  isHealthy(): boolean {
    return this._isHealthy;
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
          this._isHealthy = false;
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

  getAndroid(): Promise<Android | undefined> {
    this.logger.error('AppiumRemoteContext.getAndroid is not implemented');
    return Promise.resolve(undefined);
  }

  getScreenSize(): Promise<ScreenSize> {
    this.logger.error('AppiumRemoteContext.getScreenSize is not implemented');
    return Promise.resolve({ width: 0, height: 0 });
  }

  getPageSource(): Promise<string> {
    this.logger.error('AppiumRemoteContext.getPageSource is not implemented');
    return Promise.resolve('');
  }

  getContexts(): Promise<string[]> {
    this.logger.error('AppiumRemoteContext.getContexts is not implemented');
    return Promise.resolve([]);
  }

  getContext(): Promise<string> {
    this.logger.error('AppiumRemoteContext.getContext is not implemented');
    return Promise.resolve('');
  }

  switchContext(contextId: string): Promise<void> {
    throw new Error('Not implemented');
  }

  switchContextAndGetPageSource(contextId: string): Promise<string> {
    throw new Error('Not implemented');
  }

  getContextPageSources(): Promise<ContextPageSource[]> {
    throw new Error('Not implemented');
  }
}
