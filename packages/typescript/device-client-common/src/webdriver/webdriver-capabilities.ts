import { transformAndValidate } from '@dogu-tech/common';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class WebDriverCapabilities {
  constructor(private _platformName: string, private _app: string, private _doguOptions: DoguWebDriverOptions, private readonly _origin: object) {}
  get platformName(): string {
    return this._platformName;
  }
  get app(): string {
    return this._app;
  }
  get doguOptions(): DoguWebDriverOptions {
    return this._doguOptions;
  }

  get origin(): object {
    return this._origin;
  }

  static async create(origin: object): Promise<WebDriverCapabilities> {
    const alwaysMatchCaps = (origin as any)?.capabilities?.alwaysMatch;
    if (!alwaysMatchCaps) {
      throw new Error('alwaysMatch capabilities not found');
    }
    const platformName = alwaysMatchCaps?.platformName as string;
    if (!platformName) {
      throw new Error('platformName not found in capabilities');
    }
    const doguOptions = alwaysMatchCaps['dogu:options'] as DoguWebDriverOptions;
    if (!doguOptions) {
      throw new Error('dogu:options not found in capabilities');
    }
    const options = await transformAndValidate(DoguWebDriverOptions, doguOptions);
    return new WebDriverCapabilities(platformName, '', options, origin);
  }

  setDoguAppUrl(appUrl: string): void {
    this._doguOptions.appUrl = appUrl;
    // let doguOptions = (this._origin as any)['capabilities']['alwaysMatch']['dogu:options'];
    Reflect.set((this._origin as any)['capabilities']['alwaysMatch']['dogu:options'], 'appUrl', appUrl);
    // doguOptions.appUrl = appUrl;
  }

  setApp(appPath: string): void {
    this._app = appPath;
    Reflect.set((this._origin as any)['capabilities']['alwaysMatch'], 'app', appPath);
  }
}

export class DoguWebDriverOptions {
  @IsNotEmpty()
  @IsString()
  organizationId!: string;

  @IsNotEmpty()
  @IsString()
  projectId!: string;

  @IsNotEmpty()
  @IsString()
  userName!: string;

  @IsNotEmpty()
  @IsString()
  accessKey!: string;

  @IsNotEmpty()
  @IsString()
  tag!: string;

  @IsOptional()
  @IsString()
  appVersion?: string;

  @IsOptional()
  @IsString()
  appUrl?: string; // added from console-web-server
}
