import { BrowserName, BrowserPlatform, isAllowedMacosBrowserName, isAllowedWindowsBrowserName } from '@dogu-private/types';
import { PrefixLogger } from '@dogu-tech/common';
import { HostPaths } from '@dogu-tech/node';
import AsyncLock from 'async-lock';
import { exec } from 'child_process';
import fs from 'fs';
import { promisify } from 'util';
import { logger } from '../logger/logger.instance';
import { BrowserInstallerOptions, DriverInstallerOptions, InstalledBrowserFinderOptions, InstalledBrowserInfo, InstalledDriverInfo } from './browser-manager.types';

interface LogOutput {
  result?: {
    browser_path?: string;
    driver_path?: string;
  };
}

const execAsync = promisify(exec);
const writeLock = new AsyncLock();
const findInstalledBrowserTimeout = 60_000;
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

  match(options: { browserName: BrowserName; browserPlatform: BrowserPlatform }): boolean {
    const { browserName, browserPlatform } = options;
    if (browserPlatform === 'macos') {
      return isAllowedMacosBrowserName(browserName);
    } else if (browserPlatform === 'windows') {
      return isAllowedWindowsBrowserName(browserName);
    }

    return false;
  }

  async findInstalledBrowser(options: InstalledBrowserFinderOptions): Promise<InstalledBrowserInfo[]> {
    await this.validateSeleniumManager();

    const { browserName, resolvedBrowserVersionMajor } = options;
    const seleniumManagerPath = HostPaths.external.nodePackage.seleniumWebdriver.seleniumManagerPath();
    const { stdout } = await execAsync(`${seleniumManagerPath} --browser ${browserName} --browser-version ${resolvedBrowserVersionMajor} --output JSON --offline`, {
      timeout: findInstalledBrowserTimeout,
    });
    const parsed = JSON.parse(stdout) as LogOutput;
    const browserPath = parsed.result?.browser_path ?? '';
    const driverPath = parsed.result?.driver_path ?? '';
    if (browserPath) {
      this.logger.info(`Browser found at ${browserPath}`);

      return [
        {
          browserPath,
          driverPath,
        },
      ];
    }

    return [];
  }

  async installDriver(options: DriverInstallerOptions): Promise<InstalledDriverInfo> {
    await this.validateSeleniumManager();

    const { browserName, resolvedBrowserVersion } = options;
    const seleniumManagerPath = HostPaths.external.nodePackage.seleniumWebdriver.seleniumManagerPath();
    const { stdout } = await writeLock.acquire(SeleniumManager.name, async () => {
      return await execAsync(`${seleniumManagerPath} --browser ${browserName} --driver-version ${resolvedBrowserVersion} --output JSON`, {
        timeout: installDriverTimeout,
      });
    });
    const parsed = JSON.parse(stdout) as LogOutput;
    const driverPath = parsed.result?.driver_path ?? '';
    if (!driverPath) {
      throw new Error(`Driver path not found for browser ${browserName} version ${resolvedBrowserVersion}`);
    }

    const driverPathStat = await fs.promises.stat(driverPath).catch(() => null);
    if (!driverPathStat || !driverPathStat.isFile()) {
      throw new Error(`Driver file not found at ${driverPath}`);
    }

    this.logger.info(`Driver file found at ${driverPath}`);
    return {
      driverPath,
    };
  }

  async installBrowser(options: BrowserInstallerOptions): Promise<InstalledBrowserInfo> {
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
      browserPath,
    };
  }
}
