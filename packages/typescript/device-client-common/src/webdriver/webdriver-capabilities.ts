import { IsFilledString, PromiseOrValue, transformAndValidate } from '@dogu-tech/common';
import { IsOptional, IsString, Validate } from 'class-validator';
import _ from 'lodash';

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
    } else {
      return false;
    }
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
}

export type WebDriverCapabilities = object;

const DoguWebDriverOptionsPath = 'capabilities.alwaysMatch.dogu:options';

export interface ThrowableWebDriverCapabilitiesParser {
  parse(capabilities: WebDriverCapabilities): PromiseOrValue<WebDriverCapabilities>;
}

export class DoguWebDriverCapabilitiesParser implements ThrowableWebDriverCapabilitiesParser {
  doguOptions: DoguWebDriverOptions | null = null;

  async parse(capabilities: WebDriverCapabilities): Promise<WebDriverCapabilities> {
    const doguOptionsRaw = _.get(capabilities, DoguWebDriverOptionsPath) as unknown;
    if (!doguOptionsRaw) {
      throw new Error('dogu:options not found in capabilities');
    }
    _.unset(capabilities, DoguWebDriverOptionsPath);
    this.doguOptions = await transformAndValidate(DoguWebDriverOptions, doguOptionsRaw);
    return capabilities;
  }
}

export class NullWebDriverCapabilitiesParser implements ThrowableWebDriverCapabilitiesParser {
  parse(capabilities: WebDriverCapabilities): WebDriverCapabilities {
    return capabilities;
  }
}
