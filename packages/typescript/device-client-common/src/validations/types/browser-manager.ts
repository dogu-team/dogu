import { BrowserName, BrowserPlatform, BrowserVersion, Serial } from '@dogu-tech/types';
import { Type } from 'class-transformer';
import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';

export interface BrowserInfo {
  browserName: BrowserName;
  browserPlatform: BrowserPlatform;
  browserVersion: string;
  browserMajorVersion: number;
  browserPath: string;
  browserPackageName: string;
  browserDriverVersion: string;
  browserDriverPath: string;
  deviceSerial: Serial;
}

export type EnsureBrowserAndDriverOptions = Readonly<Pick<BrowserInfo, 'browserName' | 'browserPlatform'> & Partial<Pick<BrowserInfo, 'browserVersion' | 'deviceSerial'>>>;
export type EnsureBrowserAndDriverResult = Readonly<
  Pick<BrowserInfo, 'browserName' | 'browserPlatform' | 'browserVersion' | 'browserMajorVersion' | 'browserDriverVersion' | 'browserDriverPath'> &
    Partial<Pick<BrowserInfo, 'browserPath' | 'browserPackageName'>>
>;

export type FindBrowserInstallationsOptions = Readonly<Pick<BrowserInfo, 'browserName' | 'browserPlatform'> & Partial<Pick<BrowserInfo, 'deviceSerial'>>>;
export class BrowserInstallation
  implements
    Readonly<Pick<BrowserInfo, 'browserName' | 'browserPlatform'>>,
    Readonly<Partial<Pick<BrowserInfo, 'browserVersion' | 'browserMajorVersion' | 'browserPath' | 'browserPackageName'>>>
{
  @IsIn(BrowserName)
  browserName!: BrowserName;

  @IsIn(BrowserPlatform)
  browserPlatform!: BrowserPlatform;

  @IsString()
  browserVersion!: BrowserVersion;

  @IsNumber()
  @Type(() => Number)
  browserMajorVersion!: number;

  @IsString()
  @IsOptional()
  browserPath?: string;

  @IsString()
  @IsOptional()
  browserPackageName?: string;
}
export interface FindBrowserInstallationsResult {
  browserInstallations: Readonly<BrowserInstallation>[];
}

export type FindAllBrowserInstallationsOptions = Readonly<Omit<FindBrowserInstallationsOptions, 'browserName'>>;
export type FindAllbrowserInstallationsResult = Readonly<FindBrowserInstallationsResult>;
