import {
  BrowserName,
  BrowserPlatform,
  isAllowedAndroidBrowserName,
  isAllowedBrowserName,
  isAllowedIosBrowserName,
  isAllowedMacosBrowserName,
  isAllowedWindowsBrowserName,
} from '@dogu-private/types';
import { PrefixLogger } from '@dogu-tech/common';
import {
  BrowserDriverInstallation,
  BrowserDriverInstallerOptions,
  BrowserInstallation,
  BrowserInstallationFinderOptions,
  BrowserInstallerOptions,
} from '@dogu-tech/device-client-common';
import { HostPaths } from '@dogu-tech/node';
import AsyncLock from 'async-lock';
import { exec } from 'child_process';
import fs from 'fs';
import { promisify } from 'util';
import { logger } from '../logger/logger.instance';

interface LogOutput {
  result?: {
    browser_path?: string;
    driver_path?: string;
  };
}

const execAsync = promisify(exec);
const writeLock = new AsyncLock();
const findBrowserInstallationTimeout = 60_000;
const installDriverTimeout = 10 * 60_000;

export class SeleniumManager {
  private readonly logger = new PrefixLogger(logger, '[SeleniumManager]');
  private validated = false;

  private async validateSeleniumManager(): Promise<void> {
    if (this.validated) {
      return;
    }
    const seleniumManagerPath = HostPaths.external.nodePackage.seleniumWebdriver.seleniumManagerPath();
    const seleniumManagerPathStat = await fs.promises.stat(seleniumManagerPath).catch(() => null);
    if (!seleniumManagerPathStat || !seleniumManagerPathStat.isFile()) {
      throw new Error(`Selenium manager not found at ${seleniumManagerPath}`);
    }

    await execAsync(`${seleniumManagerPath} --version`, { timeout: 60_000 });
    this.validated = true;
  }

  matchForBrowser(options: { browserName: BrowserName; browserPlatform: BrowserPlatform }): boolean {
    const { browserName, browserPlatform } = options;
    if (browserPlatform === 'macos') {
      return isAllowedMacosBrowserName(browserName);
    } else if (browserPlatform === 'windows') {
      return isAllowedWindowsBrowserName(browserName);
    }

    return false;
  }

  matchForDriver(options: { browserName: BrowserName; browserPlatform: BrowserPlatform }): boolean {
    const { browserName, browserPlatform } = options;
    switch (browserPlatform) {
      case 'macos':
        return isAllowedMacosBrowserName(browserName);
      case 'windows':
        return isAllowedWindowsBrowserName(browserName);
      case 'android':
        return isAllowedAndroidBrowserName(browserName);
      case 'ios':
        return isAllowedIosBrowserName(browserName);
      default:
        const _exhaustiveCheck: never = browserPlatform;
        throw new Error(`Unknown browser platform: ${_exhaustiveCheck}`);
    }
  }

  async findBrowserInstallation(options: BrowserInstallationFinderOptions): Promise<BrowserInstallation[]> {
    await this.validateSeleniumManager();

    const { resolvedBrowserMajorVersion } = options;
    if (resolvedBrowserMajorVersion) {
      return this.findBrowserInstallationByMajorVersion(options);
    } else {
      return this.findBrowserInstallationFromCache();
    }
  }

  private async findBrowserInstallationByMajorVersion(options: BrowserInstallationFinderOptions): Promise<BrowserInstallation[]> {
    const { browserName, browserPlatform, resolvedBrowserMajorVersion, resolvedBrowserVersion } = options;
    if (!resolvedBrowserMajorVersion) {
      throw new Error(`Browser version is required. Browser name: ${browserName}, browser platform: ${browserPlatform}`);
    }

    const seleniumManagerPath = HostPaths.external.nodePackage.seleniumWebdriver.seleniumManagerPath();
    const { stdout } = await execAsync(`${seleniumManagerPath} --browser ${browserName} --browser-version ${resolvedBrowserMajorVersion} --output JSON --offline`, {
      timeout: findBrowserInstallationTimeout,
    });
    const parsed = JSON.parse(stdout) as LogOutput;
    const browserPath = parsed.result?.browser_path ?? '';
    const browserDriverPath = parsed.result?.driver_path ?? '';
    if (browserPath) {
      this.logger.info(`Browser found at ${browserPath}`);

      if (browserDriverPath) {
        await fs.promises.chmod(browserDriverPath, 0o755);
      }

      return [
        {
          browserName,
          browserPath,
          browserDriverPath,
          browserVersion: resolvedBrowserVersion,
          browserMajorVersion: resolvedBrowserMajorVersion,
        },
      ];
    }

    return [];
  }

  private async findBrowserInstallationFromCache(): Promise<BrowserInstallation[]> {
    const seleniumManagerJsonPath = HostPaths.external.nodePackage.seleniumWebdriver.seleniumManagerJsonPath();
    const content = await fs.promises.readFile(seleniumManagerJsonPath, 'utf-8');
    const parsed = JSON.parse(content) as { browsers?: { browser_name?: string; major_browser_version?: string; browser_version?: string }[] };
    const browsers = parsed.browsers ?? [];
    const browserInfos = browsers
      .filter((browser) => isAllowedBrowserName(browser.browser_name ?? '') && browser.browser_version)
      .map(
        (browser) =>
          ({ browserName: browser.browser_name, browserVersion: browser.browser_version, majorBrowserVersion: Number(browser.major_browser_version) } as {
            browserName: BrowserName;
            browserVersion: string;
            majorBrowserVersion: number;
          }),
      );
    return browserInfos;
  }

  async installDriver(options: BrowserDriverInstallerOptions): Promise<BrowserDriverInstallation> {
    await this.validateSeleniumManager();

    const { browserName, resolvedBrowserVersion } = options;
    const seleniumManagerPath = HostPaths.external.nodePackage.seleniumWebdriver.seleniumManagerPath();
    const { stdout } = await writeLock.acquire(SeleniumManager.name, async () => {
      return await execAsync(`${seleniumManagerPath} --browser ${browserName} --driver-version ${resolvedBrowserVersion} --output JSON`, {
        timeout: installDriverTimeout,
      });
    });
    const parsed = JSON.parse(stdout) as LogOutput;
    const browserDriverPath = parsed.result?.driver_path ?? '';
    if (!browserDriverPath) {
      throw new Error(`Driver path not found for browser ${browserName} version ${resolvedBrowserVersion}`);
    }

    const browserDriverPathStat = await fs.promises.stat(browserDriverPath).catch(() => null);
    if (!browserDriverPathStat || !browserDriverPathStat.isFile()) {
      throw new Error(`Driver file not found at ${browserDriverPathStat}`);
    }

    this.logger.info(`Driver file found at ${browserDriverPath}`);

    await fs.promises.chmod(browserDriverPath, 0o755);
    return {
      browserDriverPath,
    };
  }

  async installBrowser(options: BrowserInstallerOptions): Promise<BrowserInstallation> {
    await this.validateSeleniumManager();

    const { browserName, resolvedBrowserVersion } = options;
    const seleniumManagerPath = HostPaths.external.nodePackage.seleniumWebdriver.seleniumManagerPath();
    const { stdout } = await writeLock.acquire(SeleniumManager.name, async () => {
      return await execAsync(`${seleniumManagerPath} --browser ${browserName} --browser-version ${resolvedBrowserVersion} --output JSON`, {
        timeout: installDriverTimeout,
      });
    });
    const parsed = JSON.parse(stdout) as LogOutput;
    const browserPath = parsed.result?.browser_path ?? '';
    if (!browserPath) {
      throw new Error(`Browser path not found for browser ${browserName} version ${resolvedBrowserVersion}`);
    }

    const browserPathStat = await fs.promises.stat(browserPath).catch(() => null);
    if (!browserPathStat || !browserPathStat.isFile()) {
      throw new Error(`Browser file not found at ${browserPath}`);
    }

    this.logger.info(`Browser file found at ${browserPath}`);
    return {
      browserName,
      browserPath,
    };
  }
}
