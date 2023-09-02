import { BrowserName, BrowserPlatform, Serial } from '@dogu-tech/types';
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
export type EnsureBrowserAndDriverResult = Pick<BrowserInfo, 'browserName' | 'browserPlatform' | 'browserDriverVersion' | 'browserDriverPath'> &
  Partial<Pick<BrowserInfo, 'browserVersion' | 'browserMajorVersion' | 'browserPath' | 'browserPackageName'>>;

export type FindAllBrowserInstallationsOptions = Readonly<Pick<BrowserInfo, 'browserName' | 'browserPlatform'> & Partial<Pick<BrowserInfo, 'deviceSerial'>>>;
export class BrowserInstallation
  implements Pick<BrowserInfo, 'browserName' | 'browserPlatform'>, Partial<Pick<BrowserInfo, 'browserVersion' | 'browserMajorVersion' | 'browserPath' | 'browserPackageName'>>
{
  @IsIn(BrowserName)
  browserName!: BrowserName;

  @IsIn(BrowserPlatform)
  browserPlatform!: BrowserPlatform;

  @IsString()
  @IsOptional()
  browserVersion?: string;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  browserMajorVersion?: number;

  @IsString()
  @IsOptional()
  browserPath?: string;

  @IsString()
  @IsOptional()
  browserPackageName?: string;
}
export type FindAllBrowserInstallationsResult = BrowserInstallation[];
