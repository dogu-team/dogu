import { PromiseOrValue } from '@dogu-tech/common';
import { BrowserName, BrowserPlatform, Serial } from '@dogu-tech/types';
import { IsIn, IsOptional, IsString } from 'class-validator';

export interface BrowserOptions {
  browserName: BrowserName;
  browserPlatform: BrowserPlatform;
  deviceSerial: Serial;
  requestedBrowserVersion: string;
  resolvedBrowserVersion: string;
  resolvedMajorBrowserVersion: number;
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

export type InstalledBrowserFinderOptions = Pick<BrowserOptions, 'browserName' | 'browserPlatform'> &
  Partial<Pick<BrowserOptions, 'resolvedBrowserVersion' | 'resolvedMajorBrowserVersion' | 'deviceSerial'>>;
export class InstalledBrowserInfo implements Pick<BrowserInfo, 'browserName'>, Partial<Pick<BrowserInfo, 'browserPath' | 'browserPackageName' | 'browserVersion' | 'driverPath'>> {
  @IsIn(BrowserName)
  browserName!: BrowserName;

  @IsString()
  @IsOptional()
  browserPath?: string;

  @IsString()
  @IsOptional()
  browserPackageName?: string;

  @IsString()
  @IsOptional()
  browserVersion?: string;

  @IsString()
  @IsOptional()
  driverPath?: string;
}

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

export type FindAllInstalledBrowserInfosOptions = Pick<InstalledBrowserFinderOptions, 'browserPlatform' | 'deviceSerial'>;
export type FindAllInstalledBrowserInfosResult = InstalledBrowserInfo[];
