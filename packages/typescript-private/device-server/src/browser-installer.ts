import { BrowserOrDriverName } from '@dogu-private/types';
import { stringify } from '@dogu-tech/common';
import { HostPaths } from '@dogu-tech/node';
import { Browser, computeExecutablePath, detectBrowserPlatform, getInstalledBrowsers, install, resolveBuildId } from '@puppeteer/browsers';
import AsyncLock from 'async-lock';
import fs from 'fs';

const BrowsersPathLock = new AsyncLock();

export interface BrowserInstallOptions {
  browserOrDriverName: BrowserOrDriverName;
  browserOrDriverVersion: string;
  downloadProgressCallback?: (downloadedBytes: number, totalBytes: number) => void;
}

export class BrowserInstaller {
  async install(options: BrowserInstallOptions): Promise<void> {
    const { browserOrDriverName, browserOrDriverVersion, downloadProgressCallback } = options;
    const platform = detectBrowserPlatform();
    if (!platform) {
      throw new Error('Unsupported platform');
    }
    const browser = this.parseBrowserOrDriverName(browserOrDriverName);
    const buildId = await resolveBuildId(browser, platform, browserOrDriverVersion);
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

  isSupported(browserOrDriverName: BrowserOrDriverName): boolean {
    try {
      this.parseBrowserOrDriverName(browserOrDriverName);
      return true;
    } catch (e) {
      return false;
    }
  }

  async isInstalled(browserOrDriverName: BrowserOrDriverName, browserOrDriverVersion: string): Promise<boolean> {
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
    const browser = this.parseBrowserOrDriverName(browserOrDriverName);
    const buildId = await resolveBuildId(browser, platform, browserOrDriverVersion);
    return installedBrowsers.some((installedBrowser) => installedBrowser.browser === browser && installedBrowser.buildId === buildId);
  }

  async resolveVersion(browserOrDriverName: BrowserOrDriverName, browserOrDriverVersion: string): Promise<string> {
    const platform = detectBrowserPlatform();
    if (!platform) {
      throw new Error('Unsupported platform');
    }
    const browser = this.parseBrowserOrDriverName(browserOrDriverName);
    return resolveBuildId(browser, platform, browserOrDriverVersion);
  }

  async lockBrowsersPath<T>(callback: () => Promise<T>): Promise<T> {
    const browsersPath = HostPaths.external.browser.browsersPath();
    return BrowsersPathLock.acquire(browsersPath, callback);
  }

  async getBrowserOrDriverPath(browserOrDriverName: BrowserOrDriverName, browserOrDriverVersion: string): Promise<string> {
    const platform = detectBrowserPlatform();
    if (!platform) {
      throw new Error('Unsupported platform');
    }
    const browser = this.parseBrowserOrDriverName(browserOrDriverName);
    const buildId = await resolveBuildId(browser, platform, browserOrDriverVersion);
    const browsersPath = HostPaths.external.browser.browsersPath();
    return computeExecutablePath({
      cacheDir: browsersPath,
      platform,
      browser,
      buildId,
    });
  }

  private parseBrowserOrDriverName(browserOrDriverName: BrowserOrDriverName): Browser {
    switch (browserOrDriverName) {
      case 'chrome':
        return Browser.CHROME;
      case 'chromium':
        return Browser.CHROMIUM;
      case 'firefox':
        return Browser.FIREFOX;
      case 'chromedriver':
        return Browser.CHROMEDRIVER;
      default:
        throw new Error(`Unsupported browser or driver: ${stringify(browserOrDriverName)}`);
    }
  }
}
