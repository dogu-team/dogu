import { errorify, fillOptionsSync, IsFilledString, LogLevel, transformBooleanString } from '@dogu-tech/common';
import { FromProcessEnv } from '@dogu-tech/node';
import { PlatformType, StepContextEnv } from '@dogu-tech/types';
import { IsBoolean, IsIn, IsNumber, IsString } from 'class-validator';
import { DefaultGamiumEnginePort } from 'gamium';
import { logger } from './internal/logger-instance';

import('webdriverio').catch((error) => {
  logger.error('Failed to import webdriverio', { error: errorify(error) });
  process.exit(1);
});

type DoguEnvDependencies = Pick<
  StepContextEnv,
  | 'DOGU_DEVICE_SERIAL' //
  | 'DOGU_DEVICE_PLATFORM'
  | 'DOGU_DEVICE_SERVER_PORT'
  | 'DOGU_LOG_LEVEL'
>;

type DoguEnv = DoguEnvDependencies & {
  DOGU_APP_PATH: string;
  DOGU_UNINSTALL_APP: string;
};

export class DoguOptions {
  /**
   * @default ''
   * @requires process.env.DOGU_DEVICE_SERIAL
   * @description Device serial. The unique value of the device.
   * If the value is empty, the first device on the devicePlatform is used.
   * ```
   * | platform | value         |
   * | android  | serial number |
   * | ios      | udid          |
   * | macos    | uuid          |
   * | windows  | uuid          |
   * ```
   */
  @IsFilledString()
  @FromProcessEnv<DoguEnv>('DOGU_DEVICE_SERIAL')
  deviceSerial?: string;

  /**
   * @default unspecified
   * @requires process.env.DOGU_DEVICE_PLATFORM
   * @description Device platform. Available values are `unspecified`, `android`, `ios`, `macos`, `windows`.
   */
  @IsIn(PlatformType)
  @FromProcessEnv<DoguEnv>('DOGU_DEVICE_PLATFORM')
  devicePlatform?: PlatformType;

  /**
   * @default 5001
   * @requires process.env.DOGU_DEVICE_SERVER_PORT
   * @description Device server port.
   * The port number of the device server to be used.
   */
  @IsNumber()
  @FromProcessEnv<DoguEnv>('DOGU_DEVICE_SERVER_PORT', { transform: Number })
  deviceServerPort?: number;

  /**
   * @default info
   * @requires process.env.DOGU_LOG_LEVEL
   * @description Log level.
   * Available values are `error`, `warn`, `info`, `debug`, `verbose`.
   */
  @IsIn(LogLevel)
  @FromProcessEnv<DoguEnv>('DOGU_LOG_LEVEL')
  logLevel?: LogLevel;

  /**
   * @default ''
   * @requires process.env.DOGU_APP_PATH
   * @description App path. The path of the app to be installed and run.
   * If the value is empty, the app is not installed and run.
   */
  @IsString()
  @FromProcessEnv<DoguEnv>('DOGU_APP_PATH')
  appPath?: string;

  /**
   * @default false
   * @requires process.env.DOGU_UNINSTALL_APP
   * @description Uninstall app before install.
   */
  @IsBoolean()
  @FromProcessEnv<DoguEnv>('DOGU_UNINSTALL_APP', { transform: transformBooleanString })
  uninstallApp?: boolean;

  /**
   * @default 30000
   */
  @IsNumber()
  requestTimeout?: number;
}

export function fillDoguOptions(options?: DoguOptions): Required<DoguOptions> {
  return fillOptionsSync(
    DoguOptions,
    {
      deviceSerial: '',
      devicePlatform: 'unspecified',
      deviceServerPort: 5001,
      logLevel: 'info',
      appPath: '',
      uninstallApp: false,
      requestTimeout: 30000,
    },
    options,
  );
}

type GamiumEnv = {
  GAMIUM_ENGINE_PORT: string;
  GAMIUM_QUIT_APP: string;
};

export class GamiumOptions {
  /**
   * @default 50061
   * @requires process.env.GAMIUM_ENGINE_PORT
   * @description Gamium engine port.
   */
  @IsNumber()
  @FromProcessEnv<GamiumEnv>('GAMIUM_ENGINE_PORT', { transform: Number })
  enginePort?: number;

  /**
   * @default false
   * @requires process.env.GAMIUM_QUIT_APP
   * @description Try to quit before Gamium app.
   */
  @IsBoolean()
  @FromProcessEnv<GamiumEnv>('GAMIUM_QUIT_APP', { transform: transformBooleanString })
  quitApp?: boolean;

  /**
   * @default 3
   * @description Retry count.
   */
  @IsNumber()
  retryCount?: number;

  /**
   * @default 1000
   * @unit milliseconds
   * @description Retry interval.
   */
  @IsNumber()
  retryInterval?: number;
}

export function fillGamiumOptions(options?: GamiumOptions): Required<GamiumOptions> {
  return fillOptionsSync(
    GamiumOptions,
    {
      enginePort: DefaultGamiumEnginePort,
      quitApp: false,
      retryCount: 3,
      retryInterval: 1000,
    },
    options,
  );
}

export interface ToolkitOptions {
  dogu?: DoguOptions;
  gamium?: boolean | GamiumOptions;
  appium?: boolean;
}

export interface FilledToolkitOptions {
  dogu: Required<DoguOptions>;
  gamium: Required<GamiumOptions> | null;
  appium: boolean;
}

export function fillToolkitOptions(options?: ToolkitOptions): FilledToolkitOptions {
  const filledDoguOptions = fillDoguOptions(options?.dogu);
  const filledGamiumOptions =
    options?.gamium === true //
      ? fillGamiumOptions()
      : options?.gamium === false
      ? null
      : fillGamiumOptions(options?.gamium);
  return {
    dogu: filledDoguOptions,
    gamium: filledGamiumOptions,
    appium: options?.appium ?? false,
  };
}
