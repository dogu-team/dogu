import { BrowserName, BrowserPlatform } from '@dogu-private/types';
import { PromiseOrValue } from '@dogu-tech/common';

export interface BrowserOptions {
  browserName: BrowserName;
  browserPlatform: BrowserPlatform;
  requestedBrowserVersion: string;
  resolvedBrowserVersion: string;
  resolvedBrowserVersionMajor: number;
}

export type LatestBrowserVersionResolverOptions = Readonly<Pick<BrowserOptions, 'browserName' | 'browserPlatform'>>;
export type InstalledBrowserFinderOptions = Pick<BrowserOptions, 'browserName' | 'browserPlatform' | 'resolvedBrowserVersion' | 'resolvedBrowserVersionMajor'>;
export type DriverInstallerOptions = Pick<BrowserOptions, 'browserName' | 'browserPlatform' | 'resolvedBrowserVersion'>;
export type BrowserInstallerOptions = Pick<BrowserOptions, 'browserName' | 'browserPlatform' | 'resolvedBrowserVersion'>;
export type EnsureBrowserAndDriverOptions = Pick<BrowserOptions, 'browserName' | 'browserPlatform'> & Partial<Pick<BrowserOptions, 'requestedBrowserVersion'>>;

export interface BrowserInfo {
  browserName: BrowserName;
  browserVersion: string;
  browserPath: string;
  driverPath: string;
}

export type ResolvedBrowserVersionInfo = Pick<BrowserInfo, 'browserVersion'>;
export type InstalledBrowserInfo = Pick<BrowserInfo, 'browserPath'> & Partial<Pick<BrowserInfo, 'driverPath'>>;
export type InstalledDriverInfo = Pick<BrowserInfo, 'driverPath'>;
export type EnsuredBrowserAndDriverInfo = InstalledBrowserInfo & InstalledDriverInfo;

export interface LatestBrowserVersionResolver {
  match(options: LatestBrowserVersionResolverOptions): PromiseOrValue<boolean>;
  resolve(options: LatestBrowserVersionResolverOptions): PromiseOrValue<ResolvedBrowserVersionInfo>;
}

export interface InstalledBrowserFinder {
  match(options: InstalledBrowserFinderOptions): PromiseOrValue<boolean>;
  find(options: InstalledBrowserFinderOptions): PromiseOrValue<InstalledBrowserInfo[]>;
}

export interface DriverInstaller {
  match(options: DriverInstallerOptions): PromiseOrValue<boolean>;
  install(options: DriverInstallerOptions): PromiseOrValue<InstalledDriverInfo>;
}

export interface BrowserInstaller {
  match(options: BrowserInstallerOptions): PromiseOrValue<boolean>;
  install(options: BrowserInstallerOptions): PromiseOrValue<InstalledBrowserInfo>;
}
