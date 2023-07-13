import { IsFilledString, transformAndValidate } from '@dogu-tech/common';
import { Serial } from '@dogu-tech/types';
import { IsOptional, IsString, Validate } from 'class-validator';
import _ from 'lodash';

export interface WebDriverCapabilitiesOrigin {
  capabilities?: {
    alwaysMatch?: {
      platformName?: string;
      'dogu:options'?: DoguWebDriverOptions;
    };
  };
}

export class WebDriverCapabilities {
  constructor(
    private _platformName: string,
    private _app: string,
    private _udid: string,
    private _doguOptions: DoguWebDriverOptions,
    private readonly _origin: WebDriverCapabilitiesOrigin,
  ) {}

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

  get origin(): WebDriverCapabilitiesOrigin {
    return this._origin;
  }

  static async create(origin: WebDriverCapabilitiesOrigin): Promise<WebDriverCapabilities> {
    const platformName = origin.capabilities?.alwaysMatch?.platformName;
    if (!platformName) {
      throw new Error('platformName not found in capabilities');
    }
    const doguOptions = origin.capabilities?.alwaysMatch?.['dogu:options'];
    if (!doguOptions) {
      throw new Error('dogu:options not found in capabilities');
    }
    const options = await transformAndValidate(DoguWebDriverOptions, doguOptions);
    return new WebDriverCapabilities(platformName, '', '', options, origin);
  }

  setDoguAppUrl(appUrl: string): void {
    this._doguOptions.appUrl = appUrl;
    _.set(this._origin, 'capabilities.alwaysMatch.dogu:options.appUrl', appUrl);
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
  @IsString()
  @IsOptional()
  appUrl?: string;
}
