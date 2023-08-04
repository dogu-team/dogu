import { BrowserName, BrowserOrDriverName } from '@dogu-private/types';
import { stringify } from '@dogu-tech/common';
import { HostPaths } from '@dogu-tech/node';
import { Browser, computeExecutablePath, detectBrowserPlatform, getInstalledBrowsers, install } from '@puppeteer/browsers';
import AsyncLock from 'async-lock';
import fs from 'fs';
import {
  ChromeVersionLike,
  compareChromeVersionLike,
  downloadKnownGoodChromeVersionLikes,
  downloadLastKnownGoodChromeVersionLike,
  findChromeVersionLike,
  parseChromeVersionLike,
} from './chrome-version-utils';

const BrowsersPathLock = new AsyncLock();

function resolveBrowserOrDriverName(browserOrDriverName: BrowserOrDriverName): Browser {
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

export interface BrowserInstallOptions {
  name: BrowserOrDriverName;
  version: string;
  downloadProgressCallback?: (downloadedBytes: number, totalBytes: number) => void;
}

export class BrowserInstaller {
  async install(options: BrowserInstallOptions): Promise<void> {
    const { name, version, downloadProgressCallback } = options;
    const platform = detectBrowserPlatform();
    if (!platform) {
      throw new Error('Unsupported platform');
    }
    const browser = resolveBrowserOrDriverName(name);
    const browsersPath = HostPaths.external.browser.browsersPath();
    await this.lockBrowsersPath(async () => {
      await fs.promises.mkdir(browsersPath, { recursive: true });
      await install({
        cacheDir: browsersPath,
        browser,
        buildId: version,
        platform,
        downloadProgressCallback,
      });
    });
  }

  async isInstalled(name: BrowserOrDriverName, version: string): Promise<boolean> {
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
    const browser = resolveBrowserOrDriverName(name);
    return installedBrowsers.some((installedBrowser) => installedBrowser.browser === browser && installedBrowser.buildId === version);
  }

  async lockBrowsersPath<T>(callback: () => Promise<T>): Promise<T> {
    const browsersPath = HostPaths.external.browser.browsersPath();
    return BrowsersPathLock.acquire(browsersPath, callback);
  }

  getBrowserOrDriverPath(name: BrowserOrDriverName, version: string): string {
    const platform = detectBrowserPlatform();
    if (!platform) {
      throw new Error('Unsupported platform');
    }
    const browser = resolveBrowserOrDriverName(name);
    const browsersPath = HostPaths.external.browser.browsersPath();
    return computeExecutablePath({
      cacheDir: browsersPath,
      platform,
      browser,
      buildId: version,
    });
  }

  async resolveLatestVersion(browserName: BrowserName, version?: string): Promise<string> {
    const resolved = version || 'latest';
    if (resolved === 'latest') {
      if (browserName === 'chrome') {
        const versionLike = await downloadLastKnownGoodChromeVersionLike();
        return `${versionLike.major}`;
      }
    } else {
      return resolved;
    }

    throw new Error(`Unsupported browser: ${stringify(browserName)}`);
  }

  async findHighestInstalledVersion(browserOrDriverName: BrowserOrDriverName, browserOrDriverVersion: string): Promise<string | undefined> {
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
    const browser = resolveBrowserOrDriverName(browserOrDriverName);
    const matchedInstalledVersions = installedBrowsers.filter((installedBrowser) => installedBrowser.browser === browser).map((installedBrowser) => installedBrowser.buildId);
    return this.findHighestInstalledBrowserVersionInternal(browserOrDriverName, browserOrDriverVersion, matchedInstalledVersions);
  }

  private findHighestInstalledBrowserVersionInternal(name: BrowserOrDriverName, version: string, installedVersions: string[]): string | undefined {
    if (name === 'chrome' || name === 'chromedriver') {
      const installedChromeVersionLikes = installedVersions.map(parseChromeVersionLike).filter((version) => {
        return version.major !== undefined && version.minor !== undefined && version.build !== undefined && version.patch !== undefined;
      }) as Required<ChromeVersionLike>[];
      const sortedInstalledChromeVersionLikes = installedChromeVersionLikes.sort((lhs, rhs) => {
        return compareChromeVersionLike(lhs, rhs, 'desc');
      });
      const browserVersionLike = parseChromeVersionLike(version);
      const found = findChromeVersionLike(browserVersionLike, sortedInstalledChromeVersionLikes);
      if (found) {
        return `${found.major}.${found.minor}.${found.build}.${found.patch}`;
      } else {
        return undefined;
      }
    }

    throw new Error(`Unsupported browser or driver: ${stringify(name)}`);
  }

  async resolveToDownloadVersion(name: BrowserOrDriverName, version: string): Promise<string> {
    if (name === 'chrome' || name === 'chromedriver') {
      const knownGoodChromeVersionLikes = await downloadKnownGoodChromeVersionLikes();
      knownGoodChromeVersionLikes.sort((lhs, rhs) => {
        return compareChromeVersionLike(lhs, rhs, 'desc');
      });
      const browserVersionLike = parseChromeVersionLike(version);
      const foundVersion = findChromeVersionLike(browserVersionLike, knownGoodChromeVersionLikes);
      if (foundVersion) {
        return `${foundVersion.major}.${foundVersion.minor}.${foundVersion.build}.${foundVersion.patch}`;
      } else {
        throw new Error(`Cannot find known good version for ${stringify(browserVersionLike)}`);
      }
    }

    throw new Error(`Unsupported browser or driver: ${stringify(name)}`);
  }
}
