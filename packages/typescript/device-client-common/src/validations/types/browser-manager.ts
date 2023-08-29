import { PromiseOrValue } from '@dogu-tech/common';
import { BrowserName, BrowserPlatform, Serial } from '@dogu-tech/types';
import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';

export interface BrowserOptions {
  browserName: BrowserName;
  browserPlatform: BrowserPlatform;
  deviceSerial: Serial;
  requestedBrowserVersion: string;
  resolvedBrowserVersion: string;
  resolvedBrowserMajorVersion: number;
}

export interface BrowserInfo {
  browserName: BrowserName;
  browserVersion: string;
  browserMajorVersion: number;
  browserPath: string;
  browserPackageName: string;
  browserDriverPath: string;
}

export type LatestBrowserVersionResolverOptions = Readonly<Pick<BrowserOptions, 'browserName' | 'browserPlatform'>>;
export type ResolvedBrowserVersionInfo = Pick<BrowserInfo, 'browserVersion'>;

export interface LatestBrowserVersionResolver {
  match(options: LatestBrowserVersionResolverOptions): PromiseOrValue<boolean>;
  resolve(options: LatestBrowserVersionResolverOptions): PromiseOrValue<ResolvedBrowserVersionInfo>;
}

export type BrowserInstallationFinderOptions = Pick<BrowserOptions, 'browserName' | 'browserPlatform'> &
  Partial<Pick<BrowserOptions, 'resolvedBrowserVersion' | 'resolvedBrowserMajorVersion' | 'deviceSerial'>>;
export class BrowserInstallation
  implements Pick<BrowserInfo, 'browserName'>, Partial<Pick<BrowserInfo, 'browserPath' | 'browserPackageName' | 'browserVersion' | 'browserMajorVersion' | 'browserDriverPath'>>
{
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

  @IsNumber()
  @IsOptional()
  browserMajorVersion?: number;

  @IsString()
  @IsOptional()
  browserDriverPath?: string;
}

export interface BrowserInstallationFinder {
  match(options: BrowserInstallationFinderOptions): PromiseOrValue<boolean>;
  find(options: BrowserInstallationFinderOptions): PromiseOrValue<BrowserInstallation[]>;
}

export type BrowserDriverInstallerOptions = Pick<BrowserOptions, 'browserName' | 'browserPlatform' | 'resolvedBrowserVersion'>;
export type BrowserDriverInstallation = Pick<BrowserInfo, 'browserDriverPath'>;

export interface BrowserDriverInstaller {
  match(options: BrowserDriverInstallerOptions): PromiseOrValue<boolean>;
  install(options: BrowserDriverInstallerOptions): PromiseOrValue<BrowserDriverInstallation>;
}

export type BrowserAutoInstallableCheckerOptions = Pick<BrowserOptions, 'browserName' | 'browserPlatform'>;

export interface BrowserAutoInstallableChecker {
  match(options: BrowserAutoInstallableCheckerOptions): PromiseOrValue<boolean>;
  check(options: BrowserAutoInstallableCheckerOptions): PromiseOrValue<boolean>;
}

export type BrowserInstallerOptions = Pick<BrowserOptions, 'browserName' | 'browserPlatform' | 'resolvedBrowserVersion'>;

export interface BrowserInstaller {
  match(options: BrowserInstallerOptions): PromiseOrValue<boolean>;
  install(options: BrowserInstallerOptions): PromiseOrValue<BrowserInstallation>;
}

export type EnsureBrowserAndDriverOptions = Pick<BrowserOptions, 'browserName' | 'browserPlatform'> & Partial<Pick<BrowserOptions, 'requestedBrowserVersion' | 'deviceSerial'>>;
export type BrowserAndDriverInstallation = BrowserInstallation & BrowserDriverInstallation;

export type FindAllBrowserInstallationsOptions = Pick<BrowserInstallationFinderOptions, 'browserPlatform' | 'deviceSerial'>;
export type FindAllBrowserInstallationsResult = BrowserInstallation[];
