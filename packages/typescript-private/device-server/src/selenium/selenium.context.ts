import { BrowserName, getBrowserPlatformByNodeJsPlatform } from '@dogu-private/types';
import { assertUnreachable, errorify, Printable, stringify } from '@dogu-tech/common';
import { EnsureBrowserAndDriverResult } from '@dogu-tech/device-client-common';
import { HostPaths, killChildProcess } from '@dogu-tech/node';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import _ from 'lodash';
import path from 'path';
import { BrowserManagerService } from '../browser-manager/browser-manager.service';
import { getFreePort } from '../internal/util/net';

const ServerStartPattern = /.*Started Selenium.*/;
const ServerStartTimeout = 30 * 1000;

export interface DefaultSeleniumContextOptions {
  javaPath: string;
  serverEnv: NodeJS.ProcessEnv;
}

export interface SeleniumContextOptions {
  browserName: BrowserName;
  browserVersion?: string;
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

  constructor(private readonly options: FilledSeleniumContextOptions, private readonly browserManagerService: BrowserManagerService, private readonly logger: Printable) {}

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

    const browserPlatform = getBrowserPlatformByNodeJsPlatform(process.platform);
    const ensureBrowserAndDriverResult = await this.browserManagerService.ensureBrowserAndDriver({
      browserName: this.options.browserName,
      browserVersion: this.options.browserVersion,
      browserPlatform,
    });
    this._data = await this.startSeleniumServer(ensureBrowserAndDriverResult);
  }

  private async startSeleniumServer(ensureBrowserAndDriverResult: EnsureBrowserAndDriverResult): Promise<SeleniumContextData> {
    const { browserName, browserVersion, browserPath, browserDriverPath } = ensureBrowserAndDriverResult;
    this.logger.info(
      `Starting selenium server for ${browserName} resolved browser version: ${browserVersion} requested browser version: ${stringify(this.options.browserVersion)}`,
    );

    if (!browserPath) {
      throw new Error(`Browser path is not found for ${browserName}`);
    }

    if (this.options.browserName !== browserName) {
      throw new Error(`Browser name is not matched. Expected: ${this.options.browserName}, Actual: ${browserName}`);
    }

    const { serverEnv, javaPath } = this.options;
    const seleniumServerPath = HostPaths.external.selenium.seleniumServerPath();
    const port = await getFreePort();
    const args: string[] = ['-jar', seleniumServerPath, 'standalone', '--host', '127.0.0.1', '--port', `${port}`, '--allow-cors', 'true', '--detect-drivers', 'false'];

    if (process.env.DOGU_LOG_LEVEL === 'verbose') {
      args.push('--log-level', 'ALL');
    }

    let stereotype: Record<string, unknown> = {};
    switch (browserName) {
      case 'chrome':
        {
          stereotype = {
            browserName: 'chrome',
            'goog:chromeOptions': {
              binary: browserPath,
              args: ['remote-allow-origins=*'],
            },
          };
          args.push('--driver-configuration', 'display-name="Google Chrome for Testing"', `webdriver-executable="${browserDriverPath}"`);
        }
        break;
      case 'firefox':
      case 'firefox-devedition':
        {
          stereotype = {
            browserName: 'firefox',
            'moz:firefoxOptions': {
              binary: browserPath,
            },
          };
          args.push('--driver-configuration', 'display-name="Mozilla Firefox"', `webdriver-executable="${browserDriverPath}"`);
        }
        break;
      case 'safari':
      case 'safaritp':
        {
          stereotype = {
            browserName: 'safari',
          };
          args.push('--driver-configuration', 'display-name="Safari"', `webdriver-executable="${browserDriverPath}"`);
        }
        break;
      case 'edge':
      case 'iexplorer':
      case 'samsung-internet':
        throw new Error(`Browser ${browserName} is not supported.`);
      default:
        assertUnreachable(browserName);
    }

    if (_.isEmpty(stereotype)) {
      throw new Error(`Stereotype is empty for ${browserName} ${stringify(this.options.browserVersion)}`);
    }

    if (this.options.browserVersion) {
      _.set(stereotype, 'browserVersion', this.options.browserVersion);
    }

    let stereotypeString = JSON.stringify(stereotype);
    if (process.platform === 'win32') {
      stereotypeString = stereotypeString.replace(/"/g, '\\"');
      args.push(`stereotype="${stereotypeString}"`);
    } else {
      args.push(`stereotype='${stereotypeString}'`);
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

      const env = { ...serverEnv, SE_NODE_GRID_URL: `http://127.0.0.1:${port}` };
      const child = spawn(javaPath, args, {
        cwd: seleniumServerDirPath,
        env,
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
          _reject(new Error(`Selenium server is closed with code: ${stringify(code)}, signal: ${stringify(signal)}`));
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
