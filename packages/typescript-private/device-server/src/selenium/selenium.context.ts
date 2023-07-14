import { BrowserName } from '@dogu-private/types';
import { errorify, Printable, stringify } from '@dogu-tech/common';
import { HostPaths } from '@dogu-tech/node';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import fs from 'fs';
import _ from 'lodash';
import path from 'path';
import { BrowserInstaller } from '../browser-installer';
import { getFreePort } from '../internal/util/net';

export interface DefaultSeleniumContextOptions {
  npxPath: string;
  serverEnv: NodeJS.ProcessEnv;
}

export interface SeleniumContextOptions {
  browserName: BrowserName;
  browserVersion: string;
  key: string;
}

export type FilledSeleniumContextOptions = SeleniumContextOptions & DefaultSeleniumContextOptions;

export interface SeleniumContextInfo {
  port: number;
  sessionId: string | null;
}

interface SeleniumContextData extends SeleniumContextInfo {
  process: ChildProcessWithoutNullStreams;
}

const WebdriverManagerUpdateRetryCount = 3;

export class SeleniumContext {
  private _data: SeleniumContextData | null = null;
  private browserInstaller = new BrowserInstaller();

  constructor(private readonly options: FilledSeleniumContextOptions, private readonly logger: Printable) {}

  get info(): SeleniumContextInfo {
    if (!this._data) {
      throw new Error('Selenium server is not started.');
    }
    return this._data;
  }

  async open(): Promise<void> {
    if (this._data) {
      throw new Error('Selenium server is already started.');
    }
    await this.installBrowser();
    await this.updateWebdriverManagerRepeatedly();
    this._data = await this.startWebdriverManager();
  }

  private async installBrowser(): Promise<void> {
    const { browserName, browserVersion } = this.options;
    const isInstalled = await this.browserInstaller.isInstalled(browserName, browserVersion);
    if (isInstalled) {
      return;
    }
    await this.browserInstaller.install({
      browserName,
      browserVersion,
    });
  }

  private async updateWebdriverManagerRepeatedly(): Promise<void> {
    let lastError: unknown | null = null;
    for (let i = 0; i < WebdriverManagerUpdateRetryCount; i++) {
      try {
        await this.updateWebdriverManager();
        return;
      } catch (error) {
        lastError = error;
        this.logger.error('Failed to update selenium server.', { error: errorify(error) });
      }
    }
    throw new Error(`Failed to update selenium server. ${stringify(lastError)}`);
  }

  private async startWebdriverManager(): Promise<SeleniumContextData> {
    const { browserName, browserVersion, npxPath, serverEnv, key } = this.options;
    const clonePath = HostPaths.external.nodePackage.webdriverManager.clonePath(key);
    const seleniumPort = await getFreePort();
    const args = ['webdriver-manager', 'start', `--out_dir=${clonePath}`, `--seleniumPort=${seleniumPort}`];
    if (browserName === 'chrome') {
      // FIXME: henry - need version mapping
      // const resolvedVersion = await this.browserInstaller.resolveVersion(browserName, browserVersion);
      // args.push(`--versions.chrome=${resolvedVersion}`);
      args.push('--versions.chrome=latest');
    } else if (browserName === 'firefox') {
      // FIXME: henry - need version mapping
      // const resolvedVersion = await this.browserInstaller.resolveVersion(browserName, browserVersion);
      // args.push(`--versions.gecko=${resolvedVersion}`);
      args.push('--versions.gecko=latest');
    } else if (browserName === 'safari') {
      // noop
    } else if (browserName === 'edge') {
      throw new Error('Edge is not supported yet.');
    } else if (browserName === 'ie') {
      throw new Error('IE is not supported yet.');
    } else {
      throw new Error(`Unknown browser name: ${stringify(browserName)}`);
    }

    const browserPath = await this.browserInstaller.getBrowserPath(browserName, browserVersion);
    const browserDir = path.dirname(browserPath);
    const env = _.merge(serverEnv, {
      PATH: `${browserDir}${path.delimiter}${serverEnv.PATH || ''}`,
    });
    const child = await new Promise<ChildProcessWithoutNullStreams>((resolve, reject) => {
      const child = spawn(npxPath, args, {
        cwd: clonePath,
        env,
      });
      const onErrorForReject = (error: Error): void => {
        reject(error);
      };
      child.once('error', onErrorForReject);
      child.once('spawn', () => {
        this.logger.info(`${child.spawnargs.join(' ')} is started.`);
        child.off('error', onErrorForReject);
        child.on('error', (error) => {
          this.logger.error('Selenium server error.', { error: errorify(error) });
        });
        child.on('close', (code, signal) => {
          this.logger.error('Selenium server is closed.', { code, signal });
        });
        resolve(child);
      });
      child.stdout.setEncoding('utf8');
      child.stdout.on('data', (data) => {
        const message = stringify(data);
        if (message.length === 0) {
          return;
        }
        this.logger.info(message);
      });
      child.stderr.setEncoding('utf8');
      child.stderr.on('data', (data) => {
        const message = stringify(data);
        if (message.length === 0) {
          return;
        }
        this.logger.error(message);
      });
    });
    return {
      port: seleniumPort,
      process: child,
      sessionId: null,
    };
  }

  private async updateWebdriverManager(): Promise<void> {
    const { browserName, browserVersion, npxPath, serverEnv, key } = this.options;
    const prototypePath = HostPaths.external.nodePackage.webdriverManager.prototypePath();
    const clonePath = HostPaths.external.nodePackage.webdriverManager.clonePath(key);
    const clonePathStat = await fs.promises.stat(clonePath).catch(() => null);
    if (!clonePathStat) {
      await fs.promises.mkdir(path.dirname(clonePath), { recursive: true });
      await fs.promises.cp(prototypePath, clonePath, {
        recursive: true,
        force: true,
      });
    }
    const args = ['webdriver-manager', 'update', `--out_dir=${clonePath}`, '--standalone=true'];
    if (browserName === 'chrome') {
      args.push('--chrome=true');
      // FIXME: henry - need version mapping
      // const resolvedVersion = await this.browserInstaller.resolveVersion(browserName, browserVersion);
      // args.push(`--versions.chrome=${resolvedVersion}`);
      args.push('--versions.chrome=latest');
    } else if (browserName === 'firefox') {
      args.push('--gecko=true');
      // FIXME: henry - need version mapping
      // const resolvedVersion = await this.browserInstaller.resolveVersion(browserName, browserVersion);
      // args.push(`--versions.gecko=${resolvedVersion}`);
      args.push('--versions.gecko=latest');
    } else if (browserName === 'safari') {
      // noop
    } else if (browserName === 'edge') {
      throw new Error('Edge is not supported yet.');
    } else if (browserName === 'ie') {
      throw new Error('IE is not supported yet.');
    } else {
      throw new Error(`Unknown browser name: ${stringify(browserName)}`);
    }
    return new Promise<void>((resolve, reject) => {
      const child = spawn(npxPath, args, {
        cwd: clonePath,
        env: serverEnv,
      });
      const onErrorForReject = (error: Error): void => {
        reject(error);
      };
      child.once('error', onErrorForReject);
      child.once('spawn', () => {
        this.logger.info(`${child.spawnargs.join(' ')} is started.`);
        child.off('error', onErrorForReject);
        child.on('error', (error) => {
          this.logger.error('Selenium server error.', { error: errorify(error) });
        });
        child.on('close', (code, signal) => {
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`Selenium server is closed. code=${stringify(code)}, signal=${stringify(signal)}`));
          }
        });
      });
      child.stdout.setEncoding('utf8');
      child.stdout.on('data', (data) => {
        const message = stringify(data);
        if (message.length === 0) {
          return;
        }
        this.logger.info(message);
      });
      child.stderr.setEncoding('utf8');
      child.stderr.on('data', (data) => {
        const message = stringify(data);
        if (message.length === 0) {
          return;
        }
        this.logger.error(message);
      });
    });
  }

  async close(): Promise<void> {
    const deleteClonePath = async (): Promise<void> => {
      const { key } = this.options;
      const clonePath = HostPaths.external.nodePackage.webdriverManager.clonePath(key);
      await fs.promises
        .rm(clonePath, {
          recursive: true,
          force: true,
        })
        .catch((error) => {
          this.logger.error('Failed to delete webdriver-manager clone path.', { error: errorify(error) });
        });
    };

    if (!this._data) {
      await deleteClonePath();
      return;
    }

    const { process } = this._data;
    if (process.exitCode !== null || process.signalCode !== null) {
      this._data = null;
      await deleteClonePath();
      return;
    }

    await new Promise<void>((resolve) => {
      process.once('exit', () => {
        this._data = null;
        resolve();
      });
      process.kill();
    });
    await deleteClonePath();
  }
}
