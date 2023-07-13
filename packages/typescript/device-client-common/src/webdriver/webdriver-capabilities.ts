import { IsFilledString, transformAndValidate } from '@dogu-tech/common';
import { Platform, Serial } from '@dogu-tech/types';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, Validate, ValidateNested } from 'class-validator';
import _ from 'lodash';

export class WebDriverCapabilities {
  constructor(private _platformName: string, private _app: string, private _udid: string, private _doguOptions: DoguWebDriverOptions, private readonly _origin: object) {}

  get platformName(): string {
    return this._platformName;
  }

  get app(): string {
    return this._app;
  }

  get udid(): string {
    return this._udid;
  }

  get doguOptions(): DoguWebDriverOptions {
    return this._doguOptions;
  }

  get origin(): object {
    return this._origin;
  }

  static async create(origin: object): Promise<WebDriverCapabilities> {
    const platformName = _.get(origin, 'capabilities.alwaysMatch.platformName') as string | undefined;
    if (!platformName) {
      throw new Error('platformName not found in capabilities');
    }
    const doguOptions = _.get(origin, 'capabilities.alwaysMatch.dogu:options') as DoguWebDriverOptions | undefined;
    if (!doguOptions) {
      throw new Error('dogu:options not found in capabilities');
    }
    const options = await transformAndValidate(DoguWebDriverOptions, doguOptions);
    return new WebDriverCapabilities(platformName, '', '', options, origin);
  }

  setDoguAppUrl(appUrl: string): void {
    this._doguOptions.internal.appUrl = appUrl;
    _.set(this._origin, 'capabilities.alwaysMatch.dogu:options.internal.appUrl', appUrl);
  }

  setApp(appPath: string): void {
    this._app = appPath;
    _.set(this._origin, 'capabilities.alwaysMatch.appium:app', appPath);
  }

  setUdid(serial: Serial): void {
    this._udid = serial;
    _.set(this._origin, 'capabilities.alwaysMatch.appium:udid', serial);
  }
}

export class DoguWebDriverOptionsInternal {
  @IsEnum(Platform)
  platform!: Platform;

  @IsFilledString()
  serial!: Serial;

  @IsFilledString()
  remoteDeviceJobId!: string;

  @IsString()
  @IsOptional()
  appUrl?: string;
}

export class DoguWebDriverOptions {
  @IsFilledString()
  organizationId!: string;

  @IsFilledString()
  projectId!: string;

  @IsFilledString()
  accessKey!: string;

  @Validate((value: unknown) => {
    if (typeof value === 'string') {
      return true;
    } else if (Array.isArray(value)) {
      return value.every((v) => typeof v === 'string');
    }
    return false;
  })
  'runs-on'!: string | string[];

  @IsString()
  @IsOptional()
  appVersion?: string;

  /**
   * @default undefined
   */
  @IsString()
  @IsOptional()
  browserName?: string;

  /**
   * @default 'latest'
   */
  @IsString()
  @IsOptional()
  browserVersion?: string;

  /**
   * @note this is added from console-web-server
   */
  @ValidateNested()
  @Type(() => DoguWebDriverOptionsInternal)
  internal!: DoguWebDriverOptionsInternal;
}
