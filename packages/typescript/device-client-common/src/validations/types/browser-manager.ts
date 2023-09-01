import { BrowserName, BrowserPlatform, Serial } from '@dogu-tech/types';

export interface BrowserInfo {
  browserName: BrowserName;
  browserPlatform: BrowserPlatform;
  browserVersion: string;
  browserMajorVersion: number;
  browserPath: string;
  browserPackageName: string;
  browserDriverVersion: string;
  browserDriverPath: string;
  browserInstallable: boolean;
  deviceSerial: Serial;
}

export type EnsureBrowserAndDriverOptions = Readonly<Pick<BrowserInfo, 'browserName' | 'browserPlatform'> & Partial<Pick<BrowserInfo, 'browserVersion' | 'deviceSerial'>>>;
export type EnsureBrowserAndDriverResult = Pick<
  BrowserInfo,
  'browserName' | 'browserPlatform' | 'browserVersion' | 'browserMajorVersion' | 'browserDriverVersion' | 'browserDriverPath' | 'browserInstallable'
> &
  Partial<Pick<BrowserInfo, 'deviceSerial' | 'browserPath' | 'browserPackageName'>>;

export type FindAllBrowserInstallationsOptions = Readonly<Pick<BrowserInfo, 'browserName' | 'browserPlatform'> & Partial<Pick<BrowserInfo, 'deviceSerial'>>>;
export type FindAllBrowserInstallationsResult = Pick<BrowserInfo, 'browserName' | 'browserPlatform'> &
  Partial<Pick<BrowserInfo, 'deviceSerial' | 'browserPath' | 'browserPackageName' | 'browserDriverPath'>>[];
