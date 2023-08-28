import { BrowserName, BrowserPlatform, Serial } from '@dogu-private/types';
import { PromiseOrValue } from '@dogu-tech/common';

export interface BrowserOptions {
  browserName: BrowserName;
  browserPlatform: BrowserPlatform;
  deviceSerial: Serial;
  requestedBrowserVersion: string;
  resolvedBrowserVersion: string;
  resolvedBrowserVersionMajor: number;
}

export interface BrowserInfo {
  browserName: BrowserName;
  browserVersion: string;
  browserPath: string;
  browserPackageName: string;
  driverPath: string;
}

export type LatestBrowserVersionResolverOptions = Readonly<Pick<BrowserOptions, 'browserName' | 'browserPlatform'>>;
export type ResolvedBrowserVersionInfo = Pick<BrowserInfo, 'browserVersion'>;

export interface LatestBrowserVersionResolver {
  match(options: LatestBrowserVersionResolverOptions): PromiseOrValue<boolean>;
  resolve(options: LatestBrowserVersionResolverOptions): PromiseOrValue<ResolvedBrowserVersionInfo>;
}

export type InstalledBrowserFinderOptions = Pick<BrowserOptions, 'browserName' | 'browserPlatform' | 'resolvedBrowserVersion' | 'resolvedBrowserVersionMajor'> &
  Partial<Pick<BrowserOptions, 'deviceSerial'>>;
export type InstalledBrowserInfo = Pick<BrowserInfo, 'browserName'> & Partial<Pick<BrowserInfo, 'browserPath' | 'browserPackageName' | 'browserVersion' | 'driverPath'>>;

export interface InstalledBrowserFinder {
  match(options: InstalledBrowserFinderOptions): PromiseOrValue<boolean>;
  find(options: InstalledBrowserFinderOptions): PromiseOrValue<InstalledBrowserInfo[]>;
}

export type DriverInstallerOptions = Pick<BrowserOptions, 'browserName' | 'browserPlatform' | 'resolvedBrowserVersion'>;
export type InstalledDriverInfo = Pick<BrowserInfo, 'driverPath'>;

export interface DriverInstaller {
  match(options: DriverInstallerOptions): PromiseOrValue<boolean>;
  install(options: DriverInstallerOptions): PromiseOrValue<InstalledDriverInfo>;
}

export type BrowserAutoInstallableCheckerOptions = Pick<BrowserOptions, 'browserName' | 'browserPlatform'>;

export interface BrowserAutoInstallableChecker {
  match(options: BrowserAutoInstallableCheckerOptions): PromiseOrValue<boolean>;
  check(options: BrowserAutoInstallableCheckerOptions): PromiseOrValue<boolean>;
}

export type BrowserInstallerOptions = Pick<BrowserOptions, 'browserName' | 'browserPlatform' | 'resolvedBrowserVersion'>;

export interface BrowserInstaller {
  match(options: BrowserInstallerOptions): PromiseOrValue<boolean>;
  install(options: BrowserInstallerOptions): PromiseOrValue<InstalledBrowserInfo>;
}

export type EnsureBrowserAndDriverOptions = Pick<BrowserOptions, 'browserName' | 'browserPlatform'> & Partial<Pick<BrowserOptions, 'requestedBrowserVersion' | 'deviceSerial'>>;
export type EnsuredBrowserAndDriverInfo = InstalledBrowserInfo & InstalledDriverInfo;
