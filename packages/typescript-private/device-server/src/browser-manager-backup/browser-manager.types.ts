import { BrowserName, BrowserPlatform } from '@dogu-private/types';
import { PromiseOrValue } from '@dogu-tech/common';
import { BrowserInfo, EnsureBrowserAndDriverOptions, FindAllBrowserInstallationsOptions, FindAllBrowserInstallationsResult } from '@dogu-tech/device-client-common';
import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';

export type LatestBrowserVersionResolverOptions = Readonly<Omit<EnsureBrowserAndDriverOptions, 'browserVersion'> & Pick<BrowserInfo, 'browserVersion'>>;
export type LatestBrowserVersionResolverResult = LatestBrowserVersionResolverOptions;

export interface LatestBrowserVersionResolver {
  match(options: LatestBrowserVersionResolverOptions): PromiseOrValue<boolean>;
  resolve(options: LatestBrowserVersionResolverOptions): PromiseOrValue<LatestBrowserVersionResolverResult>;
}

export type BrowserInstallationFinderOptions = Readonly<LatestBrowserVersionResolverResult & Pick<BrowserInfo, 'browserMajorVersion'>>;
export class BrowserInstallation implements BrowserInstallationFinderOptions, Partial<Pick<BrowserInfo, 'browserPath' | 'browserPackageName' | 'browserDriverPath'>> {
  @IsIn(BrowserName)
  browserName!: BrowserName;

  @IsIn(BrowserPlatform)
  browserPlatform!: BrowserPlatform;

  @IsString()
  browserVersion!: string;

  @IsNumber()
  browserMajorVersion!: number;

  @IsString()
  @IsOptional()
  deviceSerial?: string;

  @IsString()
  @IsOptional()
  browserPath?: string;

  @IsString()
  @IsOptional()
  browserPackageName?: string;

  @IsString()
  @IsOptional()
  browserDriverPath?: string;
}
export type BrowserInstallationFinderResult = BrowserInstallation;

export interface BrowserInstallationFinder {
  match(options: BrowserInstallationFinderOptions): PromiseOrValue<boolean>;
  find(options: BrowserInstallationFinderOptions): PromiseOrValue<BrowserInstallationFinderResult>;
}

export type BrowserAllInstallationsFinderOptions = FindAllBrowserInstallationsOptions;
export type BrowserAllInstallationsFinderResult = FindAllBrowserInstallationsResult;

export interface BrowserAllInstallationsFinder {
  match(options: BrowserAllInstallationsFinderOptions): PromiseOrValue<boolean>;
  findAll(options: BrowserAllInstallationsFinderOptions): PromiseOrValue<BrowserAllInstallationsFinderResult>;
}

export type BrowserInstallableCheckerOptions = Readonly<BrowserInstallationFinderResult>;
export type BrowserInstallableCheckerResult = BrowserInstallableCheckerOptions & Pick<BrowserInfo, 'browserInstallable'>;

export interface BrowserInstallableChecker {
  match(options: BrowserInstallableCheckerOptions): PromiseOrValue<boolean>;
  check(options: BrowserInstallableCheckerOptions): PromiseOrValue<BrowserInstallableCheckerResult>;
}

export type BrowserInstallerOptions = Readonly<BrowserInstallableCheckerResult>;
export type BrowserInstallerResult = BrowserInstallerOptions;

export interface BrowserInstaller {
  match(options: BrowserInstallerOptions): PromiseOrValue<boolean>;
  install(options: BrowserInstallerOptions): PromiseOrValue<BrowserInstallerResult>;
}

export type BrowserDriverInstallerOptions = BrowserInstallerResult;
export type BrowserDriverInstallerResult = Omit<BrowserDriverInstallerOptions, 'browserDriverPath'> & Pick<BrowserInfo, 'browserDriverPath'>;

export interface BrowserDriverInstaller {
  match(options: BrowserDriverInstallerOptions): PromiseOrValue<boolean>;
  install(options: BrowserDriverInstallerOptions): PromiseOrValue<BrowserDriverInstallerResult>;
}

export interface BrowserVersionProvider<T> {
  latest(): PromiseOrValue<T>;
}
