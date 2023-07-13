import { BrowserName } from '@dogu-private/types';
import { stringify } from '@dogu-tech/common';
import { HostPaths } from '@dogu-tech/node';
import { Browser, computeExecutablePath, detectBrowserPlatform, getInstalledBrowsers, install, resolveBuildId } from '@puppeteer/browsers';
import AsyncLock from 'async-lock';
import fs from 'fs';

const BrowsersPathLock = new AsyncLock();

export interface BrowserInstallOptions {
  browserName: BrowserName;
  browserVersion: string;
  downloadProgressCallback?: (downloadedBytes: number, totalBytes: number) => void;
}

export class BrowserInstaller {
  async install(options: BrowserInstallOptions): Promise<void> {
    const { browserName, browserVersion, downloadProgressCallback } = options;
    const platform = detectBrowserPlatform();
    if (!platform) {
      throw new Error('Unsupported platform');
    }
    const browser = this.parseBrowserName(browserName);
    const buildId = await resolveBuildId(browser, platform, browserVersion);
    const browsersPath = HostPaths.external.browser.browsersPath();
    await this.lockBrowsersPath(async () => {
      await fs.promises.mkdir(browsersPath, { recursive: true });
      await install({
        cacheDir: browsersPath,
        browser,
        buildId,
        platform,
        downloadProgressCallback,
      });
    });
  }

  isSupported(browserName: BrowserName): boolean {
    try {
      this.parseBrowserName(browserName);
      return true;
    } catch (e) {
      return false;
    }
  }

  async isInstalled(browserName: BrowserName, browserVersion: string): Promise<boolean> {
    const platform = detectBrowserPlatform();
    if (!platform) {
      throw new Error('Unsupported platform');
    }
    const browsersPath = HostPaths.external.browser.browsersPath();
    const installedBrowsers = await this.lockBrowsersPath(async () => {
      return getInstalledBrowsers({
        cacheDir: browsersPath,
      });
    });
    const browser = this.parseBrowserName(browserName);
    const buildId = await resolveBuildId(browser, platform, browserVersion);
    return installedBrowsers.some((installedBrowser) => installedBrowser.browser === browser && installedBrowser.buildId === buildId);
  }

  async resolveVersion(browserName: BrowserName, browserVersion: string): Promise<string> {
    const platform = detectBrowserPlatform();
    if (!platform) {
      throw new Error('Unsupported platform');
    }
    const browser = this.parseBrowserName(browserName);
    return resolveBuildId(browser, platform, browserVersion);
  }

  async lockBrowsersPath<T>(callback: () => Promise<T>): Promise<T> {
    const browsersPath = HostPaths.external.browser.browsersPath();
    return BrowsersPathLock.acquire(browsersPath, callback);
  }

  async getBrowserPath(browserName: BrowserName, browserVersion: string): Promise<string> {
    const platform = detectBrowserPlatform();
    if (!platform) {
      throw new Error('Unsupported platform');
    }
    const browser = this.parseBrowserName(browserName);
    const buildId = await resolveBuildId(browser, platform, browserVersion);
    const browsersPath = HostPaths.external.browser.browsersPath();
    return computeExecutablePath({
      cacheDir: browsersPath,
      platform,
      browser,
      buildId,
    });
  }

  private parseBrowserName(browserName: BrowserName): Browser {
    switch (browserName) {
      case 'chrome':
        return Browser.CHROME;
      case 'firefox':
        return Browser.FIREFOX;
      default:
        throw new Error(`Unsupported browser: ${stringify(browserName)}`);
    }
  }
}
