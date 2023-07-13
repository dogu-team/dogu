import { errorify, Printable, stringify } from '@dogu-tech/common';
import { HostPaths } from '@dogu-tech/node';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { getFreePort } from '../internal/util/net';

export const BrowserName = ['chrome', 'firefox', 'safari', 'edge', 'ie'] as const;
export type BrowserName = (typeof BrowserName)[number];

export function isValidBrowserName(value: unknown): value is BrowserName {
  return BrowserName.includes(value as BrowserName);
}

export interface DefaultSeleniumContextOptions {
  pnpmPath: string;
  serverEnv: NodeJS.ProcessEnv;
}

export interface SeleniumContextOptions {
  browserName: BrowserName;
  browserVersion: string;
}

export type SeleniumContextOpenOptions = SeleniumContextOptions & {
  key: string;
};

export type SeleniumContextOptionsWithDefault = SeleniumContextOptions & DefaultSeleniumContextOptions;

export function createBrowserKey(options: SeleniumContextOptions): string {
  const { browserName, browserVersion } = options;
  return `${browserName}-${browserVersion}`;
}

export interface SeleniumContextInfo {
  port: number;
}

interface SeleniumContextData extends SeleniumContextInfo {
  process: ChildProcessWithoutNullStreams;
}

const WebdriverManagerUpdateRetryCount = 3;

export class SeleniumContext {
  private _data: SeleniumContextData | null = null;

  constructor(private readonly options: SeleniumContextOptionsWithDefault, private readonly logger: Printable) {}

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
    await this.downloadBrowser();
    await this.updateWebdriverManagerRepeatedly();
    this._data = await this.startWebdriverManager();
  }

  // TODO: henry - implement
  private async downloadBrowser(): Promise<void> {
    await Promise.resolve();
  }

  private async updateWebdriverManagerRepeatedly(): Promise<void> {
    for (let i = 0; i < WebdriverManagerUpdateRetryCount; i++) {
      try {
        await this.updateWebdriverManager();
        return;
      } catch (error) {
        this.logger.error('Failed to update selenium server.', { error: errorify(error) });
      }
    }
  }

  private async startWebdriverManager(): Promise<SeleniumContextData> {
    const { browserName, browserVersion, pnpmPath, serverEnv } = this.options;
    const browserKey = createBrowserKey(this.options);
    const clonePath = HostPaths.external.nodePackage.webdriverManager.clonePath(browserKey);
    const seleniumPort = await getFreePort();
    const args = ['webdriver-manager', 'start', `--out_dir=${clonePath}`, `--seleniumPort=${seleniumPort}`];
    if (browserName === 'chrome') {
      // TODO: henry - accept chrome version from options to --versions.chrome={browserVersion}
      args.push(`--versions.chrome=latest`);
    } else if (browserName === 'firefox') {
      // TODO: henry - accept firefox version from options to --versions.gecko={browserVersion}
      args.push(`--versions.gecko=latest`);
    } else if (browserName === 'safari') {
      // noop
    } else if (browserName === 'edge') {
      throw new Error('Edge is not supported yet.');
    } else if (browserName === 'ie') {
      throw new Error('IE is not supported yet.');
    } else {
      throw new Error(`Unknown browser name: ${stringify(browserName)}`);
    }
    // TODO: henry - add browser binary path to PATH
    const child = await new Promise<ChildProcessWithoutNullStreams>((resolve, reject) => {
      const child = spawn(pnpmPath, args, {
        cwd: clonePath,
        env: serverEnv,
      });
      const onErrorForReject = (error: Error): void => {
        reject(error);
      };
      child.once('error', onErrorForReject);
      child.once('spawn', () => {
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
    };
  }

  private async updateWebdriverManager(): Promise<void> {
    const { browserName, browserVersion, pnpmPath, serverEnv } = this.options;
    const prototypePath = HostPaths.external.nodePackage.webdriverManager.prototypePath();
    const browserKey = createBrowserKey(this.options);
    const clonePath = HostPaths.external.nodePackage.webdriverManager.clonePath(browserKey);
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
      // TODO: henry - accept chrome version from options to --versions.chrome={browserVersion}
      args.push(`--versions.chrome=latest`);
    } else if (browserName === 'firefox') {
      args.push('--gecko=true');
      // TODO: henry - accept firefox version from options to --versions.gecko={browserVersion}
      args.push(`--versions.gecko=latest`);
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
      const child = spawn(pnpmPath, args, {
        cwd: clonePath,
        env: serverEnv,
      });
      const onErrorForReject = (error: Error): void => {
        reject(error);
      };
      child.once('error', onErrorForReject);
      child.once('spawn', () => {
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
    if (!this._data) {
      return;
    }
    const { process } = this._data;
    if (process.exitCode !== null || process.signalCode !== null) {
      this._data = null;
      return;
    }
    return new Promise<void>((resolve) => {
      process.once('exit', () => {
        this._data = null;
        resolve();
      });
      process.kill();
    });
  }
}
