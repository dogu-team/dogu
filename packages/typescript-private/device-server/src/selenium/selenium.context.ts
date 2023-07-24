import { BrowserName, isValidBrowserDriverName } from '@dogu-private/types';
import { errorify, Printable, stringify } from '@dogu-tech/common';
import { HostPaths, killChildProcess } from '@dogu-tech/node';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import _ from 'lodash';
import path from 'path';
import { BrowserInstaller } from '../browser-installer';
import { getFreePort } from '../internal/util/net';

const ChromeVersionPattern = /^(\d+)\.\d+\.\d+\.\d+$/;
const ServerStartPattern = /.*Started Selenium.*/;
const ServerStartTimeout = 30 * 1000;

export interface DefaultSeleniumContextOptions {
  javaPath: string;
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
    await this.installBrowserDriver();
    this._data = await this.startSeleniumServer();
  }

  private async installBrowser(): Promise<void> {
    const { browserName, browserVersion } = this.options;
    const isInstalled = await this.browserInstaller.isInstalled(browserName, browserVersion);
    if (isInstalled) {
      return;
    }

    await this.browserInstaller.install({
      browserOrDriverName: browserName,
      browserOrDriverVersion: browserVersion,
    });
  }

  private async installBrowserDriver(): Promise<void> {
    const { browserName, browserVersion } = this.options;
    let browserDriverName = '';
    const browserDriverVersion = browserVersion;
    if (browserName === 'chrome') {
      browserDriverName = 'chromedriver';
    } else {
      throw new Error(`Unknown browser name: ${stringify(browserName)}`);
    }
    if (!isValidBrowserDriverName(browserDriverName)) {
      throw new Error(`Invalid browser driver name: ${stringify(browserDriverName)}`);
    }

    const isInstalled = await this.browserInstaller.isInstalled(browserDriverName, browserDriverVersion);
    if (isInstalled) {
      return;
    }

    await this.browserInstaller.install({
      browserOrDriverName: browserDriverName,
      browserOrDriverVersion: browserDriverVersion,
    });
  }

  private async startSeleniumServer(): Promise<SeleniumContextData> {
    const { browserName, browserVersion, serverEnv, javaPath } = this.options;
    const seleniumServerPath = HostPaths.external.selenium.seleniumServerPath();
    const port = await getFreePort();
    const args: string[] = ['-jar', seleniumServerPath, 'standalone', '--host', '127.0.0.1', '--port', `${port}`, '--allow-cors', 'true', '--detect-drivers', 'false'];
    if (browserName === 'chrome') {
      const resolvedVersion = await this.browserInstaller.resolveVersion(browserName, browserVersion);
      const browserPath = await this.browserInstaller.getBrowserOrDriverPath(browserName, resolvedVersion);
      const browserDriverPath = await this.browserInstaller.getBrowserOrDriverPath('chromedriver', resolvedVersion);
      const stereotype: Record<string, unknown> = {
        browserName: 'chrome',
        'goog:chromeOptions': {
          binary: browserPath,
        },
      };
      const majorVersion = _.get(resolvedVersion.match(ChromeVersionPattern), 1, null);
      if (majorVersion) {
        _.set(stereotype, 'browserVersion', majorVersion);
      }
      args.push('--driver-configuration', 'display-name="Google Chrome for Testing"', `webdriver-executable="${browserDriverPath}"`);
      let stereotypeString = JSON.stringify(stereotype);
      if (process.platform === 'win32') {
        stereotypeString = stereotypeString.replace(/"/g, '\\"');
        args.push(`stereotype="${stereotypeString}"`);
      } else {
        args.push(`stereotype='${stereotypeString}'`);
      }
    } else {
      throw new Error(`Unknown browser name: ${stringify(browserName)}`);
    }

    const seleniumServerDirPath = path.dirname(seleniumServerPath);
    const fullCommand = `${javaPath} ${args.join(' ')}`;
    this.logger.info(`Starting selenium server: ${fullCommand}`);

    const child = await new Promise<ChildProcessWithoutNullStreams>((resolve, reject) => {
      let fullfilled = false;

      let timeout: NodeJS.Timeout | null = setTimeout(() => {
        timeout = null;
        if (fullfilled) {
          return;
        }
        fullfilled = true;
        reject(new Error(`Selenium server is not started in ${ServerStartTimeout}ms with command: ${fullCommand}`));
      }, ServerStartTimeout);

      const _resolve = (child: ChildProcessWithoutNullStreams): void => {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        if (fullfilled) {
          return;
        }
        fullfilled = true;
        resolve(child);
      };

      const _reject = (error: Error): void => {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        if (fullfilled) {
          return;
        }
        fullfilled = true;
        reject(error);
      };

      const child = spawn(javaPath, args, {
        cwd: seleniumServerDirPath,
        env: serverEnv,
        shell: true,
      });

      const onErrorForReject = (error: Error): void => {
        _reject(error);
      };
      child.on('error', onErrorForReject);

      child.once('spawn', () => {
        this.logger.info(`${child.spawnargs.join(' ')} is started.`);
        child.off('error', onErrorForReject);
        child.on('error', (error) => {
          this.logger.error('Selenium server error.', { error: errorify(error) });
        });
        child.on('close', (code, signal) => {
          this.logger.info('Selenium server is closed.', { code, signal });
          _reject(new Error(`Selenium server is closed with code: ${code}, signal: ${signal}`));
        });
      });

      child.stdout.setEncoding('utf8');
      child.stdout.on('data', (data) => {
        const message = stringify(data);
        if (message.length === 0) {
          return;
        }

        this.logger.info(message);
        if (ServerStartPattern.test(message)) {
          _resolve(child);
          return;
        }
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
      port,
      process: child,
      sessionId: null,
    };
  }

  async close(): Promise<void> {
    if (!this._data) {
      return;
    }

    const { process } = this._data;
    try {
      await killChildProcess(process);
      this.logger.info('Selenium server is killed.', {
        browserName: this.options.browserName,
        browserVersion: this.options.browserVersion,
        key: this.options.key,
        port: this._data.port,
      });
    } finally {
      this._data = null;
    }
  }
}
